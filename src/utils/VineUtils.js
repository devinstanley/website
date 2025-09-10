// Converts segments to SVG path
export const segmentsToPath = (segments) => {
  let path = "";
  segments.forEach((seg, i) => {
    if (i === 0){
      path += `M ${seg.start.x} ${seg.start.y}`;
    }
    path += `C ${seg.control1.x} ${seg.control1.y}, ${seg.control2.x} ${seg.control2.y}, ${seg.end.x} ${seg.end.y} `;
  });
  console.log(path);
  return path.trim();
};

export const generateVine = (width, height, segments = 8) => {
  const vineSegments = [];

  // Create Bounds
  const margin = Math.min(width, height) * 0.1;
  const usableWidth = width - 2 * margin;
  const usableHeight = height * 0.85;

  let currentPoint = {x: width / 2, y: height - margin * 0.8}; //Start at bottom of page
  let currentTangent = { x: 0, y: -1} // Start going straight up
  const segmentHeight = usableHeight / segments;

  for (let i = 0; i < segments; i++){
    const progress = i / segments;

    // Create Organic Swaying Pattern w/ Multiple Sine Waves
    const swayIntensity = Math.sin(progress * Math.PI) * 0.8;
    const baseAmplitude = usableWidth * 0.15;
    const primarySway = Math.sin(progress * Math.PI * 2.2) * swayIntensity;
    const secondarySway = Math.sin(progress * Math.PI * 4.5) * 0.3;
    const sway = baseAmplitude * (primarySway + secondarySway);

    const randomOffset = (Math.random() - 0.5) * 60;

    const nextPoint = {
      x: Math.max(margin, Math.min(width - margin, 
        width / 2 + sway + randomOffset)),
      y: currentPoint.y - segmentHeight + (Math.random() - 0.5) * 10
    };

    // Calculate Natural Direction From Current to Next
    const naturalDirection = {
      x: nextPoint.x - currentPoint.x,
      y: nextPoint.y - currentPoint.y
    };

    const naturalLength = Math.sqrt(naturalDirection.x ** 2 + naturalDirection.y ** 2);
    if (naturalLength > 0) {
      naturalDirection.x /= naturalLength;
      naturalDirection.y /= naturalLength;
    }

    // Blend Current Tange with Natural Direction
    const blendFactor = 0.3;
    const newTangent = {
      x: currentTangent.x * (1 - blendFactor) + naturalDirection.x * blendFactor,
      y: currentTangent.y * (1 - blendFactor) + naturalDirection.y * blendFactor
    };

    // Normalize Blended Tangent
    const tangentLength = Math.sqrt(newTangent.x ** 2 + newTangent.y ** 2);
    if (tangentLength > 0) {
      newTangent.x /= tangentLength;
      newTangent.y /= tangentLength;
    }

    // Control Point Distances From Segment Length
    const controlDistance = naturalLength * 0.4;

    // Follow Current Tangent
    const control1 = {
      x: currentPoint.x + currentTangent.x * controlDistance,
      y: currentPoint.y + currentTangent.y * controlDistance
    };

    // Calculate Next Tangent
    const nextTangent = i < segments - 1 ? {
      x: newTangent.x * 0.7 + naturalDirection.x * 0.3,
      y: newTangent.y * 0.7 + naturalDirection.y * 0.3
    } : newTangent;

    // Follow Next Tangent
    const control2 = {
      x: nextPoint.x - nextTangent.x * controlDistance,
      y: nextPoint.y - nextTangent.y * controlDistance
    };

    vineSegments.push({
      type: "cubic",
      start: currentPoint,
      control1: control1,
      control2: control2,
      end: nextPoint
    });

    // Update for Next
    currentPoint = nextPoint;
    currentTangent = newTangent;
    }
  return vineSegments
}

// Generate Simple Vertical Line
export const generateVerticalLine = (width, height, segments = 8) => {
  const lineSegments = [];
  const margin = Math.min(width, height) * 0.1;
  const usableHeight = height * 0.85;
  const centerX = width / 2;
  const startY = height - margin * 0.8;
  const segmentHeight = usableHeight / segments;

  let currentPoint = { x: centerX, y: startY };

  for (let i = 0; i < segments; i++) {
    const nextPoint = {
      x: centerX,
      y: currentPoint.y - segmentHeight
    };

    // Create Line Control Points
    const controlDistance = segmentHeight / 3;
    
    const control1 = {
      x: centerX,
      y: currentPoint.y - controlDistance
    };
    
    const control2 = {
      x: centerX,
      y: nextPoint.y + controlDistance
    };

    lineSegments.push({
      type: "cubic",
      start: currentPoint,
      control1: control1,
      control2: control2,
      end: nextPoint
    });

    currentPoint = nextPoint;
  }

  return lineSegments;
}