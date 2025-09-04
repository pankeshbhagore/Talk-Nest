import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Snackbar } from "@mui/material";
import { AuthContext } from '../contexts/AuthContext';
import styles from './styles/Authentication.module.css';

const defaultTheme = createTheme();

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0); // 0 = login, 1 = signup
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    try {
      if (formState === 0) await handleLogin(username, password);
      if (formState === 1) {
        let result = await handleRegister(name, username, password);
        setUsername(""); setPassword(""); setMessage(result); setError(""); setOpen(true); setFormState(0);
      }
    } catch (err) {
      let msg = err?.response?.data?.message || err.message || "Something went wrong";
      setError(msg);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container className={styles.authContainer}>
        <CssBaseline />

        {/* Left random image 70% */}
        <Grid item className={styles.authLeft} style={{ backgroundImage: `url('https://picsum.photos/1920/1080?random=${Date.now()}')` }} />

        {/* Right login/signup box 30% */}
        <Grid item className={styles.authRight}>
          <Box className={styles.authPaper}>
            <Avatar className={styles.authAvatar}><LockOutlinedIcon /></Avatar>
            <Typography component="h1" variant="h5" className={styles.authTitle}>
              {formState === 0 ? "Sign In" : "Sign Up"}
            </Typography>

            <Box className={styles.authToggleButtons}>
              <Button variant={formState===0?"contained":"outlined"} onClick={()=>setFormState(0)}>Sign In</Button>
              <Button variant={formState===1?"contained":"outlined"} onClick={()=>setFormState(1)}>Sign Up</Button>
            </Box>

            <Box>
              {formState === 1 && 
                <TextField margin="normal" required fullWidth label="Full Name" value={name} onChange={(e)=>setName(e.target.value)} className={styles.authTextField} />
              }
              <TextField margin="normal" required fullWidth label="Username" value={username} onChange={(e)=>setUsername(e.target.value)} className={styles.authTextField} />
              <TextField margin="normal" required fullWidth type="password" label="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className={styles.authTextField} />
            </Box>

            <p className={styles.authError}>{error}</p>

            <Button type="button" fullWidth onClick={handleAuth} className={styles.authButton}>
              {formState === 0 ? "Login" : "Register"}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar open={open} autoHideDuration={4000} message={message} onClose={()=>setOpen(false)} />
    </ThemeProvider>
  );
}



