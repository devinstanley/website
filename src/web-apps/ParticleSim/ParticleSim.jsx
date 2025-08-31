import { useState, useRef, useEffect, useCallback } from "react"
import "./ParticleSim.css"

const ParticleSim = ( {
    showControls = false,
    particleCount = 300,
    gravity = 0.1,
    friction = 0.98,
    mouseInfluence = 200,
    mousePolarity = -1,
    particleSize = 4,
    bounceStrength = 0.8,
} ) => {
    const [params, setParams] = useState({
        showControls,
        gravity,
        friction,
        mouseInfluence,
        mousePolarity,
        particleSize,
        bounceStrength,
        particleCount
    });
    
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [lastMouseMove, setLastMouseMove] = useState(Date.now());
    const [isMouseIdle, setIsMouseIdle] = useState(false);
    const [frameCount, setFrameCount] = useState(0);

    
    const particlePositions = useRef([]);
    const animationFrameRef = useRef();
    const containerRef = useRef();

    // Initialize Positions
    useEffect(() => {
        const initializeParticles = () => {
        particlePositions.current = [...Array(params.particleCount)].map(() => ({
            // Position (in percentages for responsiveness)
            centerX: Math.random() * 100,
            centerY: Math.random() * 100,
            
            // Physics properties
            velocityX: (Math.random() - 0.5) * 2, // Random initial velocity
            velocityY: (Math.random() - 0.5) * 2,
            mass: 0.5 + Math.random() * 1.5, // Varying mass affects gravity
            
            // Mouse interaction
            maxDistance: 15 + Math.random() * 25,
            currentOffsetX: 0,
            currentOffsetY: 0,
            
            // Animation properties
            animationDuration: 3 + Math.random() * 4,
            animationDelay: Math.random() * 5,
            
            // Physics state
            isAtRest: false,
            restThreshold: 0.1
        }));
        };

        initializeParticles();
    }, [params.particleCount]);

    // Handle Mouse Movement
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePos({ 
                x: e.clientX - rect.left, 
                y: e.clientY - rect.top 
                });
                setLastMouseMove(Date.now());
                setIsMouseIdle(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Check Mouse Idle State
    useEffect(() => {
        const interval = setInterval(() => {
            const idle = Date.now() - lastMouseMove > 2000;
            setIsMouseIdle(idle);
        }, 100); // Check every 100ms

        return () => clearInterval(interval);
    }, [lastMouseMove]);

    const updatePhysics = useCallback(() => {
        if (!containerRef.current) {
            animationFrameRef.current = requestAnimationFrame(updatePhysics);
            return;
        }

        const container = containerRef.current;
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        particlePositions.current.forEach((particle) => {
            //Convert Percentage to Pixel Positions
            let pixelX = (particle.centerX / 100) * containerWidth;
            let pixelY = (particle.centerY / 100) * containerHeight;

            // Handle Mouse Influence
            if (!isMouseIdle){
                const deltaX = mousePos.x - pixelX;
                const deltaY = mousePos.y - pixelY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                if (distance < params.mouseInfluence && distance > 0){
                    const influence = Math.max(0, 1 - (distance / params.mouseInfluence));
                    const forceMultiplier = influence * 0.5 * params.mousePolarity;

                    // Mouse Force
                    particle.velocityX -= (deltaX / distance) * forceMultiplier;
                    particle.velocityY -= (deltaY / distance) * forceMultiplier;
                }
            }

            // Enforce Gravity
            particle.velocityY += params.gravity * particle.mass;

            // Add Constant Perturbation
            const noiseStrength = 0.1;
            particle.velocityX += (Math.random() - 0.5) * noiseStrength;
            particle.velocityY += (Math.random() - 0.5) * noiseStrength;

            // Update Positions
            pixelX += particle.velocityX;
            pixelY += particle.velocityY;

            // Boundary Collision Bounce
            if (pixelX <= params.particleSize/2) {
                pixelX = params.particleSize/2;
                particle.velocityX = Math.abs(particle.velocityX) * params.bounceStrength;
            }
            if (pixelX >= containerWidth - params.particleSize/2) {
                pixelX = containerWidth - params.particleSize/2;
                particle.velocityX = -Math.abs(particle.velocityX) * params.bounceStrength;
            }
            if (pixelY <= params.particleSize/2) {
                pixelY = params.particleSize/2;
                particle.velocityY = Math.abs(particle.velocityY) * params.bounceStrength;
            }
            if (pixelY >= containerHeight - params.particleSize/2) {
                pixelY = containerHeight - params.particleSize/2;
                particle.velocityY = -Math.abs(particle.velocityY) * params.bounceStrength;
            }

            // Apply Friction
            particle.velocityX *= params.friction;
            particle.velocityY *= params.friction;

            // Convert Pixel to Percent
            particle.centerX = (pixelX / containerWidth) * 100;
            particle.centerY = (pixelY / containerHeight) * 100;

            // Check Rest State
            const speed = Math.sqrt(particle.velocityX * particle.velocityX + particle.velocityY * particle.velocityY);
            particle.isAtRest = speed < particle.restThreshold;
        });
        setFrameCount(prev => (prev + 1) % 10);

        animationFrameRef.current = requestAnimationFrame(updatePhysics);
    }, [isMouseIdle, mousePos, params]);

    useEffect(() => {
        updatePhysics();

        return () => {
            if (animationFrameRef.current){
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [updatePhysics, isMouseIdle]);


    const InteractiveParticle = ({ index }) => {
        const particle = particlePositions.current[index];
        if (!particle) return null;

        return (
            <div 
                className={`interactive-particle`}
                style={{
                left: `${particle.centerX}%`,
                top: `${particle.centerY}%`,
                width: `${params.particleSize}px`,
                height: `${params.particleSize}px`,
                animationDuration: 'none',
                animationDelay: 'none',
                opacity: particle.isAtRest ? 0.4 : 0.8,
                }}
            />
        );
    };

    return (
        <div>
            <div 
             ref={containerRef}
             className="particles-container">
                {[...Array(params.particleCount)].map((_, i) => (
                    <InteractiveParticle key={i} index={i}/>
                ))}
            </div>
        </div>
    )
};

export default ParticleSim;

