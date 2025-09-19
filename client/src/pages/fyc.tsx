import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function FYC() {
    const [streamingLinks, setStreamingLinks] = useState<{ [key: string]: string }>({
        "Amazon Music": "https://music.amazon.com/albums/B0D7YQ6YQ1",
        "Apple Music": "https://music.apple.com/album/1768074405",
        "Deezer": "https://www.deezer.com/us/album/598962392",
        "Pandora": "https://www.pandora.com/artist/david-s-lefkowitz/preludes-and-fugues-books-i-ii/AL77xK3fhrvXJPZ",
        "Spotify": "https://open.spotify.com/album/5m5Ahe5oTR8p8fVYRAaGEJ",
        "Tidal": "https://tidal.com/browse/album/374849064",
        "YouTube": "https://www.youtube.com/playlist?list=OLAK5uy_nn8VxGnp1_Rd2ZQaLQqRCYgDt4d9aecX8"
    });
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        // Try to fetch updated links from Notion if available
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
                console.log("Using default streaming links");
                setIsLoading(false);
            });
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div className="space-y-6">
                <h1 className="text-4xl font-bold text-left pl-16" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                    For Your Consideration
                </h1>
                
                {/* Listen Here Section */}
                <Card className="bg-background">
                    <CardContent className="pt-6">
                        <h2 className="text-2xl font-semibold mb-4" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            LISTEN HERE:
                        </h2>
                        {isLoading ? (
                            <div className="flex flex-wrap gap-3">
                                {[...Array(7)].map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-32" />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(streamingLinks).map(([platform, url]) => (
                                    <Button
                                        key={platform}
                                        variant="outline"
                                        size="lg"
                                        className="hover:bg-accent transition-colors"
                                        style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                        asChild
                                    >
                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                            {platform}
                                        </a>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Grammy Submissions Section */}
                <Card className="bg-background">
                    <CardContent className="pt-6 space-y-6">
                        <h2 className="text-2xl font-semibold mb-4" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            FOR YOUR CONSIDERATION:
                        </h2>
                        
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
                                    Steven Beck, David Kaplan, Michael Mizrahi, & Mika Sasaki, pianos, with Cantor Marcus Feldman, baritone, and David S. Lefkowitz, whistling, and additional piano and extended piano techniques.
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
                                    Stuart Schenk, Benjamin Maas, Matheus Maciel
                                </dd>
                            </div>
                            
                            <div className="md:col-span-2">
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Editing and Mastering Engineers
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Steve Kaplan, Sergey Parfenov, with David S. Lefkowitz
                                </dd>
                            </div>
                            
                            <div className="md:col-span-2">
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Label
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Bridge Records, 200 Clinton Ave, New Rochelle, NY  10801
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
                                    Floating Point Music
                                </dd>
                            </div>
                            
                            <div className="md:col-span-2">
                                <dt className="font-semibold text-sm text-muted-foreground" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    David S. Lefkowitz Representation
                                </dt>
                                <dd className="mt-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Genevieve Spielberg Artists
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}