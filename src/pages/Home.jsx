import { useState, useEffect, useRef } from "react";
import '../styles/Home.css'
import headshot from "../resources/Devin_Headshot_Temp.png";
import HeroSection from "../components/HeroSection";
import { FaGraduationCap, FaBriefcase, FaFileDownload, FaWaveSquare, FaAtom, FaFighterJet, FaGamepad, FaWikipediaW } from 'react-icons/fa';
import ParticleSim from "../web-apps/ParticleSim/ParticleSim";

const Home = () => {
    const heroData = {
        name: "Devin Stanley",
        description: "Software developer with a strong foundation in C#/.NET desktop applications, embedded systems integration, and data analysis. Proven ability to own full product cycles—from architecture to deployment—across scientific, firmware, and DAQ systems. Driven and proactive, consistently pursuing opportunities to improve workflows, adopt new tools, and deliver measurable results.",
        headshot: headshot
    };

    const homeParticleCount = innerWidth > 768 ? 300 : 50;

    const navigationCards = [
        {
            id: 'projects',
            title: "Explore Projects",
            shortDescription: "Browse my GitHub repositories and development work.",
            subDescription: (
                <>
                    <div className="line">
                        <FaWaveSquare/>
                        <span>Compress Sensing Seismic Migration</span>
                    </div>
                    <div className="line">
                        <FaGamepad/>
                        <span>Sky Town</span>
                        
                    </div>
                </>
            ),
            link: "/projects"
        },
        {
            id: 'resume',
            title: "Download Resume",
            shortDescription: "Get my credentials and contact information.",
            subDescription: (
                <>
                    <div className="line">
                        <FaGraduationCap/>
                        <span>M.S. Computational Science and B.S. Applied Mathematics</span>
                    </div>
                    <div className="line">
                        <FaBriefcase/>
                        <span>3+ Years of .NET WPF and Python Data Workflow Development</span>
                    </div>
                    <div className="line">
                        <FaFileDownload/>
                        <span>Download My Resume</span>
                    </div>
                </>
            ),
            link: "/resume"
        },
        {
            id: 'apps',
            title: "Try Interactive Apps",
            shortDescription: "Experience live demonstrations.",
            subDescription: (
                <>
                    <div className="line">
                        <FaAtom/><span>Simple Particle Simulator</span>
                    </div>
                    <div className="line">
                        <FaWikipediaW/><span>Wiki Race Game</span>
                    </div>
                    <div className="line">
                        <FaFighterJet/><span>More Coming Soon!</span>
                    </div>
                </>
            ),
            link: "/apps"
        },
    ];

    return (
        <div className="page-container">
            <ParticleSim gravity={0} particleCount={homeParticleCount}/>
            <HeroSection heroData={heroData} navigationCards={navigationCards} />
        </div>
    )
}
export default Home;