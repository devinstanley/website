import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { generateVine, segmentsToPath, generateVerticalLine, VineTip } from "../utils/VineUtils";
import '../styles/About.css'

const milestones = [
  {
    id: 1,
    date: "2019 - 2022",
    title: "BS at SDSU",
    summary: "I earned my B.S. in Applied Mathematics with an emphasis in Computational Science. I graduated summa cum laude as a Merit Scholar.",
    content:
      "",
    positionOnPath: 0.25,
  },
  {
    id: 2,
    date: "2022 - 2023",
    title: "Internship",
    summary: "I worked as an Applied Math Intern after completing my undergraduate degree. During this time I built Python workup scripts and learned Mathematica and LabVIEW.",
    content:
      "",
    positionOnPath: 0.45,
  },
  {
    id: 3,
    date: "2022 - 2024",
    title: "MS at SDSU",
    summary: "I pursued my M.S. in Computational Science with an emphasis in Data Science. My thesis research focused on Compress Sensing Seismic Migration.",
    content:
      "",
    positionOnPath: 0.65,
  },
  {
    id: 4,
    date: "2023 - Current",
    title: "Software Developer",
    summary: "I accepted a position as a Junior Software Developer at the company where I had interned. I took ownership of the codebase and expanded it with C# and Python tools.",
    content:
      "",
    positionOnPath: 0.85,
  },
];

const gradientStops = [
  { offset: 0, color: "#6DBE45" },  // light green at top
  { offset: 1, color: "#2E7D32" },  // dark green at bottom
];

const hexToRgb = (hex) => {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

const rgbToHex = ([r, g, b]) => {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

const interpolateColor = (t, startHex, endHex) => {
  const startRGB = hexToRgb(startHex);
  const endRGB = hexToRgb(endHex);
  const result = startRGB.map((start, i) =>
    Math.round(start + t * (endRGB[i] - start))
  );
  return rgbToHex(result);
};

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const AnimatedBranch = ({
  branchPath,
  branchColor,
  positionOnPath, // where branch starts (0–1 along vine scroll)
  scrollProgress,
  onComplete,
}) => {
  const pathRef = useRef(null);
  const dashOffset = useMotionValue(0);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (!pathRef.current) return;
    const length = pathRef.current.getTotalLength();
    setPathLength(length);
    dashOffset.set(length); // fully hidden at start
  }, [branchPath]);

  useEffect(() => {
    if (pathLength === 0) return;

    // Branch Grows over 5% Scroll Progress
    const start = positionOnPath;
    const end = positionOnPath + 0.05;

    const unsubscribe = scrollProgress.on("change", (val) => {
      const t = (val - start) / (end - start);
      const clamped = Math.max(0, Math.min(1, t));

      dashOffset.set(pathLength * (1 - clamped));

      if (clamped >= 1 && onComplete) onComplete();
    });

    return () => unsubscribe();
  }, [pathLength, positionOnPath, scrollProgress, onComplete]);

  return (
    <motion.path
      ref={pathRef}
      d={branchPath}
      stroke={branchColor}
      strokeWidth="3"
      fill="none"
      strokeDasharray={pathLength}
      strokeDashoffset={dashOffset}
    />
  );
};

const About = () => {
  const [scrollValue, setScrollValue] = useState(0);
  const [branchesCompleted, setBranchesCompleted] = useState({});
  const dotX = useMotionValue(window.innerWidth/2);
  const dotY = useMotionValue(window.innerHeight);
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const rawScroll = useMotionValue(0);
  const dashOffset = useMotionValue(0);
  const scrollProgress = useSpring(rawScroll, {
    stiffness: 200,
    damping: 90,
  });
  const [pathData, setPathData] = useState("");

  // Touch handling state
  const touchStartY = useRef(0);
  const lastTouchY = useRef(0);

  useEffect(() => 
    {
      const updatePath = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        setPathData(segmentsToPath(generateVerticalLine(w, h, 12)));
      };

      updatePath();
      window.addEventListener("resize", updatePath);
      return () => window.removeEventListener("resize", updatePath);
    }, 
  []);

  // Disable native scrolling
  // Handle both wheel (desktop) and touch (mobile) events
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      const current = rawScroll.get();
      const next = clamp(current + -e.deltaY * 0.00005, 0, 1);
      rawScroll.set(next);
    };
    
    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
      lastTouchY.current = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e) => {
      e.preventDefault();
      const currentY = e.touches[0].clientY;
      const deltaY = lastTouchY.current - currentY;
      lastTouchY.current = currentY;
      
      const current = rawScroll.get();
      const next = clamp(current + deltaY * 0.001, 0, 1); // Adjust sensitivity here
      rawScroll.set(next);
    };
    
    const handleTouchEnd = () => {
      // No transition, just stop
    };
    
    // Add event listeners
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // Update dot position along path
useEffect(() => {
  if (!pathRef.current || pathLength === 0) return;

  const unsubscribe = scrollProgress.on("change", (val) => {
    const point = pathRef.current.getPointAtLength(pathLength * val);
    dotX.set(point.x);
    dotY.set(point.y);
    setScrollValue(val);
  });

  return () => unsubscribe();
}, [scrollProgress, pathLength]);

  useEffect(() => 
    {
      if (pathRef.current) {
        const length = pathRef.current.getTotalLength();
        setPathLength(length);
        dashOffset.set(length);
      }
    }, 
  [pathData]);

  // Update Path Length
  useEffect(() => 
    {
      const unsubscribe = scrollProgress.on("change", (val) => 
      {
        dashOffset.set(pathLength * (1 - val));
      });
      return () => unsubscribe();
    },
  [scrollProgress, pathLength]);

  const handleBranchComplete = (idx) => {
    setBranchesCompleted(prev => ({
      ...prev,
      [idx]: true
    }));
  };

  return (
    <>
      {/* Container fills viewport, no scroll */}
      <div className="viewport" ref={containerRef}>
        <svg className="svg"
          preserveAspectRatio="xMidYMid meet"
          viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vineGradient" x1="0" y1="0" x2="0" y2={window.innerHeight} gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6DBE45" />
              <stop offset="100%" stopColor="#2E7D32" />
            </linearGradient>
          </defs>

          <motion.path 
            className="vine-path"
            ref={pathRef}
            d={pathData}
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
          />
          {milestones.map(({ positionOnPath }, idx) => {
            if (!pathRef.current || pathLength === 0) return null;

            const visible = scrollValue >= positionOnPath + 0.05;

            const pathPoint = pathRef.current.getPointAtLength(pathLength * positionOnPath);
            const side = idx % 2 === 0 ? "right" : "left";
            const cardX = side === "right" ? 3 * window.innerWidth / 4 : window.innerWidth / 4;
            const cardY = pathPoint.y;

            const midX = side === "right" ? 5 * window.innerWidth / 8 : 3 * window.innerWidth / 8;
            const controlY = pathPoint.y - window.innerHeight / 10; // slightly above for curve
            const branchPath = `M ${pathPoint.x},${pathPoint.y} Q ${midX},${controlY} ${cardX},${cardY}`;

            const vineYRatio = pathPoint.y / window.innerHeight;
            const branchColor = interpolateColor(
              vineYRatio,
              gradientStops[0].color,
              gradientStops[1].color
            );

            return (
                <AnimatedBranch
                  key={`branch-${idx}`}
                  branchPath={branchPath}
                  branchColor={branchColor}
                  scrollProgress={scrollProgress}
                  positionOnPath={positionOnPath}
                  onComplete={() => handleBranchComplete(idx)}
                />
              );
          })}
        </svg>

        <AnimatePresence>
          {scrollValue < 0.05 && (
            <motion.div
              className="tut-card"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span>Scroll up to reveal professional milestones.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VineTip Traveling Path */}
        <motion.div
          className="vine-tip"
          style={{
            top: dotY,
            left: dotX
          }}>
            <VineTip className="vine-tip-svg"/>
        </motion.div>

        {/* Milestone cards */}
        {milestones.map(({ id, date, title, summary, content, positionOnPath }, idx) => {
          const branchVisible = scrollValue >= positionOnPath + 0.05;
          const cardVisible = branchVisible && branchesCompleted[idx];


          if (!pathRef.current || pathLength === 0) return null;

          const point = pathRef.current.getPointAtLength(pathLength * positionOnPath);
          const side = idx % 2 === 0 ? "right" : "left";
          
          const cardWidth = Math.min(window.innerWidth * 0.4, 500);

          const cardX = side === "right" ? window.innerWidth / 2 - cardWidth / 2 + window.innerWidth / 4: window.innerWidth / 2 - cardWidth / 2 - window.innerWidth / 4;
          const cardY = point.y;

          return (
            <AnimatePresence key={id}>
              {cardVisible && (
                <motion.div
                  className="milestone-card"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    top: cardY,
                    left: cardX,
                    width: cardWidth
                  }}
                >
                  <div className="card-title">{title}</div>
                  <div className="card-date">{date}</div>
                  <div className="card-summary">{summary}</div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>
    </>
  );
};

export default About;