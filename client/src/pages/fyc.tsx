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
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div className="space-y-6">
                {/* Header with album image */}
                <div className="flex justify-between items-start">
                    <h1 className="text-4xl font-bold text-left pl-16" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                        For Your Consideration
                    </h1>
                    {/* Album cover image */}
                    <div className="w-64 h-64 flex-shrink-0 ml-8">
                        <img 
                            src="/api/media-cache/recording_26c3907b_2ee6_81cb_9edf_f38464971746_97444b41.jpg"
                            alt="Preludes and Fugues Album Cover"
                            className="w-full h-full object-cover rounded-lg shadow-lg"
                        />
                    </div>
                </div>
                
                {/* Listen Here Section with vertical links */}
                <Card className="bg-background">
                    <CardContent className="pt-6">
                        <h2 className="text-2xl font-semibold mb-4" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            LISTEN HERE:
                        </h2>
                        {isLoading ? (
                            <p className="text-muted-foreground">Loading streaming links...</p>
                        ) : (
                            <div className="space-y-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', paddingLeft: '24px'}}>
                                {streamingLinks["Amazon Music"] && (
                                    <div>
                                        <a href={streamingLinks["Amazon Music"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Amazon Music
                                        </a>
                                    </div>
                                )}
                                {streamingLinks["Apple Music"] && (
                                    <div>
                                        <a href={streamingLinks["Apple Music"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Apple Music
                                        </a>
                                    </div>
                                )}
                                {streamingLinks["Deezer"] && (
                                    <div>
                                        <a href={streamingLinks["Deezer"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Deezer
                                        </a>
                                    </div>
                                )}
                                {streamingLinks["Pandora"] && (
                                    <div>
                                        <a href={streamingLinks["Pandora"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Pandora
                                        </a>
                                    </div>
                                )}
                                {streamingLinks["Spotify"] && (
                                    <div>
                                        <a href={streamingLinks["Spotify"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Spotify
                                        </a>
                                    </div>
                                )}
                                {streamingLinks["Tidal"] && (
                                    <div>
                                        <a href={streamingLinks["Tidal"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Tidal
                                        </a>
                                    </div>
                                )}
                                {streamingLinks["YouTube"] && (
                                    <div>
                                        <a href={streamingLinks["YouTube"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            YouTube
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Album Details Section */}
                <Card className="bg-background">
                    <CardContent className="pt-6">
                        <h2 className="text-2xl font-semibold mb-4" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            Album Details
                        </h2>
                        
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Composition
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Preludes and Fugues Book I & Preludes and Fugues Book II
                                </dd>
                            </div>
                            
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Composer
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    David S. Lefkowitz
                                </dd>
                            </div>
                            
                            <div className="md:col-span-2">
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Performers
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    {streamingLinks["Steven Beck"] ? (
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
                                    {", baritone, and David S. Lefkowitz, whistling, and additional piano and extended piano techniques."}
                                </dd>
                            </div>
                            
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Duration
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    2:48:27
                                </dd>
                            </div>
                            
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Recorded
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    20-24 May, 2023
                                </dd>
                            </div>
                            
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Venue
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    UCLA Ostin Recording Studio
                                </dd>
                            </div>
                            
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Recording Engineers
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    {streamingLinks["Stuart Schenk"] ? (
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
                                </dd>
                            </div>
                            
                            <div className="md:col-span-2">
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Editing and Mastering Engineers
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    {streamingLinks["Steve Kaplan"] ? (
                                        <a href={streamingLinks["Steve Kaplan"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Steve Kaplan
                                        </a>
                                    ) : "Steve Kaplan"}
                                    {", Sergey Parfenov, with David S. Lefkowitz"}
                                </dd>
                            </div>
                            
                            <div className="md:col-span-2">
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Label
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    {streamingLinks["Bridge Records"] ? (
                                        <a href={streamingLinks["Bridge Records"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Bridge Records
                                        </a>
                                    ) : "Bridge Records"}
                                    {", 200 Clinton Ave, New Rochelle, NY  10801"}
                                </dd>
                            </div>
                            
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Cover Image
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Casey Siu
                                </dd>
                            </div>
                            
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Music Publisher
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    {streamingLinks["Floating Point Music"] ? (
                                        <a href={streamingLinks["Floating Point Music"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Floating Point Music
                                        </a>
                                    ) : "Floating Point Music"}
                                </dd>
                            </div>
                            
                            <div className="md:col-span-2">
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    David S. Lefkowitz Representation
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    {streamingLinks["Genevieve Spielberg Artists"] ? (
                                        <a href={streamingLinks["Genevieve Spielberg Artists"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                            Genevieve Spielberg Artists
                                        </a>
                                    ) : "Genevieve Spielberg Artists"}
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}