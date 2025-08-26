import { useState, useEffect, useRef } from "react";
import '../styles/Home.css'
import headshot from "../resources/Devin_Headshot_Temp.png";

const Home = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0});
    const [lastMouseMove, setLastMouseMove] = useState(Date.now());
    const [isMouseIdle, setIsMouseIdle] = useState(false);
    const particlePositions = useRef([]);

    // Initialize Positions
    useEffect(() => {
        if (particlePositions.current.length === 0){
            particlePositions.current = [...Array(300)].map(() => ({
                centerX: Math.random() * 100,
                centerY: Math.random() * 100,
                maxDistance: 20 + Math.random() * 30,
                particleInteracting: false,
                // Offset From Mouse Interaction
                currentOffsetX: 0,
                currentOffsetY: 0,

                // Ambient Values for Automatic Movement
                animationDuration: (2 + Math.random() * 4),
                animationDelay: Math.random() * 2
            }));
        }
    }, []);

    // Handle Mouse Movement
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY});
            setLastMouseMove(Date.now());
            setIsMouseIdle(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const idle = Date.now() - lastMouseMove > 2000;
            setIsMouseIdle(idle);
        }, 100); // Check every 100ms

        return () => clearInterval(interval);
    }, [lastMouseMove]);


    const InteractiveParticle = ({ index }) => {
        const particle = particlePositions.current[index];
        if (!particle) return null;

        if (!isMouseIdle) {
            // Calculate Mouse Influence
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            //Convert Percentage to Pixel Positions
            const centerX = (particle.centerX / 100) * viewportWidth;
            const centerY = (particle.centerY / 100) * viewportHeight;

            // Get Distance From Mouse to Center
            const deltaX = mousePos.x - centerX;
            const deltaY = mousePos.y - centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
           
            // Max Influence Distance
            const maxInfluence = 300;
            const influence = Math.max(0, 1 - (distance / maxInfluence));
           
            // Calculate Offset in pixels
            particle.currentOffsetX = (deltaX / distance || 0) * particle.maxDistance * influence;
            particle.currentOffsetY = (deltaY / distance || 0) * particle.maxDistance * influence;
        }

        // Convert pixel offsets to percentage
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const offsetXPercent = (particle.currentOffsetX / viewportWidth) * 100;
        const offsetYPercent = (particle.currentOffsetY / viewportHeight) * 100;

        return (
            <div 
                className={`interactive-particle ${isMouseIdle ? 'floating' : ''}`}
                style = {{
                    left: `${particle.centerX + offsetXPercent}%`,
                    top: `${particle.centerY + offsetYPercent}%`,
                    animationDuration: isMouseIdle ? `${particle.animationDuration}s` : 'none',
                    animationDelay: isMouseIdle ? `${particle.animationDelay}s` : 'none'
                }}
            />
        );
    };

    return (
        <div className="page-container">
            <div className="particles-container">
                {[...Array(300)].map((_, i) => (
                    <InteractiveParticle key={i} index={i} />
                ))}
            </div>
            <div className="hero">
                <div className="hero-introduction">
                    <img className="hero-headshot"
                        src={headshot}
                    />
                    <h1 className="hero-name">Devin Stanley</h1>
                    <p className="description">This is a short description of me!</p>
                </div>
                <div className="hero-nav">
                    <div className="hero-card">
                        <h3>1</h3>
                        <p>Desc 1</p>
                    </div>
                    <div className="hero-card">
                        <h3>2</h3>
                        <p>Desc 2</p>
                    </div>
                    <div className="hero-card">
                        <h3>3</h3>
                        <p>Desc 3</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Home;