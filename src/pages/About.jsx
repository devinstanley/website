import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { generateVine, segmentsToPath, generateVerticalLine } from "../utils/VineUtils";
import '../styles/About.css'

const milestones = [
  {
    id: 1,
    title: "Bachelors at SDSU",
    content:
      "I graduated with a Bachelors in Applied Mathematics with an Emphasis in Computational Science from San Diego State University. ",
    positionOnPath: 0.15,
  },
  {
    id: 2,
    title: "Internship 2022",
    content:
      "",
    positionOnPath: 0.5,
  },
  {
    id: 3,
    title: "Masters Degree",
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

const About = () => {
  const [scrollValue, setScrollValue] = useState(0);
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
            const offset = 250;
            const cardX = side === "right" ? pathPoint.x + offset : pathPoint.x - offset;
            const cardY = pathPoint.y + 15;


            const midX = (pathPoint.x + cardX) / 2.2;
            const controlY = pathPoint.y - 100; // slightly above for curve
            const branchPath = `M ${pathPoint.x},${pathPoint.y} Q ${midX},${controlY} ${cardX},${cardY}`;

            const vineYRatio = pathPoint.y / window.innerHeight;
            const branchColor = interpolateColor(
              vineYRatio,
              gradientStops[0].color,
              gradientStops[1].color
            );

            return (
                <AnimatePresence key={`line-${idx}`}>
                  {visible && (
                    <motion.path
                      className="milestone-branch-path"
                      d={branchPath}
                      stroke={branchColor}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      exit={{ pathLength: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  )}
                </AnimatePresence>
              );
          })}
        </svg>

        {/* Dot traveling the path */}
        <motion.div
          className="traveling-dot"
          style={{
            top: dotY,
            left: dotX
          }}
        />

        {/* Milestone cards */}
        {milestones.map(({ id, title, content, positionOnPath }, idx) => {
          const visible = scrollValue >= positionOnPath + 0.08;


          if (!pathRef.current || pathLength === 0) return null;

          const point = pathRef.current.getPointAtLength(pathLength * positionOnPath);
          const side = idx % 2 === 0 ? "right" : "left";
          const cardOffsetX = 150;
          
          const cardWidth = window.innerWidth / 4

          const cardX = side === "right" ? point.x + cardOffsetX : point.x - cardOffsetX - cardWidth;
          const cardY = point.y;

          

          return (
            <AnimatePresence key={id}>
              {visible && (
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
                  <h3>{title}</h3>
                  <p>{content}</p>
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