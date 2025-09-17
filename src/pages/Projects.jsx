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

    const checkForImage = async (repo) => {
        try {
            const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
            
            const response = await fetch(
                `https://api.github.com/repos/${repo.full_name}/contents/ex`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                    }
                }
            );
            
            if (response.ok) {
                const contents = await response.json();
                
                // Look for any image files in the ex/ folder
                const imageFile = contents.find(file => 
                    file.type === 'file' && 
                    imageExtensions.some(extension => 
                        file.name.toLowerCase().endsWith(`.${extension}`)
                    )
                );
                
                if (imageFile) {
                    // Use the raw GitHub URL
                    const rawUrl = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/ex/${imageFile.name}`;
                    return rawUrl;
                }
            }
            return null;
        } catch (error) {
            console.log(`No images found in ex/ folder for ${repo.name}`);
            return null;
        }
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

                // Fetch Images in Parallel
                const imagePromises = filteredRepos.map(async (repo) => {
                    const imageUrl = await checkForImage(repo);
                    return { id: repo.id, imageUrl };
                });

                const [languageResults, imageResults] = await Promise.all([
                    Promise.all(languagePromises),
                    Promise.all(imagePromises)
                ]);

                const languagesMap = languageResults.reduce((acc, { id, languages }) => {
                    acc[id] = languages;
                    return acc;
                }, {});

                const imagesMap = imageResults.reduce((acc, { id, imageUrl }) => {
                    acc[id] = imageUrl;
                    return acc;
                }, {});

                setRepoLanguages(languagesMap);
                setRepoImages(imagesMap);
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