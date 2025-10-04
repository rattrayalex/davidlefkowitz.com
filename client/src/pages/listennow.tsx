import { useEffect, useState } from 'react';

export default function ListenNow() {
    const [logos, setLogos] = useState<{ [key: string]: string }>({});
    
    // Streaming links (excluding YouTube)
    const streamingPlatforms = [
        {
            name: "Amazon Music",
            url: "https://www.amazon.com/dp/B0F3FMBQVP",
        },
        {
            name: "Apple Music", 
            url: "https://classical.music.apple.com/us/album/1818776381",
        },
        {
            name: "Deezer",
            url: "https://www.deezer.com/us/album/736897251",
        },
        {
            name: "Pandora",
            url: "https://www.pandora.com/artist/david-kaplan-mika-sasaki-michael-mizrahi-and-steven-beck/david-s-lefkowitz-preludes-and-fugues-for-piano/ALk9zhjXvZ56VgJ",
        },
        {
            name: "Spotify",
            url: "https://open.spotify.com/album/1AXDnGNFGtceS4zGvmLn8H",
        },
        {
            name: "Tidal",
            url: "https://tidal.com/browse/track/427812074",
        }
    ];
    
    // YouTube link separate
    const youtubeLink = {
        name: "YouTube",
        url: "https://youtube.com/playlist?list=PL1WjDUvuhzW9pgsYIJhDD9i374wjGNkKi",
    };
    
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
                        src="/api/media-cache/recording_26c3907b_2ee6_81cb_9edf_f38464971746_14045b66.jpg"
                        alt="David S. Lefkowitz Preludes and Fugues Album Cover"
                        className="shadow-lg"
                        style={{ width: '400px', height: 'auto', borderRadius: '8px' }}
                    />
                </div>
                
                {/* Streaming Links Container */}
                <div className="flex justify-center">
                    <div style={{
                        width: '400px',
                        backgroundColor: 'white',
                        border: '2px solid #d8b4fe',
                        borderRadius: '8px',
                        padding: '30px'
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
                        
                        {/* YouTube Link - centered at bottom */}
                        <div className="flex justify-center mt-6">
                            <a 
                                href={youtubeLink.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-center p-4 hover:opacity-80 transition-opacity"
                                style={{
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: '8px',
                                    width: '150px',
                                    minHeight: '80px'
                                }}
                                onClick={() => {
                                    // Track streaming link click
                                    fetch('/api/track', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ 
                                            event_type: 'streaming_link_click',
                                            event_data: youtubeLink.name
                                        })
                                    }).catch(() => {}); // Silent fail
                                }}
                            >
                                {logos[youtubeLink.name] ? (
                                    <img 
                                        src={logos[youtubeLink.name]} 
                                        alt={`${youtubeLink.name} logo`}
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
                                            textSpan.textContent = youtubeLink.name;
                                            e.currentTarget.parentElement?.appendChild(textSpan);
                                        }}
                                    />
                                ) : (
                                    <span className="text-center text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                        {youtubeLink.name}
                                    </span>
                                )}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}