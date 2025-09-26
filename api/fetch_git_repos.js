import NodeCache from "node-cache";

const cache = new NodeCache( { stdTTL: 3600} );

export default async function handler(req, res) {
    console.log("Initiating Git Fetch");
    const key = "git_repos";
    const cached = cache.get(key);

    if (cached) {
        console.log("Used Cached Fetch");
        return res.status(200).json(cached);
    }

    try {
        console.log("Starting Fetch");
        const response = await fetch("https://api.github.com/users/devinstanley/repos?sort=updated");

        if (!response.ok) throw new Error(`GitHub error: ${response.status}`);

        const repos = await response.json();

        // Only include non-fork repos
        const filtered = repos.filter(repo => !repo.fork);

        // Cache result
        cache.set(key, filtered);

        res.status(200).json(filtered);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch repos" });
    }
};