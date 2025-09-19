import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FYC() {
    const [streamingLinks, setStreamingLinks] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        // Fetch updated links from Notion
        fetch("/api/fyc-content")
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                throw new Error('Failed to fetch');
            })
            .then(data => {
                if (data.links && Object.keys(data.links).length > 0) {
                    setStreamingLinks(data.links);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.log("Error fetching FYC content:", err);
                // Fallback to default links
                setStreamingLinks({
                    "Amazon Music": "https://www.amazon.com/dp/B0F3FMBQVP",
                    "Apple Music": "https://classical.music.apple.com/us/album/1818776381",
                    "Deezer": "https://www.deezer.com/us/album/736897251",
                    "Pandora": "https://www.pandora.com/artist/david-kaplan-mika-sasaki-michael-mizrahi-and-steven-beck/david-s-lefkowitz-preludes-and-fugues-for-piano/ALk9zhjXvZ56VgJ",
                    "Spotify": "https://open.spotify.com/album/1AXDnGNFGtceS4zGvmLn8H",
                    "Tidal": "https://tidal.com/browse/track/427812074/u",
                    "YouTube": "https://youtube.com/playlist?list=PL1WjDUvuhzW9pgsYIJhDD9i374wjGNkKi"
                });
                setIsLoading(false);
            });
    }, []);

    return (
        <div className="fyc-animated-background">
            <div className="max-w-5xl mx-auto p-6">
                <div className="relative">
                {/* Header */}
                <h1 className="text-4xl font-bold text-left mb-4" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', paddingLeft: '24px'}}>
                    For Your Consideration
                </h1>
                
                {/* Album cover image - positioned absolute on the right, aligned with title */}
                <div className="absolute right-0 top-0 z-10" style={{ width: '320px', height: '380px' }}>
                    <img 
                        src="/api/media-cache/recording_26c3907b_2ee6_81cb_9edf_f38464971746_97444b41.jpg"
                        alt="Preludes and Fugues Album Cover"
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                    />
                </div>
                
                {/* Container for streaming links */}
                <div>
                    
                    {/* Listen Here Section with vertical links - extends full width behind image */}
                    <div className="rounded-lg px-6 pt-6" style={{ marginBottom: 0, paddingBottom: 0, minHeight: '280px' }}>
                        <h2 className="text-2xl font-semibold mb-4" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            LISTEN HERE:
                        </h2>
                        {!isLoading && (
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', paddingLeft: '24px'}}>
                                {streamingLinks["Amazon Music"] && (
                                    <div style={{ marginBottom: '4px' }}>
                                        <a href={streamingLinks["Amazon Music"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Amazon Music
                                        </a>
                                    </div>
                                )}
                                {streamingLinks["Apple Music"] && (
                                    <div style={{ marginBottom: '4px' }}>
                                        <a href={streamingLinks["Apple Music"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Apple Music
                                        </a>
                                    </div>
                                )}
                                {streamingLinks["Deezer"] && (
                                    <div style={{ marginBottom: '4px' }}>
                                        <a href={streamingLinks["Deezer"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Deezer
                                        </a>
                                    </div>
                                )}
                                {streamingLinks["Pandora"] && (
                                    <div style={{ marginBottom: '4px' }}>
                                        <a href={streamingLinks["Pandora"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Pandora
                                        </a>
                                    </div>
                                )}
                                {streamingLinks["Spotify"] && (
                                    <div style={{ marginBottom: '4px' }}>
                                        <a href={streamingLinks["Spotify"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Spotify
                                        </a>
                                    </div>
                                )}
                                {streamingLinks["Tidal"] && (
                                    <div style={{ marginBottom: '4px' }}>
                                        <a href={streamingLinks["Tidal"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Tidal
                                        </a>
                                    </div>
                                )}
                                {streamingLinks["YouTube"] && (
                                    <div style={{ marginBottom: '4px' }}>
                                        <a href={streamingLinks["YouTube"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            YouTube
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Grammy Submissions Section */}
                <div className="rounded-lg px-6 pt-6" style={{ marginBottom: 0, paddingBottom: 0 }}>
                        <div className="space-y-4">
                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-bold text-lg" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    CONTEMPORARY CLASSICAL COMPOSITION
                                </h3>
                                <p className="text-muted-foreground mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Preludes and Fugues Books I & II, David S. Lefkowitz, Composer, on <em>David S. Lefkowitz, Preludes and Fugues</em> (Bridge Records 9594A/B)
                                </p>
                                <p className="text-sm text-muted-foreground mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Submission ID # 1073957
                                </p>
                            </div>

                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-bold text-lg" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    CLASSICAL COMPENDIUM
                                </h3>
                                <p className="text-muted-foreground mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    <em>David S. Lefkowitz, Preludes and Fugues</em> (Bridge Records 9594A/B)
                                </p>
                                <p className="text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    David S. Lefkowitz producer, David Starobin and Becky Starobin, Executive Producers
                                </p>
                                <p className="text-sm text-muted-foreground mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Submission ID # 1074384
                                </p>
                            </div>

                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-bold text-lg" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    PRODUCER OF THE YEAR, CLASSICAL
                                </h3>
                                <p className="text-muted-foreground mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    David S. Lefkowitz, producer of <em>David S. Lefkowitz, Preludes and Fugues</em> (Bridge Records 9594A/B)
                                </p>
                                <p className="text-sm text-muted-foreground mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Submission ID # 74403
                                </p>
                            </div>
                        </div>
                </div>

                {/* Album Details Section */}
                <div className="rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            Album Details
                        </h2>
                        
                        <div className="space-y-2">
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Composition:</span> {streamingLinks["Preludes and Fugues Book I"] && streamingLinks["Preludes and Fugues Book II"] ? (
                                    <>
                                        <a href={streamingLinks["Preludes and Fugues Book I"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Preludes and Fugues Book I
                                        </a>
                                        {" & "}
                                        <a href={streamingLinks["Preludes and Fugues Book II"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Preludes and Fugues Book II
                                        </a>
                                    </>
                                ) : (
                                    <>Preludes and Fugues Book I & Preludes and Fugues Book II</>
                                )}
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Composer:</span> {streamingLinks["David S. Lefkowitz"] ? (
                                    <a href={streamingLinks["David S. Lefkowitz"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        David S. Lefkowitz
                                    </a>
                                ) : "David S. Lefkowitz"}
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Performers:</span> {streamingLinks["Steven Beck"] ? (
                                    <a href={streamingLinks["Steven Beck"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Steven Beck
                                    </a>
                                ) : "Steven Beck"}
                                {", "}
                                {streamingLinks["David Kaplan"] ? (
                                    <a href={streamingLinks["David Kaplan"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        David Kaplan
                                    </a>
                                ) : "David Kaplan"}
                                {", "}
                                {streamingLinks["Michael Mizrahi"] ? (
                                    <a href={streamingLinks["Michael Mizrahi"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Michael Mizrahi
                                    </a>
                                ) : "Michael Mizrahi"}
                                {", & "}
                                {streamingLinks["Mika Sasaki"] ? (
                                    <a href={streamingLinks["Mika Sasaki"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Mika Sasaki
                                    </a>
                                ) : "Mika Sasaki"}
                                {", pianos, with "}
                                {streamingLinks["Cantor Marcus Feldman"] ? (
                                    <a href={streamingLinks["Cantor Marcus Feldman"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Cantor Marcus Feldman
                                    </a>
                                ) : "Cantor Marcus Feldman"}
                                {", baritone, and "}
                                {streamingLinks["David S. Lefkowitz"] ? (
                                    <a href={streamingLinks["David S. Lefkowitz"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        David S. Lefkowitz
                                    </a>
                                ) : "David S. Lefkowitz"}
                                {", whistling, and additional piano and extended piano techniques."}
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Duration:</span> 2:48:27
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Recorded:</span> 20-24 May, 2023
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Venue:</span> UCLA Ostin Recording Studio
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Recording Engineers:</span> {streamingLinks["Stuart Schenk"] ? (
                                    <a href={streamingLinks["Stuart Schenk"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Stuart Schenk
                                    </a>
                                ) : "Stuart Schenk"}
                                {", "}
                                {streamingLinks["Benjamin Maas"] ? (
                                    <a href={streamingLinks["Benjamin Maas"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Benjamin Maas
                                    </a>
                                ) : "Benjamin Maas"}
                                {", Matheus Maciel"}
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Editing and Mastering Engineers:</span> {streamingLinks["Steve Kaplan"] ? (
                                    <a href={streamingLinks["Steve Kaplan"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Steve Kaplan
                                    </a>
                                ) : "Steve Kaplan"}
                                {", Sergey Parfenov, with David S. Lefkowitz"}
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Label:</span> {streamingLinks["Bridge Records"] ? (
                                    <a href={streamingLinks["Bridge Records"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Bridge Records
                                    </a>
                                ) : "Bridge Records"}
                                {", 200 Clinton Ave, New Rochelle, NY  10801"}
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Cover Image:</span> Casey Siu
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Music Publisher:</span> {streamingLinks["Floating Point Music"] ? (
                                    <a href={streamingLinks["Floating Point Music"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Floating Point Music
                                    </a>
                                ) : "Floating Point Music"}
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">David S. Lefkowitz Representation:</span> {streamingLinks["Genevieve Spielberg Artists"] ? (
                                    <a href={streamingLinks["Genevieve Spielberg Artists"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        Genevieve Spielberg Artists
                                    </a>
                                ) : "Genevieve Spielberg Artists"}
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <a href="https://myemail.constantcontact.com/World-Premiere-Recording-By-Acclaimed-Contemporary-Composer-David-S--Lefkowitz-Preludes-and-Fugues-For-Piano-.html?soid=1103420701115&aid=L6AY6eaeS9M" 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   className="text-primary hover:underline">
                                    Click for More Information
                                </a>
                            </div>
                        </div>
                </div>
            </div>
            </div>
        </div>
    );
}