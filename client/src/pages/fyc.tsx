import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function FYC() {
    // Hardcoded streaming links for faster loading
    const streamingLinks = {
        "Amazon Music": "https://www.amazon.com/dp/B0F3FMBQVP",
        "Apple Music": "https://classical.music.apple.com/us/album/1818776381",
        "Deezer": "https://www.deezer.com/us/album/736897251",
        "Pandora": "https://www.pandora.com/artist/david-kaplan-mika-sasaki-michael-mizrahi-and-steven-beck/david-s-lefkowitz-preludes-and-fugues-for-piano/ALk9zhjXvZ56VgJ",
        "Spotify": "https://open.spotify.com/album/1AXDnGNFGtceS4zGvmLn8H",
        "Tidal": "https://tidal.com/browse/track/427812074/u",
        "YouTube": "https://youtube.com/playlist?list=PL1WjDUvuhzW9pgsYIJhDD9i374wjGNkKi",
        "Preludes and Fugues Book I": "https://www.davidlefkowitz.com/compositions/Expanded_Universe",
        "Preludes and Fugues Book II": "https://www.davidlefkowitz.com/compositions/Parallel_Universes",
        "David S. Lefkowitz": "https://www.davidlefkowitz.com/",
        "Steven Beck": "https://stevenbeck.me/",
        "David Kaplan": "https://www.davidkaplanpiano.com/",
        "Michael Mizrahi": "https://www.michaelmizrahipiano.com/",
        "Mika Sasaki": "https://www.mikasasaki.com/",
        "Cantor Marcus Feldman": "https://www.sinaitemple.org/about/clergy-senior-staff/cantor-marcus-feldman/",
        "Stuart Schenk": "http://stuartschenk.com/",
        "Benjamin Maas": "http://www.fifthcircle.com/about.html",
        "Steve Kaplan": "https://www.noiseandotherdistortions.com/contact",
        "Bridge Records": "https://bridgerecords.com/",
        "Floating Point Music": "https://davidlefkowitz.com/contact#floating-point-music",
        "Genevieve Spielberg Artists": "https://www.gsiartists.com/"
    };
    
    useEffect(() => {
        // Set the browser window title for this page
        document.title = "FYC 2025: DAVID S. LEFKOWITZ PRELUDES AND FUGUES";
        
        // Reset to default title when leaving the page
        return () => {
            document.title = "David S. Lefkowitz";
        };
    }, []);

    return (
        <div className="py-6">
            <div className="max-w-5xl mx-auto px-6">
                <div className="relative">
                {/* Header */}
                <h1 className="text-4xl font-bold text-left mb-4" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', paddingLeft: '24px'}}>
                    For Your Consideration
                </h1>
                
                {/* Album cover image - positioned absolute on the right, aligned with title */}
                <div className="absolute right-0 top-0 z-10" style={{ width: '320px', height: '380px' }}>
                    <img 
                        src="/api/media-cache/recording_26c3907b_2ee6_81cb_9edf_f38464971746_14045b66.jpg"
                        alt="Preludes and Fugues Album Cover"
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                    />
                </div>
                
                {/* Container for streaming links */}
                <div>
                    
                    {/* Listen Here Section with vertical links - extends full width behind image */}
                    <div className="rounded-lg px-6 pt-6" style={{ marginBottom: 0, paddingBottom: 0, minHeight: '280px' }}>
                        <button className="text-3xl font-semibold mb-4" style={{
                            fontFamily: 'Times, "Times New Roman", Palatino, serif',
                            backgroundColor: 'white',
                            border: '2px solid #d8b4fe',
                            padding: '8px 20px',
                            borderRadius: '8px',
                            cursor: 'default'
                        }}>
                            LISTEN NOW
                        </button>
                        <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', paddingLeft: '24px'}}>
                            <div style={{ marginBottom: '4px' }}>
                                <a href={streamingLinks["Amazon Music"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Amazon Music
                                </a>
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                                <a href={streamingLinks["Apple Music"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Apple Music
                                </a>
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                                <a href={streamingLinks["Deezer"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Deezer
                                </a>
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                                <a href={streamingLinks["Pandora"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Pandora
                                </a>
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                                <a href={streamingLinks["Spotify"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Spotify
                                </a>
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                                <a href={streamingLinks["Tidal"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Tidal
                                </a>
                            </div>
                            <div style={{ marginBottom: '4px' }}>
                                <a href={streamingLinks["YouTube"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    YouTube
                                </a>
                            </div>
                        </div>
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
                                <span className="font-semibold">Composition:</span> {' '}
                                <a href={streamingLinks["Preludes and Fugues Book I"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Preludes and Fugues Book I
                                </a>
                                {" & "}
                                <a href={streamingLinks["Preludes and Fugues Book II"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Preludes and Fugues Book II
                                </a>
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Composer:</span> {' '}
                                <a href={streamingLinks["David S. Lefkowitz"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    David S. Lefkowitz
                                </a>
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Performers:</span> {' '}
                                <a href={streamingLinks["Steven Beck"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Steven Beck
                                </a>
                                {", "}
                                <a href={streamingLinks["David Kaplan"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    David Kaplan
                                </a>
                                {", "}
                                <a href={streamingLinks["Michael Mizrahi"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Michael Mizrahi
                                </a>
                                {", & "}
                                <a href={streamingLinks["Mika Sasaki"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Mika Sasaki
                                </a>
                                {", pianos, with "}
                                <a href={streamingLinks["Cantor Marcus Feldman"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Cantor Marcus Feldman
                                </a>
                                {", baritone, and "}
                                <a href={streamingLinks["David S. Lefkowitz"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    David S. Lefkowitz
                                </a>
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
                                <span className="font-semibold">Recording Engineers:</span> {' '}
                                <a href={streamingLinks["Stuart Schenk"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Stuart Schenk
                                </a>
                                {", "}
                                <a href={streamingLinks["Benjamin Maas"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Benjamin Maas
                                </a>
                                {", Matheus Maciel"}
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Editing and Mastering Engineers:</span> {' '}
                                <a href={streamingLinks["Steve Kaplan"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Steve Kaplan
                                </a>
                                {", Sergey Parfenov, with David S. Lefkowitz"}
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Label:</span> {' '}
                                <a href={streamingLinks["Bridge Records"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Bridge Records
                                </a>
                                {", 200 Clinton Ave, New Rochelle, NY  10801"}
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Cover Image:</span> Casey Siu
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">Music Publisher:</span> {' '}
                                <a href={streamingLinks["Floating Point Music"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Floating Point Music
                                </a>
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <span className="font-semibold">David S. Lefkowitz Representation:</span> {' '}
                                <a href={streamingLinks["Genevieve Spielberg Artists"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Genevieve Spielberg Artists
                                </a>
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