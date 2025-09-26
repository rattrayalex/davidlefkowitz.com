import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

export default function FYC() {
    const [, setLocation] = useLocation();
    
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
                
                {/* Album cover image - responsive positioning */}
                <div className="block lg:absolute lg:right-0 lg:top-0 lg:z-10 mb-6 lg:mb-0" style={{ paddingLeft: '24px' }}>
                    <div className="w-full lg:w-auto" style={{ maxWidth: '320px', height: '380px' }}>
                        <img 
                            src="/api/media-cache/recording_26c3907b_2ee6_81cb_9edf_f38464971746_14045b66.jpg"
                            alt="Preludes and Fugues Album Cover"
                            className="w-full h-full object-cover rounded-lg shadow-lg"
                        />
                    </div>
                </div>
                
                {/* Sixth Media Photo - positioned at same level as Album Cover */}
                <div className="block lg:absolute lg:right-0 mb-6 lg:mb-0" style={{ top: '412px', paddingLeft: '12px' }}>
                    <div className="w-full lg:w-auto" style={{ maxWidth: '320px', height: '380px' }}>
                        <img 
                            src="/photos/6. Lefkowitz-31.jpg"
                            alt="David S. Lefkowitz"
                            className="w-full h-full object-cover rounded-lg shadow-lg"
                        />
                    </div>
                </div>
                
                {/* Container for streaming links - adjusts layout on narrow screens */}
                <div className="lg:pr-80">
                    
                    {/* Listen Here Section with vertical links - extends full width behind image */}
                    <div className="rounded-lg pl-6 pr-6 lg:pr-6 pt-6" style={{ marginBottom: 0, paddingBottom: 0, minHeight: '36px' }}>
                        <button 
                            className="text-3xl font-semibold mb-4 hover:opacity-90 transition-opacity" 
                            style={{
                                fontFamily: 'Times, "Times New Roman", Palatino, serif',
                                backgroundColor: 'white',
                                border: '2px solid #d8b4fe',
                                padding: '11px 20px 5px 20px',
                                borderRadius: '1rem',
                                cursor: 'pointer'
                            }}
                            onClick={() => setLocation('/fyc/listennow')}
                        >
                            LISTEN NOW
                        </button>
                    </div>

                    {/* Grammy Submissions Section */}
                    <div className="rounded-lg pl-6 pr-6 lg:pr-6 pt-6" style={{ marginBottom: 0, paddingBottom: 0 }}>
                            <div className="space-y-4">
                                <div className="border-l-4 border-primary pl-4">
                                    <h3 className="font-bold" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.375rem', lineHeight: '2.0'}}>
                                        CONTEMPORARY CLASSICAL COMPOSITION
                                    </h3>
                                </div>

                                <div className="border-l-4 border-primary pl-4">
                                    <h3 className="font-bold" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.375rem', lineHeight: '2.0'}}>
                                        CLASSICAL COMPENDIUM
                                    </h3>
                                </div>

                                <div className="border-l-4 border-primary pl-4">
                                    <h3 className="font-bold" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.375rem', lineHeight: '2.0'}}>
                                        PRODUCER OF THE YEAR, CLASSICAL
                                    </h3>
                                </div>
                            </div>
                    </div>

                    {/* Album Details Section */}
                    <div className="relative rounded-lg pl-6 pr-6 lg:pr-6 pb-6" style={{ paddingTop: '64px' }}>
                        <h2 className="text-2xl font-semibold mb-4" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            Album Details
                        </h2>
                        
                        <div className="space-y-2">
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.375rem', lineHeight: '1.35'}}>
                                <span className="font-semibold">Composition:</span> {' '}
                                <a href={streamingLinks["Preludes and Fugues Book I"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Preludes and Fugues Book I
                                </a>
                                {" & "}
                                <a href={streamingLinks["Preludes and Fugues Book II"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Preludes and Fugues Book II
                                </a>
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.375rem', lineHeight: '1.35'}}>
                                <span className="font-semibold">Composer:</span> {' '}
                                <a href={streamingLinks["David S. Lefkowitz"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    David S. Lefkowitz
                                </a>
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.375rem', lineHeight: '1.35'}}>
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
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.375rem', lineHeight: '1.35'}}>
                                <span className="font-semibold">Duration:</span> 2:48:27
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.375rem', lineHeight: '1.35'}}>
                                <span className="font-semibold">Music Publisher:</span> {' '}
                                <a href={streamingLinks["Floating Point Music"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Floating Point Music
                                </a>
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.375rem', lineHeight: '1.35'}}>
                                <span className="font-semibold">David S. Lefkowitz Representation:</span> {' '}
                                <a href={streamingLinks["Genevieve Spielberg Artists"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Genevieve Spielberg Artists
                                </a>
                                {' '}
                                <a href="https://myemail.constantcontact.com/World-Premiere-Recording-By-Acclaimed-Contemporary-Composer-David-S--Lefkowitz-Preludes-and-Fugues-For-Piano-.html?soid=1103420701115&aid=L6AY6eaeS9M" 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   className="text-primary hover:underline">
                                    (Click for More Information)
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                </div>

                {/* Album Description */}
                <div className="container mx-auto px-4" style={{ paddingTop: '16px' }}>
                    <div style={{
                        fontFamily: 'Times, "Times New Roman", Palatino, serif', 
                        fontSize: '1.25rem', 
                        lineHeight: '1.75',
                        backgroundColor: 'white',
                        border: '2px solid #c8b6db',
                        padding: '2rem',
                        borderRadius: '1rem'
                    }}>
                        <p className="mb-4">
                            A world premiere recording of works by award-winning contemporary composer <span style={{fontWeight: 'bold', color: '#DC143C'}}>David S. Lefkowitz</span>, Preludes and Fugues for Piano features 26 preludes and fugues performed by four leading new music pianists. Lefkowitz{'\u2019'}s huge musical palette is described as {'\u201C'}near-Mahlerian{'\u201D'} in this challenging and rewarding cycle that spans three hours. In the words of producer David Starobin, {'\u201C'}every once in a while a project comes by which seems so original that I am challenged to re-screw my ears on and such was the case with Lefkowitz{'\u2019'}s Preludes and Fugues for Piano.{'\u201D'} The album is now available on Bridge Records (9594A/B) and all leading streaming services. Lefkowitz presents his Preludes and Fugues in two books with Book 1, entitled Expanded Universe, and Book II, Parallel Universes.
                        </p>
                        
                        <p className="mb-4">
                            The title of the first book refers to the expansion of the modes the composer created for this set. His second book uses the rich possibilities of prepared piano using screws and chopsticks, sponges, paper and beach towels together with whistling, vocal sounds, and a finale for two pianos, evoking parallel universes of music.
                        </p>
                        
                        <p className="mb-4">
                            The 50 tracks are performed by a team of four noted contemporary pianists: Steve Beck, David Kaplan, Michael Mizrahi, and Mika Sasaki, as well as Cantor Marcus Feldman and the composer himself. Lefkowitz can be heard contributing to the performances of Book II—whistling in Number 1, creating a special in-the-piano technique in Number 10, and playing an additional bass line at the end of Number 12. Cantor Marcus Feldman makes an invaluable cameo, singing the vocal part in the Prelude of Number 12.
                        </p>
                        
                        <p>
                            Early reviews for the recording include, {'\u201C'}an exciting collection….this album is a monumental accomplishment for the genre.{'\u201D'} In describing the results of his prepared piano, one writer wrote, {'\u201C'}the effect is hypnotic—the piano seemingly floats on air and then runs upon the earth as voices converge and then separate.{'\u201D'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}