// Helper function to calculate endpoint tangent for any segment
const getEndTangent = (segment) => {
  if (segment.type === "quadratic") {
    return {
      x: segment.end.x - segment.control.x,
      y: segment.end.y - segment.control.y
    };
  }
  if (segment.type === "cubic" || segment.type === "cubicLoop") {
    return {
      x: segment.end.x - segment.control2.x,
      y: segment.end.y - segment.control2.y
    };
  }
  return { x: 0, y: -1 }; // Default upward tangent
};

export const segmentsToPath = (segments) => {
  let path = "";
  segments.forEach((seg, i) => {
    if (seg.type === "quadratic") {
      if (path === "") {
        path += `M ${seg.start.x} ${seg.start.y} `;
      }
      path += `Q ${seg.control.x} ${seg.control.y}, ${seg.end.x} ${seg.end.y} `;
    } else if (seg.type === "loop") {
      seg.curves.forEach((curve) => {
        if (path === "") {
          path += `M ${curve.start.x} ${curve.start.y} `;
        }
        path += `Q ${curve.control.x} ${curve.control.y}, ${curve.end.x} ${curve.end.y} `;
      });
    } else if (seg.type === "cubicLoop") {
      seg.curves.forEach((curve) => {
        if (path === "") {
          path += `M ${curve.start.x} ${curve.start.y} `;
        }
        path += `C ${curve.control1.x} ${curve.control1.y}, ${curve.control2.x} ${curve.control2.y}, ${curve.end.x} ${curve.end.y} `;
      });
    } else if (seg.type === "cubic") {
      if (path === "") {
        path += `M ${seg.start.x} ${seg.start.y} `;
      }
      path += `C ${seg.control1.x} ${seg.control1.y}, ${seg.control2.x} ${seg.control2.y}, ${seg.end.x} ${seg.end.y} `;
    }
  });
  return path.trim();
};

export const generateVine = (width, height, segments = 6, milestones = []) => {
  const vineSegments = [];
  const totalVerticalSpace = height; // Leave 10% margin
  const horizontalMargin = width; // 10% margin on each side
  const baseSegmentHeight = totalVerticalSpace * 0.1;
  
  // Generate base segment
  const baseSegment = generateBaseSegment(width, height, baseSegmentHeight, horizontalMargin);
  vineSegments.push(baseSegment);
  
  let lastEnd = baseSegment.end;
  let lastTangent = getEndTangent(baseSegment);
  let verticalUsed = baseSegmentHeight;
  
  for (let i = 0; i < segments; i++) {
    if (verticalUsed >= totalVerticalSpace) break;
    
    let segment;
    const isLoopSegment = false//(i + 1) % 3 === 0;
    
    if (isLoopSegment) {
      const loopHeight = totalVerticalSpace * 0.06;
      if (verticalUsed + loopHeight > totalVerticalSpace) break;
      
      segment = generateLoopSegment(lastEnd, lastTangent, width, loopHeight, horizontalMargin);
      vineSegments.push(segment);
      
      // Update position and tangent after loop
      const lastCurve = segment.curves[segment.curves.length - 1];
      lastEnd = lastCurve.end;
      lastTangent = getEndTangent(lastCurve);
      verticalUsed += loopHeight;
    } else {
      const segmentHeight = totalVerticalSpace * 0.15;
      if (verticalUsed + segmentHeight > totalVerticalSpace) break;
      
      const amplitude = width * Math.random(); // Reduced from 0.2
      const direction = i % 2 === 0 ? 1 : -1;
      
      segment = generateCubicSegment(
        lastEnd,
        lastTangent,
        width,
        segmentHeight,
        amplitude * direction,
        horizontalMargin
      );
      
      // Ensure we stay within bounds
      if (segment.end.x < horizontalMargin || segment.end.x > width - horizontalMargin) {
        // Reverse direction if we're hitting the edge
        segment = generateCubicSegment(
          lastEnd,
          lastTangent,
          width,
          segmentHeight,
          amplitude * direction * -1,
          horizontalMargin
        );
      }
      
      vineSegments.push(segment);
      lastEnd = segment.end;
      lastTangent = getEndTangent(segment);
      verticalUsed += segmentHeight;
    }
  }
  
  return vineSegments;
};

export const generateBaseSegment = (width, height, segmentHeight, horizontalMargin) => {
  const curveDirection = Math.random() > 0.5 ? 1 : -1; // Random left/right
  const start = { x: width / 2, y: height };
  const end = { 
    x: width / 2 + (width * 0.05 * curveDirection),
    y: height - segmentHeight 
  };
  
  return {
    type: "cubic",
    start,
    control1: { 
      x: width / 2,
      y: height - segmentHeight * 0.2
    },
    control2: { 
      x: width / 2 + (width * 0.03 * curveDirection),
      y: height - segmentHeight * 0.7
    },
    end
  };
};

export const generateLoopSegment = (start, startTangent, width, loopHeight, horizontalMargin) => {
  const radius = Math.min(loopHeight * 0.4, horizontalMargin * 0.8);
  const curves = [];
  
  // Normalize start tangent (ensure it's pointing generally upward)
  const tangentMagnitude = Math.sqrt(startTangent.x ** 2 + startTangent.y ** 2);
  let unitTangent = {
    x: startTangent.x / tangentMagnitude,
    y: Math.abs(startTangent.y / tangentMagnitude) // Force upward component
  };

  // If the tangent is pointing downward (which shouldn't happen), flip it
  if (startTangent.y > 0) {
    unitTangent.y *= -1;
  }

  // Perpendicular vector (points to side of vine)
  const perpendicular = {
    x: -unitTangent.y,
    y: unitTangent.x
  };
  
  // Determine loop direction based on vine's horizontal movement
  // But ensure it doesn't reverse the upward motion
  const loopDirection = unitTangent.x > 0 ? 1 : -1;
  
  // Circle center is offset perpendicular and slightly upward
  const circleCenter = {
    x: start.x + perpendicular.x * radius * loopDirection,
    y: start.y + perpendicular.y * radius * loopDirection - radius * 0.7
  };
  
  // Calculate the entry angle (ensuring upward motion)
  const entryAngle = Math.atan2(start.y - circleCenter.y, start.x - circleCenter.x);
  
  // Create 4 quarter-circle arcs with upward bias
  for (let i = 0; i < 4; i++) {
    const angle = entryAngle + (Math.PI/2) * i;
    const nextAngle = entryAngle + (Math.PI/2) * (i + 1);
    
    // Apply slight upward bias to y-coordinates
    const arcStart = {
      x: circleCenter.x + radius * Math.cos(angle),
      y: circleCenter.y + radius * Math.sin(angle) - (i * radius * 0.05)
    };
    
    const arcEnd = {
      x: circleCenter.x + radius * Math.cos(nextAngle),
      y: circleCenter.y + radius * Math.sin(nextAngle) - ((i+1) * radius * 0.05)
    };
    
    // Perfect circle control points
    const k = 0.5522847498;
    const controlOffset = k * radius;
    
    curves.push({
      type: "cubic",
      start: i === 0 ? { ...start } : arcStart,
      control1: {
        x: arcStart.x - controlOffset * Math.sin(angle),
        y: arcStart.y + controlOffset * Math.cos(angle)
      },
      control2: {
        x: arcEnd.x + controlOffset * Math.sin(nextAngle),
        y: arcEnd.y - controlOffset * Math.cos(nextAngle)
      },
      end: arcEnd
    });
  }

  // Adjust vertical position to ensure upward movement
  const verticalOffset = -loopHeight * 0.8; // Reduced from full loopHeight
  curves.forEach(curve => {
    curve.start.y += verticalOffset;
    curve.end.y += verticalOffset;
    curve.control1.y += verticalOffset;
    curve.control2.y += verticalOffset;
  });
  
  return {
    type: "cubicLoop",
    curves
  };
};

export const generateCubicSegment = (start, startTangent, width, segmentHeight, amplitude, horizontalMargin) => {
  // Calculate potential end point
  let end = {
    x: start.x + amplitude * 0.3,
    y: start.y - segmentHeight
  };
  
  // Adjust if we're going out of bounds
  if (end.x < horizontalMargin || end.x > width - horizontalMargin) {
    amplitude *= -0.7; // Reverse and reduce amplitude
    end = {
      x: start.x + amplitude * 0.3,
      y: start.y - segmentHeight
    };
  }
  
  // Maintain tangent direction at start
  const tangentMagnitude = Math.sqrt(startTangent.x ** 2 + startTangent.y ** 2);
  const scaledTangent = {
    x: (startTangent.x / tangentMagnitude) * segmentHeight * 0.5,
    y: (startTangent.y / tangentMagnitude) * segmentHeight * 0.5
  };
  
  return {
    type: "cubic",
    start,
    control1: {
      x: start.x + scaledTangent.x,
      y: start.y + scaledTangent.y
    },
    control2: {
      x: end.x - amplitude * 0.2,
      y: end.y + segmentHeight * 0.4
    },
    end
  };
};