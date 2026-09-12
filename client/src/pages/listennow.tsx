import { useEffect, useState } from 'react';

export default function ListenNow() {
    const [logos, setLogos] = useState<{ [key: string]: string }>({});
    
    // Streaming links (excluding YouTube)
    const streamingPlatforms = [
        {
            name: "Amazon Music",
            url: "https://www.amazon.com/dp/B0FNYHCXL1/",
        },
        {
            name: "Apple Music",
            url: "https://music.apple.com/us/album/beethoven-ligeti-david-s-lefkowitz-string-quartets/1842288546",
        },
        {
            name: "Deezer",
            url: "https://www.deezer.com/us/album/811971001",
        },
        {
            name: "BeMusic",
            url: "https://bemusic.1.vebto.com/artist/232641032/quartet-integra",
        },
        {
            name: "Spotify",
            url: "https://open.spotify.com/album/7w6RkfQclTfrWNmFnYdamF",
        },
        {
            name: "Tidal",
            url: "https://tidal.com/album/456756741",
        }
    ];

    // YouTube links separate (this recording has two)
    const youtubeLinks = [
        {
            name: "YouTube",
            url: "https://www.youtube.com/watch?v=AwUWmuyQ6Qg",
        },
        {
            name: "YouTube (2)",
            url: "https://www.youtube.com/watch?v=ook5P7LPfvk",
        },
    ];
    
    useEffect(() => {
        // Fetch logos from API
        fetch('/api/logos')
            .then(res => res.json())
            .then(data => {
                const logoMap: { [key: string]: string } = {};
                data.forEach((item: { platform: string, path: string }) => {
                    logoMap[item.platform] = item.path;
                });
                setLogos(logoMap);
            })
            .catch(error => console.error("Error fetching logos:", error));
    }, []);
    
    return (
        <div className="min-h-screen py-8">
            <div className="max-w-3xl mx-auto px-6">
                {/* Album Cover Image - centered at top */}
                <div className="flex justify-center mb-8">
                    <img
                        src="/api/media-cache/cover_Quartet_Integra.jpg"
                        alt="Green Mountains, Now Black — Quartet Integra Album Cover"
                        className="shadow-lg"
                        style={{ width: '400px', height: 'auto', borderRadius: '8px' }}
                    />
                </div>
                
                {/* Streaming Links Grid */}
                <div className="flex justify-center">
                    <div style={{
                        width: '400px'
                    }}>
                        <div className="grid grid-cols-2 gap-6">
                            {streamingPlatforms.map((platform) => {
                                const logoPath = logos[platform.name];
                                
                                return (
                                    <a 
                                        key={platform.name}
                                        href={platform.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex items-center justify-center p-4 hover:opacity-80 transition-opacity"
                                        style={{
                                            backgroundColor: '#f9f9f9',
                                            border: '1.5px solid hsl(262.1, 83.3%, 57.8%)',
                                            borderRadius: '8px',
                                            minHeight: '80px'
                                        }}
                                        onClick={() => {
                                            // Track streaming link click
                                            fetch('/api/track', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ 
                                                    event_type: 'streaming_link_click',
                                                    event_data: platform.name
                                                })
                                            }).catch(() => {}); // Silent fail
                                        }}
                                    >
                                        {logoPath ? (
                                            <img
                                                src={logoPath}
                                                alt={`${platform.name} logo`}
                                                style={{
                                                    maxHeight: platform.name === "BeMusic" ? '64px' : '40px',
                                                    maxWidth: '100%',
                                                    objectFit: 'contain'
                                                }}
                                                onError={(e) => {
                                                    // Fallback to text if image fails
                                                    e.currentTarget.style.display = 'none';
                                                    const textSpan = document.createElement('span');
                                                    textSpan.className = 'text-center text-gray-700';
                                                    textSpan.style.fontFamily = 'Times, "Times New Roman", Palatino, serif';
                                                    textSpan.textContent = platform.name;
                                                    e.currentTarget.parentElement?.appendChild(textSpan);
                                                }}
                                            />
                                        ) : (
                                            <span className="text-center text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                {platform.name}
                                            </span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                        
                        {/* YouTube Links - same width as the platform tiles above */}
                        <div className="grid grid-cols-2 gap-6 mt-6">
                            {youtubeLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center p-4 hover:opacity-80 transition-opacity"
                                    style={{
                                        backgroundColor: '#f9f9f9',
                                        border: '1.5px solid hsl(262.1, 83.3%, 57.8%)',
                                        borderRadius: '8px',
                                        minHeight: '80px'
                                    }}
                                    onClick={() => {
                                        // Track streaming link click
                                        fetch('/api/track', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                event_type: 'streaming_link_click',
                                                event_data: link.name
                                            })
                                        }).catch(() => {}); // Silent fail
                                    }}
                                >
                                    {logos["YouTube"] ? (
                                        <img
                                            src={logos["YouTube"]}
                                            alt={`${link.name} logo`}
                                            style={{
                                                maxHeight: '40px',
                                                maxWidth: '100%',
                                                objectFit: 'contain'
                                            }}
                                            onError={(e) => {
                                                // Fallback to text if image fails
                                                e.currentTarget.style.display = 'none';
                                                const textSpan = document.createElement('span');
                                                textSpan.className = 'text-center text-gray-700';
                                                textSpan.style.fontFamily = 'Times, "Times New Roman", Palatino, serif';
                                                textSpan.textContent = link.name;
                                                e.currentTarget.parentElement?.appendChild(textSpan);
                                            }}
                                        />
                                    ) : (
                                        <span className="text-center text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                            {link.name}
                                        </span>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}