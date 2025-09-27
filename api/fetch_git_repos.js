import NodeCache from "node-cache";

const cache = new NodeCache( { stdTTL: 3600} );

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

export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle options request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    console.log("Initiating Git Fetch");
    const key = "git_repos_complete";

    const cached = cache.get(key);
    if (cached) {
        console.log("Used Cached Fetch");
        return res.status(200).json(cached);
    }

    try {
        console.log("Starting Fetch");

        // Fetch and Filter Repos
        const response = await fetch("https://api.github.com/users/devinstanley/repos?sort=updated");
        if (!response.ok) throw new Error(`GitHub error: ${response.status}`);
        const repos = await response.json();
        const filteredRepos = repos.filter(repo => !repo.fork); // Only include non-fork repos

        //Fetch Languages in Parallel
        console.log("Fetching languages for all repos...");
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
        console.log("Fetching images for all repos...");
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

        const completeData = {
            repos: filteredRepos,
            languages: languagesMap,
            images: imagesMap
        };

        cache.set(key, completeData);

        console.log(`Cached complete data for ${filteredRepos.length} repositories`);

        res.status(200).json(completeData );
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch repos" });
    }
};


