import { useEffect, useState } from "react";
import '../styles/Projects.css'
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Projects = () => {
    const [repos, setRepos] = useState([]);
    const [repoLanguages, setRepoLanguages] = useState({});

    const formatRepoName = (name) => {
        return name
            .replace(/-/g, ' ')  // Replace dashes with spaces
            .replace(/\b\w/g, (char) => char.toUpperCase());  // Capitalize first letter of each word
    };

    useEffect(() => {
        const fetchReposAndLanguages = async() => {
            try {
                const res = await fetch("https://api.github.com/users/devinstanley/repos?sort=updated");
                
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                
                const data = await res.json();
                console.log('API Response:', data); // Debug log
                
                // Check if data is an array
                if (!Array.isArray(data)) {
                    console.error('API did not return an array:', data);
                    return;
                }
                const filteredRepos = data.filter(repo => ! repo.fork)
                setRepos(filteredRepos)

                //Fetch Languages in Parallel
                const languagePromises = filteredRepos.map(async (repo) => {
                    try{
                        const langRes = await fetch(repo.languages_url);
                        const languages = await langRes.json();
                        return { id: repo.id, languages: Object.keys(languages)};
                    } catch (err){
                        console.error(`Error fetching languages for ${repo.name}:`, err)
                        return { id: repo.id, languages: []};
                    }
                });

                const languageResults = await Promise.all(languagePromises);
                const languagesMap = languageResults.reduce((acc, { id, languages }) => {
                    acc[id] = languages;
                    return acc;
                }, {});

                setRepoLanguages(languagesMap);
            } catch (err){
                console.error("Error fetching repositories:", err)
            }
        };

        fetchReposAndLanguages();
    }, []);

    return (
        <div className="tile-container">
            {repos.map(repo => (
                <div className="git-tile" key={repo.id}>
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
            ))}
        </div>
    )
}
export default Projects;