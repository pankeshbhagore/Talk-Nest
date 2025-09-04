import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, IconButton, TextField, Button, Tooltip, Snackbar, Alert, Select, MenuItem } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import styles from "./styles/history.module.css";

export default function HistoryComponent() {
  const { currentUser, getHistoryOfUser, removeFromUserHistory, clearUserHistory } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [search, setSearch] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("all");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const routeTo = useNavigate();
  const [visibleCount, setVisibleCount] = useState(6); // Pagination

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        const sorted = history.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMeetings(sorted);
        setFilteredMeetings(sorted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, []);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${day}/${month}/${year} - ${time}`;
  };

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setSnackbar({ open: true, message: "Meeting code copied!", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to copy code", severity: "error" });
    }
  };

  const handleDeleteMeeting = async (code) => {
    await removeFromUserHistory(code);
    setMeetings(prev => prev.filter(m => m.meetingCode !== code));
    setFilteredMeetings(prev => prev.filter(m => m.meetingCode !== code));
    setSnackbar({ open: true, message: "Meeting deleted", severity: "info" });
  };

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      await clearUserHistory();
      setMeetings([]);
      setFilteredMeetings([]);
      setSnackbar({ open: true, message: "History cleared", severity: "info" });
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    filterMeetings(e.target.value, creatorFilter);
  };

  const handleCreatorFilter = (e) => {
    setCreatorFilter(e.target.value);
    filterMeetings(search, e.target.value);
  };

  const filterMeetings = (searchValue, creator) => {
    const query = searchValue.toLowerCase();
    const filtered = meetings.filter(m => {
      const matchSearch = 
        m.meetingCode.toLowerCase().includes(query) ||
        (m.owner && m.owner.toLowerCase().includes(query)) ||
        formatDateTime(m.date).toLowerCase().includes(query);
      const matchCreator = creator === "all" ? true : (m.owner || "You") === creator;
      return matchSearch && matchCreator;
    });
    setFilteredMeetings(filtered);
  };

  const uniqueCreators = [...new Set(meetings.map(m => m.owner || "You"))];

  const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const loadMore = () => setVisibleCount(prev => prev + 6);

  return (
    <div className={styles.historyContainer}>
      <div className={styles.topBar}>
        <IconButton className={styles.homeButton} onClick={() => routeTo("/home")}>
          <HomeIcon sx={{ color: "#fff" }} />
        </IconButton>

        <TextField
          placeholder="Search meetings..."
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearch}
          className={styles.searchBox}
        />

        <Select
          value={creatorFilter}
          onChange={handleCreatorFilter}
          className={styles.creatorFilter}
        >
          <MenuItem value="all">All Creators</MenuItem>
          {uniqueCreators.map((creator, idx) => (
            <MenuItem key={idx} value={creator}>{creator}</MenuItem>
          ))}
        </Select>

        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteSweepIcon />}
          onClick={handleClearHistory}
        >
          Clear History
        </Button>
      </div>

      {filteredMeetings.length !== 0 ? (
        <div className={styles.cardsWrapper}>
          {filteredMeetings.slice(0, visibleCount).map((e, i) => (
            <Card
              key={i}
              variant="outlined"
              className={`${styles.historyCard} ${e.owner === currentUser?.username ? styles.currentUserMeeting : ""}`}
            >
              <CardContent>
                <div className={styles.cardHeader}>
                  <Typography className={styles.meetingCode}>{e.meetingCode}</Typography>
                  <div>
                    <Tooltip title="Copy Code">
                      <IconButton size="small" onClick={() => handleCopy(e.meetingCode)}>
                        <ContentCopyIcon fontSize="small" sx={{ color: "#90caf9" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Meeting">
                      <IconButton size="small" onClick={() => handleDeleteMeeting(e.meetingCode)}>
                        <DeleteIcon fontSize="small" sx={{ color: "#f44336" }} />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>

                <Typography className={styles.meetingDate}>{formatDateTime(e.date)}</Typography>
                <Typography className={styles.meetingDuration}>Duration: {e.duration || "30 mins"}</Typography>
                <Typography className={styles.meetingOwner}>Created By: {e.owner || "You"}</Typography>
              </CardContent>
            </Card>
          ))}
          {visibleCount < filteredMeetings.length && (
            <Button variant="outlined" onClick={loadMore} className={styles.loadMoreBtn}>
              Load More
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.noHistory}>
          <Typography>No history available</Typography>
        </div>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={closeSnackbar}>
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}






