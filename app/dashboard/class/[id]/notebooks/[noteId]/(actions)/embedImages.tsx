'use server';

export async function embedImages(content: string): Promise<string> {
    // Regex to match [image: ...] placeholders
    const imageRegex = /\[image: ([^\]]+)\]/g;
    // Collect all unique queries
    const queries = Array.from(new Set(Array.from(content.matchAll(imageRegex)).map(match => match[1].trim())));
    if (queries.length === 0) return content;

    // Fetch images for each query
    const results: Record<string, { url: string; alt: string } | null> = {};
    await Promise.all(queries.map(async (query) => {
        console.log(`Searching for image with query: "${query}"`);
        try {
            const res = await fetch(`https://search.hackclub.com/res/v1/images/search?q=${encodeURIComponent(query)}&count=1`, {
                headers: {
                    Authorization: `Bearer ${process.env.HACKCLUB_SEARCH_API_KEY}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                if (data && data.results && data.results.length > 0) {
                    results[query] = {
                        url: data.results[0].properties.url,
                        alt: query
                    };
                } else {
                    console.log(`No image results found for query: "${query}"`);
                    results[query] = null;
                }
            } else {
                console.error(`Image search API error for query: "${query}", status: ${res.status}, text: ${await res.text()}`);
                results[query] = null;
            }
        } catch(error) {
            console.error(`Error fetching image for query: "${query}"`, error);
            results[query] = null;
        }
    }));

    // Replace placeholders with image markdown or fallback text
    return content.replace(imageRegex, (match, query) => {
        const result = results[query.trim()];
        if (result) {
            return `![${result.alt}](${result.url})`;
        } else {
            return `*[image: ${query}]*`;
        }
    });
}