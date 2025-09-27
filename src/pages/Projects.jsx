import { useEffect, useState } from "react";
import '../styles/Projects.css'
import { FaGithub } from 'react-icons/fa';

const Projects = () => {
    const [repos, setRepos] = useState([]);
    const [repoLanguages, setRepoLanguages] = useState({});
    const [repoImages, setRepoImages] = useState({});

    const formatRepoName = (name) => {
        return name
            .replace(/-/g, ' ')  // Replace dashes with spaces
            .replace(/\b\w/g, (char) => char.toUpperCase());  // Capitalize first letter of each word
    };

    useEffect(() => {
        const fetchReposAndLanguages = async() => {
            try {
                console.log("Fetching complete repo data from API...");
                
                const res = await fetch("https://devinstanley.vercel.app/api/fetch_git_repos");
                
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                
                const data = await res.json();
                console.log('Complete API Response:', data);
                
                // Check if data has the expected structure
                if (!data.repos || !Array.isArray(data.repos)) {
                    throw new Error('API did not return expected data structure');
                }

                // Set Data
                setRepos(data.repos);
                setRepoLanguages(data.languages || {});
                setRepoImages(data.images || {});
                
                console.log(`Loaded ${data.repos.length} repositories with complete data`);
                
            } catch (err) {
                console.error("Error fetching repositories:", err);
            }
        };

        fetchReposAndLanguages();
    }, []);

    return (
        <div className="tile-container">
            {repos.map(repo => (
                <div className="git-tile" key={repo.id}>
                    <div className="git-tile-content">
                        <h2>{formatRepoName(repo.name)}</h2>
                        <p>{repo.description}</p>
                        <div className="languages-container">
                            {repoLanguages[repo.id] 
                                ? repoLanguages[repo.id].map((language, index) => (
                                    <span key={index} className="language-pill">
                                        {language}
                                    </span>
                                ))
                                : <span className="loading-text">Loading languages...</span>
                            }
                        </div>
                        <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="git-links"
                        >
                            View on GitHub
                            <FaGithub />
                        </a>
                    </div>
                    {repoImages[repo.id] && (
                        <div className="repo-image-container">
                            <img 
                                src={repoImages[repo.id]} 
                                alt={`Preview for ${repo.name}`}
                                className="repo-image"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
export default Projects;