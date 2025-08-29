import { useState, useEffect, useRef } from "react";
import '../styles/Home.css'
import headshot from "../resources/Devin_Headshot_Temp.png";
import HeroSection from "../components/HeroSection";
import { FaGraduationCap, FaBriefcase, FaFileDownload } from 'react-icons/fa';
import ParticleSim from "../web-apps/ParticleSim/ParticleSim";

const Home = () => {
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
            subDescription: (
                <>
                    <div className="line">
                        <FaGraduationCap/>
                        
                    </div>
                    <div className="line">
                        <FaGraduationCap/>
                        
                    </div>
                </>
            ),
            link: "/projects"
        },
        {
            id: 'apps',
            title: "Try Interactive Apps",
            shortDescription: "Experience live demonstrations.",
            subDescription: (
                <>
                    <div className="line">
                        <FaGraduationCap/>
                        
                    </div>
                    <div className="line">
                        <FaGraduationCap/>
                        
                    </div>
                </>
            ),
            link: "/apps"
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
                        3+ Years of .NET WPF and Python Data Workflow Development
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
            <ParticleSim />
            <HeroSection heroData={heroData} navigationCards={navigationCards} />
        </div>
    )
}
export default Home;