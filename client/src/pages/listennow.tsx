export default function ListenNow() {
    // Same streaming links as on the FYC page
    const streamingPlatforms = [
        {
            name: "Amazon Music",
            url: "https://www.amazon.com/dp/B0F3FMBQVP",
            logo: "/api/logos/amazon-music.png" // Placeholder - will be replaced with Notion logos
        },
        {
            name: "Apple Music", 
            url: "https://classical.music.apple.com/us/album/1818776381",
            logo: "/api/logos/apple-music.png"
        },
        {
            name: "Deezer",
            url: "https://www.deezer.com/us/album/736897251",
            logo: "/api/logos/deezer.png"
        },
        {
            name: "Pandora",
            url: "https://www.pandora.com/artist/david-kaplan-mika-sasaki-michael-mizrahi-and-steven-beck/david-s-lefkowitz-preludes-and-fugues-for-piano/ALk9zhjXvZ56VgJ",
            logo: "/api/logos/pandora.png"
        },
        {
            name: "Spotify",
            url: "https://open.spotify.com/album/1AXDnGNFGtceS4zGvmLn8H",
            logo: "/api/logos/spotify.png"
        },
        {
            name: "Tidal",
            url: "https://tidal.com/browse/track/427812074/u",
            logo: "/api/logos/tidal.png"
        },
        {
            name: "YouTube",
            url: "https://youtube.com/playlist?list=PL1WjDUvuhzW9pgsYIJhDD9i374wjGNkKi",
            logo: "/api/logos/youtube.png"
        }
    ];
    
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
                            {streamingPlatforms.map((platform) => (
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
                                >
                                    {/* For now, show platform name as text until logos are available */}
                                    <span className="text-center text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                        {platform.name}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}