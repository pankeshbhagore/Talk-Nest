import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button, Tooltip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import PushPinIcon from '@mui/icons-material/PushPin';
import GroupIcon from '@mui/icons-material/Group';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import GridViewIcon from '@mui/icons-material/GridView';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import CelebrationIcon from '@mui/icons-material/Celebration';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Rnd } from "react-rnd";
import styles from "./styles/videoComponent.module.css";
import server from "../environment";

const server_url = server;
var connections = {};
const peerConfigConnections = { "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }] };

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoref = useRef();
  const videoRef = useRef([]);
  const chatEndRef = useRef();

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState([]);
  const [audio, setAudio] = useState();
  const [screen, setScreen] = useState();
  const [showModal, setModal] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);

  // Chat window drag/resize
  const [chatPosition, setChatPosition] = useState({ x: 20, y: 20 });
  const [chatSize, setChatSize] = useState({ width: 350, height: 420 });
  const [chatMinimized, setChatMinimized] = useState(false);

  // New advanced features
  const [hideSelf, setHideSelf] = useState(false);
  const [pinnedVideo, setPinnedVideo] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState({}); // { socketId: true }
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "speaker"
  const [mutedPeers, setMutedPeers] = useState({}); // { socketId: true }
  const [reactions, setReactions] = useState([]);   // [{ id, socketId, emoji }]

  // Map socketId -> video element ref for local mute control
  const remoteVideoEls = useRef({}); // { socketId: HTMLVideoElement }

  useEffect(() => { getPermissions(); }, []);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoAvailable(!!videoPermission);
      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioAvailable(!!audioPermission);
      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
      if (videoAvailable || audioAvailable) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
        if (stream) {
          window.localStream = stream;
          if (localVideoref.current) localVideoref.current.srcObject = stream;
        }
      }
    } catch (error) { console.log(error); }
  };

  useEffect(() => { if (video !== undefined && audio !== undefined) getUserMedia(); }, [video, audio]);
  const getMedia = () => { setVideo(videoAvailable); setAudio(audioAvailable); connectToSocketServer(); };

  const getUserMediaSuccess = (stream) => {
    try { window.localStream.getTracks().forEach(track => track.stop()); } catch (e) { }
    window.localStream = stream;
    if (localVideoref.current) localVideoref.current.srcObject = stream;
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(stream);
      connections[id].createOffer().then(description => {
        connections[id].setLocalDescription(description)
          .then(() => socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription })))
          .catch(e => console.log(e));
      });
    }
    stream.getTracks().forEach(track => track.onended = () => handleStreamEnded());
  };

  const handleStreamEnded = () => {
    setVideo(false); setAudio(false);
    try { localVideoref.current?.srcObject?.getTracks().forEach(track => track.stop()); } catch (e) { }
    const blackSilence = new MediaStream([black(), silence()]);
    window.localStream = blackSilence;
    if (localVideoref.current) localVideoref.current.srcObject = blackSilence;
    for (let id in connections) {
      connections[id].addStream(blackSilence);
      connections[id].createOffer().then(description => {
        connections[id].setLocalDescription(description)
          .then(() => socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription })))
          .catch(e => console.log(e));
      });
    }
  };

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess).catch(e => console.log(e));
    }
  };

  const getDislayMedia = () => {
    if (screen && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then(getDislayMediaSuccess).catch(e => console.log(e));
    }
  };

  useEffect(() => { if (screen !== undefined) getDislayMedia(); }, [screen]);

  const getDislayMediaSuccess = (stream) => {
    try { window.localStream.getTracks().forEach(track => track.stop()); } catch (e) { }
    window.localStream = stream;
    if (localVideoref.current) localVideoref.current.srcObject = stream;
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(stream);
      connections[id].createOffer().then(description => {
        connections[id].setLocalDescription(description)
          .then(() => socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription })))
          .catch(e => console.log(e));
      });
    }
    stream.getTracks().forEach(track => track.onended = () => { setScreen(false); getUserMedia(); });
  };

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === 'offer') {
            connections[fromId].createAnswer().then(description => {
              connections[fromId].setLocalDescription(description)
                .then(() => socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription })))
                .catch(e => console.log(e));
            });
          }
        }).catch(e => console.log(e));
      }
      if (signal.ice) connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-call', window.location.href, username);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on('chat-message', addMessage);
      socketRef.current.on('user-left', id => {
        setVideos(videos => videos.filter(v => v.socketId !== id));
        setRaisedHands(prev => {
          const p = { ...prev }; delete p[id]; return p;
        });
      });

      socketRef.current.on('user-joined', (id, clients) => handleUserJoined(id, clients));

      // OPTIONAL events (server may not implement; safe no-ops if not received)
      socketRef.current.on('raise-hand', (sid, raised) => {
        setRaisedHands(prev => ({ ...prev, [sid]: raised }));
      });
      socketRef.current.on('reaction', ({ socketId, emoji }) => {
        const id = `${socketId}-${Date.now()}`;
        setReactions(r => [...r, { id, socketId, emoji }]);
        setTimeout(() => setReactions(r => r.filter(x => x.id !== id)), 2200);
      });
      socketRef.current.on('participants', (list) => {
        // Optionally handle participant metadata from server
        // list: [{socketId, username}]
      });
    });
  };

  const handleUserJoined = (id, clients) => {
    clients.forEach(socketListId => {
      connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
      connections[socketListId].onicecandidate = e => {
        if (e.candidate) socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': e.candidate }));
      };
      connections[socketListId].onaddstream = event => handleRemoteStream(socketListId, event.stream);
      connections[socketListId].addStream(window.localStream || new MediaStream([black(), silence()]));
    });
    if (id === socketIdRef.current) {
      for (let id2 in connections) {
        if (id2 === socketIdRef.current) continue;
        try { connections[id2].addStream(window.localStream); } catch (e) { }
        connections[id2].createOffer().then(description => {
          connections[id2].setLocalDescription(description)
            .then(() => socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription })))
            .catch(e => console.log(e));
        });
      }
    }
  };

  const handleRemoteStream = (socketListId, stream) => {
    const existing = videoRef.current.find(v => v.socketId === socketListId);
    if (existing) {
      setVideos(videos => videos.map(v => v.socketId === socketListId ? { ...v, stream } : v));
      videoRef.current = videos;
    } else {
      const newVideo = { socketId: socketListId, stream, autoplay: true, playsinline: true };
      setVideos(videos => [...videos, newVideo]);
      videoRef.current = [...videos, newVideo];
    }
  };

  const silence = () => { const ctx = new AudioContext(); const oscillator = ctx.createOscillator(); const dst = oscillator.connect(ctx.createMediaStreamDestination()); oscillator.start(); ctx.resume(); return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false }); };
  const black = ({ width = 640, height = 480 } = {}) => { const canvas = Object.assign(document.createElement("canvas"), { width, height }); canvas.getContext('2d').fillRect(0, 0, width, height); const stream = canvas.captureStream(); return Object.assign(stream.getVideoTracks()[0], { enabled: false }); };

  const handleVideo = () => setVideo(!video);
  const handleAudio = () => setAudio(!audio);
  const handleScreen = () => setScreen(!screen);
  const handleEndCall = () => { try { localVideoref.current?.srcObject?.getTracks().forEach(t => t.stop()); } catch (e) { } window.location.href = "/"; };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages(prev => [...prev, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) setNewMessages(prev => prev + 1);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socketRef.current.emit('chat-message', message, username);
    setMessage("");
  };

  const connect = () => { setAskForUsername(false); getMedia(); };

  // Raise hand
  const toggleRaiseHand = () => {
    const next = !handRaised;
    setHandRaised(next);
    setRaisedHands(prev => ({ ...prev, [socketIdRef.current]: next }));
    socketRef.current.emit("raise-hand", socketIdRef.current, next);
  };

  // Emoji reactions
  const sendReaction = (emoji) => {
    const socketId = socketIdRef.current;
    const id = `${socketId}-${Date.now()}`;
    setReactions(r => [...r, { id, socketId, emoji }]);
    setTimeout(() => setReactions(r => r.filter(x => x.id !== id)), 2200);
    socketRef.current.emit("reaction", { socketId, emoji });
  };

  // Toggle local mute for a specific remote tile (local playback only)
  const toggleMutePeer = (socketId) => {
    setMutedPeers(prev => {
      const next = { ...prev, [socketId]: !prev[socketId] };
      const el = remoteVideoEls.current[socketId];
      if (el) el.muted = !!next[socketId];
      return next;
    });
  };

  // Render helpers
  const renderRemoteTile = (v) => {
    const isPinned = pinnedVideo === v.socketId && viewMode === "speaker";
    return (
      <div
        key={v.socketId}
        className={`${styles.videoTile} ${isPinned ? styles.pinnedTile : ""}`}
        onClick={() => setPinnedVideo(v.socketId)}
      >
        <div className={styles.tileHeader}>
          <span className={styles.tileName}>User {v.socketId.slice(0, 5)}</span>
          <div className={styles.tileActions}>
            <Tooltip title={mutedPeers[v.socketId] ? "Unmute this user (local)" : "Mute this user (local)"}>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleMutePeer(v.socketId); }}>
                {mutedPeers[v.socketId] ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Pin / Focus">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setPinnedVideo(v.socketId); setViewMode("speaker"); }}>
                <PushPinIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Reaction bubble */}
        {reactions.filter(r => r.socketId === v.socketId).map(r => (
          <div key={r.id} className={styles.reactionBubble}>{r.emoji}</div>
        ))}

        {/* Hand raise badge */}
        {raisedHands[v.socketId] && (
          <div className={styles.handBadge}><PanToolAltIcon fontSize="small" /> Hand Raised</div>
        )}

        <video
          data-socket={v.socketId}
          ref={ref => {
            if (ref && v.stream) {
              ref.srcObject = v.stream;
              remoteVideoEls.current[v.socketId] = ref;
              // Apply local mute state if already toggled
              ref.muted = !!mutedPeers[v.socketId];
            }
          }}
          autoPlay
          className={styles.remoteVideo}
        />
      </div>
    );
  };

  const gridVideos = videos.map(renderRemoteTile);
  const speakerMain = pinnedVideo
    ? videos.find(v => v.socketId === pinnedVideo)
    : videos[0];

  return (
    <div>
      {askForUsername ?
        <div className={styles.lobbyContainer}>
          <div className={styles.stars}></div>
          <h2>Enter Into Lobby :- </h2>
          <TextField
            className={styles.lobbyInput}
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            variant="outlined"
          />
          <br /><br />
          <Button
            className={styles.lobbyButton}
            variant="contained"
            onClick={connect}
          >
            Connect
          </Button>
          <br /><br /><br />
          <video
            className={styles.lobbyVideo}
            ref={localVideoref}
            autoPlay
            muted
          ></video>
        </div>
        :
        <div className={styles.meetVideoContainer}>
          {/* Draggable Chat */}
          {showModal &&
            <Rnd
              size={{ width: chatSize.width, height: chatSize.height }}
              position={{ x: chatPosition.x, y: chatPosition.y }}
              onDragStop={(e, d) => setChatPosition({ x: d.x, y: d.y })}
              onResizeStop={(e, dir, ref, delta, pos) => { setChatSize({ width: parseInt(ref.style.width), height: parseInt(ref.style.height) }); setChatPosition(pos); }}
              minWidth={280} minHeight={220} bounds="window"
              className={styles.chatRoom}
            >
              <div className={styles.chatContainer}>
                <h1>Chat</h1>
                {!chatMinimized && (
                  <>
                    <div className={styles.chattingDisplay}>
                      {messages.length ? messages.map((item, index) => (
                        <div key={index} className={styles.chatMessage}>
                          <p className={styles.chatSender}>{item.sender}</p>
                          <p className={styles.chatText}>{item.data}</p>
                        </div>
                      )) : <p>No Messages Yet</p>}
                      <div ref={chatEndRef}></div>
                    </div>
                    <div className={styles.chattingArea}>
                      <TextField value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message" variant="outlined" size="small" style={{ flex: 1, marginRight: "5px" }} />
                      <Button variant="contained" onClick={sendMessage}>Send</Button>
                    </div>
                  </>
                )}
                <div className={styles.chatFooterBar}>
                  <Button size="small" onClick={() => setChatMinimized(!chatMinimized)}>{chatMinimized ? "Maximize" : "Minimize"}</Button>
                  <div className={styles.reactions}>
                    <IconButton size="small" onClick={() => sendReaction("👍")}><span role="img" aria-label="thumbs">👍</span></IconButton>
                    <IconButton size="small" onClick={() => sendReaction("😂")}><span role="img" aria-label="joy">😂</span></IconButton>
                    <IconButton size="small" onClick={() => sendReaction("🎉")}><span role="img" aria-label="tada">🎉</span></IconButton>
                    <IconButton size="small" onClick={() => sendReaction("👏")}><span role="img" aria-label="clap">👏</span></IconButton>
                  </div>
                </div>
              </div>
            </Rnd>
          }

          {/* Bottom Controls */}
          <div className={styles.buttonContainers}>
            <Tooltip title={video ? "Turn camera off" : "Turn camera on"}>
              <IconButton onClick={handleVideo} style={{ color: "white" }}>
                {video ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title={audio ? "Mute mic" : "Unmute mic"}>
              <IconButton onClick={handleAudio} style={{ color: "white" }}>
                {audio ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
            </Tooltip>

            {screenAvailable &&
              <Tooltip title={screen ? "Stop sharing" : "Share screen"}>
                <IconButton onClick={handleScreen} style={{ color: "white" }}>
                  {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                </IconButton>
              </Tooltip>
            }

            <Tooltip title={hideSelf ? "Show self video" : "Hide self video"}>
              <IconButton onClick={() => setHideSelf(!hideSelf)} style={{ color: "white" }}>
                {hideSelf ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Raise / Lower hand">
              <IconButton onClick={toggleRaiseHand} style={{ color: handRaised ? "#ffd54f" : "white" }}>
                <PanToolAltIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={viewMode === "grid" ? "Switch to speaker view" : "Switch to grid view"}>
              <IconButton onClick={() => setViewMode(viewMode === "grid" ? "speaker" : "grid")} style={{ color: "white" }}>
                {viewMode === "grid" ? <SlideshowIcon /> : <GridViewIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title={showParticipants ? "Hide participants" : "Show participants"}>
              <IconButton onClick={() => setShowParticipants(!showParticipants)} style={{ color: "white" }}>
                <GroupIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Celebrate">
              <IconButton onClick={() => sendReaction("🎉")} style={{ color: "white" }}>
                <CelebrationIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Chat">
              <Badge badgeContent={newMessages} max={999} color='warning'>
                <IconButton onClick={() => { setModal(!showModal); if (showModal) setNewMessages(0); }} style={{ color: "white" }}>
                  <ChatIcon />
                </IconButton>
              </Badge>
            </Tooltip>

            <Tooltip title="End call">
              <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                <CallEndIcon />
              </IconButton>
            </Tooltip>
          </div>

          {/* Local floating preview (hideable) */}
          {!hideSelf && (
            <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>
          )}

          {/* Participants side panel */}
          {showParticipants && (
            <div className={styles.participantsList}>
              <div className={styles.participantsHeader}>
                <GroupIcon fontSize="small" />
                <span>Participants</span>
              </div>
              <ul className={styles.participantsUl}>
                <li key="self">
                  <span className={styles.dotSelf} /> {username || "You"}
                  {handRaised && <span className={styles.handInline}>✋</span>}
                </li>
                {videos.map(v => (
                  <li key={v.socketId}>
                    <span className={styles.dotRemote} /> User {v.socketId.slice(0, 5)} {raisedHands[v.socketId] && <span className={styles.handInline}>✋</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main video area */}
          {viewMode === "speaker" && speakerMain ? (
            <div className={styles.speakerLayout}>
              {/* Reactions for speaker */}
              {reactions.filter(r => r.socketId === (pinnedVideo ?? speakerMain.socketId)).map(r => (
                <div key={r.id} className={styles.reactionBubble}>{r.emoji}</div>
              ))}

              {/* Hand badge for speaker */}
              {raisedHands[pinnedVideo ?? speakerMain.socketId] && (
                <div className={styles.handBadge}><PanToolAltIcon fontSize="small" /> Hand Raised</div>
              )}

              <video
                className={styles.speakerVideo}
                ref={ref => {
                  if (!speakerMain) return;
                  if (ref && speakerMain.stream) {
                    ref.srcObject = speakerMain.stream;
                  }
                }}
                autoPlay
              />
              <div className={styles.speakerMeta}>
                <span className={styles.tileName}>User {(pinnedVideo ?? speakerMain.socketId).slice(0, 5)}</span>
                <Button size="small" startIcon={<PushPinIcon />} onClick={() => setViewMode("grid")}>Unpin</Button>
              </div>

              <div className={styles.speakerThumbs}>
                {videos.filter(v => v.socketId !== (pinnedVideo ?? speakerMain.socketId)).map(renderRemoteTile)}
              </div>
            </div>
          ) : (
            <div className={styles.conferenceView}>
              {gridVideos}
            </div>
          )}
        </div>
      }
    </div>
  );
}

