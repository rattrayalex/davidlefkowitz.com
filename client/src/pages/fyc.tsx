import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FYC() {
    // Streaming service links - update these with actual URLs
    const streamingLinks = {
        "Amazon Music": "#",
        "Apple Music": "#",
        "Deezer": "#",
        "Pandora": "#",
        "Spotify": "#",
        "Tidal": "#",
        "YouTube": "#"
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div className="space-y-6">
                <h1 className="text-4xl font-bold text-left pl-16">For Your Consideration</h1>
                
                {/* Listen Here Section */}
                <Card className="bg-background">
                    <CardContent className="pt-6">
                        <h2 className="text-2xl font-semibold mb-4">LISTEN HERE:</h2>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(streamingLinks).map(([platform, url]) => (
                                <Button
                                    key={platform}
                                    variant="outline"
                                    size="lg"
                                    className="hover:bg-accent transition-colors"
                                    asChild
                                >
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                        {platform}
                                    </a>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Grammy Submissions Section */}
                <Card className="bg-background">
                    <CardContent className="pt-6 space-y-6">
                        <h2 className="text-2xl font-semibold mb-4">FOR YOUR CONSIDERATION:</h2>
                        
                        <div className="space-y-4">
                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-bold text-lg">CONTEMPORARY CLASSICAL COMPOSITION</h3>
                                <p className="text-muted-foreground mt-1">
                                    Preludes and Fugues Books I & II, David S. Lefkowitz, Composer, on <em>David S. Lefkowitz, Preludes and Fugues</em> (Bridge Records 9594A/B)
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">Submission ID # 1073957</p>
                            </div>

                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-bold text-lg">CLASSICAL COMPENDIUM</h3>
                                <p className="text-muted-foreground mt-1">
                                    <em>David S. Lefkowitz, Preludes and Fugues</em> (Bridge Records 9594A/B)
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    David S. Lefkowitz producer, David Starobin and Becky Starobin, Executive Producers
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">Submission ID # 1074384</p>
                            </div>

                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-bold text-lg">PRODUCER OF THE YEAR, CLASSICAL</h3>
                                <p className="text-muted-foreground mt-1">
                                    David S. Lefkowitz, producer of <em>David S. Lefkowitz, Preludes and Fugues</em> (Bridge Records 9594A/B)
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">Submission ID # 74403</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Album Details Section */}
                <Card className="bg-background">
                    <CardContent className="pt-6">
                        <h2 className="text-2xl font-semibold mb-4">Album Details</h2>
                        
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground">Composition</dt>
                                <dd className="mt-1">Preludes and Fugues Book I & Preludes and Fugues Book II</dd>
                            </div>
                            
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground">Composer</dt>
                                <dd className="mt-1">David S. Lefkowitz</dd>
                            </div>
                            
                            <div className="md:col-span-2">
                                <dt className="font-semibold text-sm text-muted-foreground">Performers</dt>
                                <dd className="mt-1">Steven Beck, David Kaplan, Michael Mizrahi, & Mika Sasaki, pianos, with Cantor Marcus Feldman, baritone, and David S. Lefkowitz, whistling, and additional piano and extended piano techniques.</dd>
                            </div>
                            
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground">Duration</dt>
                                <dd className="mt-1">2:48:27</dd>
                            </div>
                            
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground">Recorded</dt>
                                <dd className="mt-1">20-24 May, 2023</dd>
                            </div>
                            
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground">Venue</dt>
                                <dd className="mt-1">UCLA Ostin Recording Studio</dd>
                            </div>
                            
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground">Recording Engineers</dt>
                                <dd className="mt-1">Stuart Schenk, Benjamin Maas, Matheus Maciel</dd>
                            </div>
                            
                            <div className="md:col-span-2">
                                <dt className="font-semibold text-sm text-muted-foreground">Editing and Mastering Engineers</dt>
                                <dd className="mt-1">Steve Kaplan, Sergey Parfenov, with David S. Lefkowitz</dd>
                            </div>
                            
                            <div className="md:col-span-2">
                                <dt className="font-semibold text-sm text-muted-foreground">Label</dt>
                                <dd className="mt-1">Bridge Records, 200 Clinton Ave, New Rochelle, NY  10801</dd>
                            </div>
                            
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground">Cover Image</dt>
                                <dd className="mt-1">Casey Siu</dd>
                            </div>
                            
                            <div>
                                <dt className="font-semibold text-sm text-muted-foreground">Music Publisher</dt>
                                <dd className="mt-1">Floating Point Music</dd>
                            </div>
                            
                            <div className="md:col-span-2">
                                <dt className="font-semibold text-sm text-muted-foreground">David S. Lefkowitz Representation</dt>
                                <dd className="mt-1">Genevieve Spielberg Artists</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}