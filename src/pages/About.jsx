import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

const milestones = [
  {
    id: 1,
    title: "Bachelors at SDSU",
    content:
      "I graduated with my Bachelors in Applied Mathematics with an Emphasis in Computational Science from San Diego State University. ",
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

const generateZigZagPath = (width, height, segments = 3) => {
  const stepY = height / segments;
  const amplitude = width / 2;

  let path = `M ${width / 2} 0 `; // start in the middle top

  for (let i = 1; i <= segments; i++) {
    const direction = i % 2 === 0 ? 1 : -1;
    const controlX = width / 2 + direction * amplitude;
    const controlY = stepY * (i - 0.5);
    const endX = width / 2;
    const endY = stepY * i;
    path += `Q ${controlX} ${controlY}, ${endX} ${endY} `;
  }

  return path;
};

const About = () => {
  const [scrollValue, setScrollValue] = useState(0);
  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);
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

  useEffect(() => 
    {
      const updatePath = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        setPathData(generateZigZagPath(w, h, 3));
      };

      updatePath();
      window.addEventListener("resize", updatePath);
      return () => window.removeEventListener("resize", updatePath);
    }, 
  []);

  // Disable native scrolling
  useEffect(() => 
    {
      const handleWheel = (e) => {
        e.preventDefault();
        const current = rawScroll.get();
        const next = clamp(current + -e.deltaY * 0.00005, 0, 1); // Adjust speed here
        rawScroll.set(next);
      };
      
      window.addEventListener("wheel", handleWheel, { passive: false });
      return () => window.removeEventListener("wheel", handleWheel);
    }, 
  []);

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
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "100vw",
          background: "inherit", // lets your global gradient show through
          overflow: "hidden",
          userSelect: "none",
          touchAction: "none",
        }}
      >
        <svg
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
        >
          <defs>
            <linearGradient id="vineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6DBE45" />
              <stop offset="100%" stopColor="#2E7D32" />
            </linearGradient>
          </defs>

          <motion.path
            ref={pathRef}
            d={pathData}
            fill="none"
            stroke="url(#vineGradient)"
            strokeWidth={5}
            strokeLinecap="round"
            opacity={1}
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
            filter="drop-shadow(0 0 6px rgba(50,150,50,0.5))"
          />
          {milestones.map(({ positionOnPath }, idx) => {
            if (!pathRef.current || pathLength === 0) return null;

            const visible = scrollValue >= positionOnPath + 0.05;

            const pathPoint = pathRef.current.getPointAtLength(pathLength * positionOnPath);
            const side = pathPoint.x < window.innerWidth / 2 ? "right" : "left";
            const offset = 150;
            const cardX = side === "right" ? pathPoint.x + offset : pathPoint.x - offset;
            const cardY = pathPoint.y + 40;


            const midX = (pathPoint.x + cardX) / 2;
            const controlY = pathPoint.y + 40; // slightly above for curve
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
                      d={branchPath}
                      fill="none"
                      stroke={branchColor}
                      strokeWidth={2}
                      strokeDasharray="6 3"
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
          style={{
            position: "absolute",
            top: dotY,
            left: dotX,
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: "#EDAE49",
            boxShadow: "0 0 10px #EDAE49",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 20,
          }}
        />

        {/* Milestone cards */}
        {milestones.map(({ id, title, content, positionOnPath }) => {
          const visible = scrollValue >= positionOnPath + 0.08;


          if (!pathRef.current || pathLength === 0) return null;

          const point = pathRef.current.getPointAtLength(pathLength * positionOnPath);
          const side = point.x < window.innerWidth / 2 ? "right" : "left";
          const cardOffsetX = 150;
          
          const cardWidth = window.innerWidth / 4

          const cardX = side === "right" ? point.x + cardOffsetX : point.x - cardOffsetX - cardWidth;
          const cardY = point.y;

          

          return (
            <AnimatePresence key={id}>
              {visible && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: "absolute",
                    top: cardY,
                    left: cardX,
                    width: cardWidth,
                    padding: "1rem 1.2rem",
                    background: "rgba(255 255 255 / 0.95)",
                    borderRadius: 12,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                    transform: "translate(-50%, 0)",
                    color: "#222",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    zIndex: 15,
                    userSelect: "text",
                  }}
                >
                  <h3 style={{ margin: "0 0 0.5rem" }}>{title}</h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.4 }}>
                    {content}
                  </p>
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