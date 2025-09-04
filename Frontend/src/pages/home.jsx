import React, { useContext, useState, useEffect } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import styles from "./styles/home.module.css";
import { Button, IconButton, TextField, Tooltip, Snackbar, Alert } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { addToUserHistory, getHistoryOfUser, removeFromUserHistory } = useContext(AuthContext);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const history = await getHistoryOfUser();
        setRecentMeetings(history.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecent();
  }, []);

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) {
      return setSnackbar({ open: true, message: "Enter a meeting code!", severity: "warning" });
    }
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  const handleGenerateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setMeetingCode(code);
  };

  const handleCopy = async () => {
    if (!meetingCode) return;
    try {
      await navigator.clipboard.writeText(meetingCode);
      setSnackbar({ open: true, message: "Code copied!", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to copy code", severity: "error" });
    }
  };

  const handleDeleteMeeting = async (code) => {
    await removeFromUserHistory(code);
    setRecentMeetings(prev => prev.filter(m => m.meetingCode !== code));
    setSnackbar({ open: true, message: "Deleted from history", severity: "info" });
  };

  const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  return (
    <>
      {/* NAVBAR */}
      <div className={styles.navBar}>
        <div className={styles.brand}>
          <h2>Talk-Nest</h2>
        </div>

        <div className={styles.navActions}>
          <Tooltip title="History">
            <IconButton onClick={() => navigate("/history")}>
              <RestoreIcon />
            </IconButton>
          </Tooltip>

          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
            variant="contained"
            color="error"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* MEET CONTAINER */}
      <div className={styles.meetContainer}>
        <div className={styles.leftPanel}>
          <h2>High-Quality Video Calls for Seamless Collaboration</h2>

          {/* Meeting Input */}
          <div className={styles.meetingInput}>
            <TextField
              value={meetingCode}
              onChange={e => setMeetingCode(e.target.value)}
              label="Meeting Code"
              variant="outlined"
              autoFocus
            />
            <Button onClick={handleJoinVideoCall} variant="contained">Join</Button>
            <Tooltip title="Generate Code">
              <IconButton onClick={handleGenerateCode}>
                <AutorenewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy Code">
              <IconButton onClick={handleCopy}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </div>

          {/* Recent Meetings */}
          {recentMeetings.length > 0 && (
            <div className={styles.recentMeetings}>
              <h3>Recent Meetings</h3>
              <ul>
                {recentMeetings.map((m, i) => (
                  <li key={i} className={styles.recentItem}>
                    <span>{m.meetingCode}</span>
                    <div>
                      <Button size="small" variant="outlined" onClick={() => navigate(`/${m.meetingCode}`)}>
                        Join
                      </Button>
                      <IconButton onClick={() => handleDeleteMeeting(m.meetingCode)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.rightPanel}>
          <img srcSet='/logo3.png' alt="Talk-Nest Logo" />
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={closeSnackbar}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default withAuth(HomeComponent);


