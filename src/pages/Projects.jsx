import { useEffect, useState } from "react";
import '../styles/Projects.css'

const Projects = () => {
    const [repos, setRepos] = useState([]);

    useEffect(() => {
        fetch("https://api.github.com/users/devinstanley/repos?sort=updated")
        .then(res => res.json())
        .then(data => {
            // filter out forks if you want
            setRepos(data.filter(repo => !repo.fork));
        });
    }, []);

    return (
        <div className="tile-container">
            {repos.map(repo => (
                <div className="git-tile" key={repo.id}>
                    <h2>{repo.name}</h2>
                    <p>{repo.description}</p>
                    <div>
                        <span>{repo.language}</span>
                    </div>
                    <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-blue-600 hover:underline"
                    >
                        View on GitHub
                    </a>
                </div>
            ))}
        </div>
    )
}
export default Projects;