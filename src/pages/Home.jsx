import { useState, useEffect, useRef } from "react";
import '../styles/Home.css'
import headshot from "../resources/Devin_Headshot_Temp.png";
import HeroSection from "../components/HeroSection";
import { FaGraduationCap, FaBriefcase, FaFileDownload } from 'react-icons/fa';

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

    const heroData = {
        name: "Devin Stanley",
        description: "This is a short description of me!",
        headshot: headshot
    };

    const navigationCards = [
        {
            id: 'projects',
            title: "Explore Projects",
            shortDescription: "Browse my GitHub repositories and development work.",
            subDescription: "View code samples, technical implementations, and project details",
            link: "/projects" // Update with your actual route
        },
        {
            id: 'apps',
            title: "Try Interactive Apps",
            shortDescription: "Experience live demonstrations.",
            subDescription: "Hands-on applications showcasing various technologies and solutions",
            link: "/apps" // Update with your actual route
        },
        {
            id: 'resume',
            title: "Download Resume",
            shortDescription: "Get my credentials and contact information.",
            subDescription: (
                <>
                    <div className="line">
                        <FaGraduationCap/>
                        M.S. Computational Science and B.S. Applied Mathematics
                    </div>
                    <div className="line">
                        <FaBriefcase/>
                        3+ Years of .NET WPF, Python Data Workflows, and LabVIEW Development
                    </div>
                    <div className="line">
                        <FaFileDownload/>
                        Download My Resume
                    </div>
                </>
            ),
            link: "/resume.pdf" // Update with your actual resume path
        }
    ];

    return (
        <div className="page-container">
            <div className="particles-container">
                {[...Array(300)].map((_, i) => (
                    <InteractiveParticle key={i} index={i} />
                ))}
            </div>
            <HeroSection heroData={heroData} navigationCards={navigationCards} />
        </div>
    )
}
export default Home;