import React from 'react';
import { motion } from 'framer-motion';
import { 
  Kanban, 
  FileText, 
  Clock, 
  Users 
} from 'lucide-react';
import './App.css';

// Animated TrackIt Loop SVG Logo Component with Framer Motion
export const AnimatedTrackItLoopLogo = ({ size = 104 }) => {
  return (
    <motion.div
      className="logo-presentation"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
    >
      <div className="logo-glow-ring" />
      
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg-box"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" /> {/* Vivid Blue */}
            <stop offset="100%" stopColor="#7c3aed" /> {/* Vivid Purple */}
          </linearGradient>
          <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f3e8ff" />
          </linearGradient>
        </defs>

        {/* Rounded Squircle Base */}
        <rect width="100" height="100" rx="28" fill="url(#logoGrad)" />

        {/* Inner Clean Border */}
        <rect 
          x="2" 
          y="2" 
          width="96" 
          height="96" 
          rx="26" 
          stroke="rgba(255,255,255,0.3)" 
          strokeWidth="1.5" 
        />

        {/* Animated Infinite Loop Track Path */}
        <motion.path
          d="M32 50 C32 38 43 38 50 50 C57 62 68 62 68 50 C68 38 57 38 50 50 C43 62 32 62 32 50 Z"
          stroke="url(#pathGrad)"
          strokeWidth="8.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />

        {/* Agile Track Center Pulse Dot */}
        <motion.circle
          cx="50"
          cy="50"
          r="4.5"
          fill="#60a5fa"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
};

export default function App() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  // Smooth floating animation on the edges
  const leftBlobVariants = {
    animate: {
      x: [0, 45, -30, 0],
      y: [0, 55, -45, 0],
      scale: [1, 1.1, 0.95, 1],
      transition: { duration: 18, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const rightBlobVariants = {
    animate: {
      x: [0, -45, 30, 0],
      y: [0, -50, 40, 0],
      scale: [1, 1.12, 0.96, 1],
      transition: { duration: 20, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className="landing-viewport">
      {/* ================= ONLY BLUE & PURPLE BLOBS ON SIDES, WHITE BACKGROUND ================= */}
      <div className="blob-canvas" aria-hidden="true">
        {/* LEFT SIDE: BLUE BLOBS */}
        <motion.div 
          className="ambient-blob blob-left-top"
          variants={leftBlobVariants}
          animate="animate"
        />
        <motion.div 
          className="ambient-blob blob-left-bottom"
          variants={leftBlobVariants}
          animate="animate"
        />

        {/* RIGHT SIDE: PURPLE BLOBS */}
        <motion.div 
          className="ambient-blob blob-right-top"
          variants={rightBlobVariants}
          animate="animate"
        />
        <motion.div 
          className="ambient-blob blob-right-bottom"
          variants={rightBlobVariants}
          animate="animate"
        />
      </div>

      {/* Subtle Engineering Grid Overlay */}
      <div className="pattern-grid" aria-hidden="true" />

      {/* ================= BOOTSTRAP MAIN CONTENT CONTAINER ================= */}
      <div className="container position-relative z-2">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-9 d-flex flex-column align-items-center text-center py-5">
            
            <motion.div
              className="content-wrapper w-100"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Ecosystem Badge */}
              <motion.div variants={itemVariants}>
                <div className="ecosystem-badge">
                  <span className="live-pulse" />
                  <span>Creative Hub Ecosystem</span>
                </div>
              </motion.div>

              {/* Animated Title Logo */}
              <motion.div variants={itemVariants}>
                <AnimatedTrackItLoopLogo size={106} />
              </motion.div>

              {/* Brand Title */}
              <motion.h1 className="brand-title" variants={itemVariants}>
                TrackIt <span className="gradient-brand">Loop</span>
              </motion.h1>

              {/* Tagline */}
              <motion.p className="brand-tagline" variants={itemVariants}>
                Where ideas loop into delivery. A flagship <strong>Creative Hub</strong> workspace designed for{' '}
                <strong>fluid ideation</strong>, <strong>team brainstorming discussions</strong>, and{' '}
                <strong>structured agile project execution</strong>.
              </motion.p>

              {/* Feature Chips */}
              <motion.div className="hybrid-chips-row" variants={itemVariants}>
                <div className="hybrid-chip">
                  <FileText size={16} color="#2563eb" />
                  <span>Ideation Canvases</span>
                </div>
                <div className="hybrid-chip">
                  <Kanban size={16} color="#7c3aed" />
                  <span>Agile Boards & Sprints</span>
                </div>
                <div className="hybrid-chip">
                  <Clock size={16} color="#2563eb" />
                  <span>Time Tracking</span>
                </div>
                <div className="hybrid-chip">
                  <Users size={16} color="#7c3aed" />
                  <span>Team Discussions</span>
                </div>
              </motion.div>





            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
