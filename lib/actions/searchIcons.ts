import Fuse from 'fuse.js';
import { iconNames } from 'lucide-react/dynamic';
import tags from 'lucide-static/tags.json';

const fuse = new Fuse(
    Object.keys(tags).map((name) => ({
        name,
        alias: tags[name as keyof typeof tags]
    })), 
    {
        keys: [{
            name: 'name',
            weight: 0.7
        }, {
            name: 'alias',
            weight: 0.3
        }],
        threshold: 0.2,
    }
);

export default function searchIcons(query: string) {
    const specialIcons = ['presentation', 'book-open', 'globe', 'scroll', 'drafting-compass', 'ruler-dimension-line', 'atom', 'stethoscope', 'book-open-text'];
    if (!query) return [...specialIcons, ...iconNames.filter(name => !specialIcons.includes(name))];;
    
    const results = fuse.search(query, {
        limit: 50
    });
    return results.filter((result)=> iconNames.includes(result.item.name as any)).map(result => result.item.name);
}