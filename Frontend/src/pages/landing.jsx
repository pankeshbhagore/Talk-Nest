import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../App.css";

export default function LandingPage() {
  const router = useNavigate();
  const [imgUrl, setImgUrl] = useState(`https://picsum.photos/600/600?random=${Math.floor(Math.random()*1000)}`);

   const refreshImage = () => {
  setImgUrl(`https://picsum.photos/600/600?random=${Math.floor(Math.random()*1000)}`);
};


  return (
    <div className="landingPageContainer">
      {/* Navbar */}
      <nav className="glassNav">
        <div className="navHeader">
          <h2>Talk-Nest</h2>
        </div>
        <div className="navlist">
          <p onClick={() => router("/Guest_User")}>Join as Guest</p>
          <p onClick={() => router("/auth")}>Register</p>
          <div onClick={() => router("/auth")} role="button">
            <p>Login</p>
          </div>
        </div>
      </nav>

      {/* Main Landing Content */}
      <div className="landingMainContainer">
        {/* Left Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h1>
            <span style={{ color: "orange" }}>Connect</span> With Your{" "}
            <span style={{ color: "purple" }}>Loved Ones</span>
          </h1>

          <p className="tagline">A New Nest For Your Next Talk 💬</p>

          <motion.div
            role="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/auth">🚀 Get Started</Link>
          </motion.div>
        </motion.div>

        {/* Right Image Section */}
        <motion.div
          className="imageSection"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={imgUrl} // important for AnimatePresence to detect change
              src={imgUrl}
              alt="Landing Visual"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            />
          </AnimatePresence>
          <button onClick={refreshImage} className="refreshBtn">
            🔄 Refresh Image
          </button>
        </motion.div>
      </div>
    </div>
  );
}


























