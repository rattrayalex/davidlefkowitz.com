export default function ListenNow() {
    // Same streaming links as on the FYC page
    const streamingLinks = {
        "Amazon Music": "https://www.amazon.com/dp/B0F3FMBQVP",
        "Apple Music": "https://classical.music.apple.com/us/album/1818776381",
        "Deezer": "https://www.deezer.com/us/album/736897251",
        "Pandora": "https://www.pandora.com/artist/david-kaplan-mika-sasaki-michael-mizrahi-and-steven-beck/david-s-lefkowitz-preludes-and-fugues-for-piano/ALk9zhjXvZ56VgJ",
        "Spotify": "https://open.spotify.com/album/1AXDnGNFGtceS4zGvmLn8H",
        "Tidal": "https://tidal.com/browse/track/427812074/u",
        "YouTube": "https://youtube.com/playlist?list=PL1WjDUvuhzW9pgsYIJhDD9i374wjGNkKi",
    };
    
    return (
        <div className="min-h-screen py-8">
            <div className="max-w-3xl mx-auto px-6">
                {/* Album Cover Image - centered at top */}
                <div className="flex justify-center mb-8">
                    <img 
                        src="/api/media-cache/recording_26c3907b_2ee6_81cb_9edf_f38464971746_14045b66.jpg"
                        alt="David S. Lefkowitz Preludes and Fugues Album Cover"
                        className="rounded-lg shadow-lg"
                        style={{ width: '400px', height: 'auto' }}
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
                        <div className="flex flex-col items-center space-y-4">
                            <a href={streamingLinks["Amazon Music"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xl" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                Amazon Music
                            </a>
                            <a href={streamingLinks["Apple Music"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xl" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                Apple Music
                            </a>
                            <a href={streamingLinks["Deezer"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xl" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                Deezer
                            </a>
                            <a href={streamingLinks["Pandora"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xl" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                Pandora
                            </a>
                            <a href={streamingLinks["Spotify"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xl" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                Spotify
                            </a>
                            <a href={streamingLinks["Tidal"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xl" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                Tidal
                            </a>
                            <a href={streamingLinks["YouTube"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xl" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                YouTube
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}