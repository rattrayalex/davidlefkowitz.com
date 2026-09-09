import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import LazyImage from "@/components/ui/lazy-image";

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
        document.title = "FYC 2025: DAVID S. LEFKOWITZ GREEN MOUNTAINS, NOW BLACK";
        
        // Track FYC page visit
        fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event_type: 'fyc_visit' })
        }).catch(() => {}); // Silent fail - don't break the page
        
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
                
                {/* Subtitle */}
                <h2 className="font-bold mb-4 mt-8" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.375rem', paddingLeft: '24px', color: '#7A0C1C'}}>
                    DAVID S. LEFKOWITZ<br/>
                    GREEN MOUNTAINS, NOW BLACK
                </h2>
                
                {/* Album cover image - responsive positioning */}
                <div className="block lg:absolute lg:right-0 lg:z-10 mb-6 lg:mb-0" style={{ paddingLeft: '24px', top: '64px' }}>
                    <div className="w-full lg:w-auto" style={{ maxWidth: '420px' }}>
                        <LazyImage 
                            src="/api/media-cache/cover_Quartet_Integra.jpg"
                            alt="Green Mountains, Now Black — Quartet Integra Album Cover"
                            className="w-full h-auto object-contain rounded-lg shadow-lg"
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
                                border: '3.5px solid hsl(262.1, 83.3%, 57.8%)',
                                outline: '1.5px solid hsl(262.1, 83.3%, 57.8%)',
                                outlineOffset: '2.0px',
                                padding: '11px 20px 5px 20px',
                                borderRadius: '1rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
                            }}
                            onClick={() => {
                                // Track Listen Now button click
                                fetch('/api/track', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ event_type: 'listen_now_click' })
                                }).catch(() => {}); // Silent fail
                                window.open('/recordings/Quartet_Integra', '_blank');
                            }}
                        >
                            LISTEN NOW
                        </button>
                    </div>

                    {/* Grammy Submissions Section */}
                    <div className="rounded-lg pl-6 pr-6 lg:pr-6 pt-6" style={{ marginBottom: 0, paddingBottom: 0 }}>
                            <div className="space-y-4">
                                <div className="border-l-4 border-primary pl-4">
                                    <h3 className="font-bold" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.375rem', lineHeight: '1.3'}}>
                                        CONTEMPORARY<br/>
                                        CLASSICAL COMPOSITION
                                    </h3>
                                </div>

                                <div className="border-l-4 border-primary pl-4">
                                    <h3 className="font-bold" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.375rem', lineHeight: '1.3'}}>
                                        CHAMBER MUSIC /<br/>
                                        SMALL ENSEMBLE PERFORMANCE
                                    </h3>
                                </div>
                            </div>
                    </div>


                    {/* Album Details Section */}
                    <div className="relative rounded-lg pl-6 pr-6 lg:pr-6 pb-6 pt-0 lg:pt-16">
                        <h2 className="text-2xl font-semibold mb-4" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            Album Details
                        </h2>
                        
                        <div className="space-y-2">
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.5rem', lineHeight: '1.35', fontWeight: 525}}>
                                <span style={{fontWeight: 600}}>Composition:</span> {' '}
                                <a href="https://www.davidlefkowitz.com/compositions/Green_Mountains" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Green Mountains, Now Black
                                </a>
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.5rem', lineHeight: '1.35', fontWeight: 525}}>
                                <span style={{fontWeight: 600}}>Composer:</span> {' '}
                                <a href={streamingLinks["David S. Lefkowitz"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    David S. Lefkowitz
                                </a>
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.5rem', lineHeight: '1.35', fontWeight: 525}}>
                                <span style={{fontWeight: 600}}>Performers:</span> {' '}
                                <a href="https://quartetintegra.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Kyoka Misawa, Rintaro Kikuno, violin, Itsuki Yamamoto, viola, Ye Un Park, {'\u2019'}cello
                                </a>
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.5rem', lineHeight: '1.35', fontWeight: 525}}>
                                <span style={{fontWeight: 600}}>Duration:</span> 15:05
                            </div>
                            
                            <div style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1.5rem', lineHeight: '1.35', fontWeight: 525}}>
                                <span style={{fontWeight: 600}}>Music Publisher:</span> {' '}
                                <a href={streamingLinks["Floating Point Music"]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    Floating Point Music
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
                        fontSize: '1.375rem', 
                        lineHeight: '1.75',
                        fontWeight: 525,
                        backgroundColor: 'white',
                        border: '2px solid #c8b6db',
                        padding: '2rem 2.5rem',
                        borderRadius: '1rem'
                    }}>
                        <p className="mb-4">
                            The first ever commercial recording of Quartet Integra, the much heralded young quartet out of Japan and Los Angeles, and now resident in Hamburg, Germany, include Beethoven{'\u2019'}s and Ligeti{'\u2019'}s last string quartets, and a world premiere recording of Green Mountains, Now Black, commissioned specifically for Quartet Integra and this self-titled CD.  Composer David S. Lefkowitz writes the following about the music:
                        </p>

                        <p className="mb-4" style={{paddingLeft: '2rem', paddingRight: '2rem'}}>
                            {'\u201C'}The name Monteverdi means, of course, green mountain.  I was working on this treatment of excerpts from Monteverdi{'\u2019'}s Orfeo and L{'\u2019'}incoronazione di Poppea just as the Los Angeles fires of January, 2025 were burning, though, so it seemed particularly thoughtless to be working on such a composition, until I realized that the mournfulness found in so much of Monteverdi{'\u2019'}s music could be directed toward the situation at hand.  This is especially true of {'\u2018'}Non Morir{'\u2019'} ({'\u2018'}Don{'\u2019'}t Die!{'\u2019'}) and {'\u2018'}A Dio, Roma{'\u2019'} ({'\u2018'}Goodbye, Rome{'\u2019'}) from Poppea, but could also be said of {'\u2018'}Possente Spirto{'\u2019'} ({'\u2018'}Mighty Spirit{'\u2019'}) from Orfeo, in which Orpheus in the netherworld begs to bring his dead wife back to the world of the living.
                        </p>

                        <p className="mb-4" style={{paddingLeft: '2rem', paddingRight: '2rem'}}>
                            {'\u201C'}The one excerpt that does not fit this mold is {'\u2018'}Pur Ti Miro{'\u2019'} ({'\u2018'}I Gaze Upon You{'\u2019'}), the love duet at the end of Poppea, but then, it scarcely fits into the original opera at all — not least because it was probably not composed by Monteverdi, but also because the aria celebrates the culmination of Poppea{'\u2019'}s and Nero{'\u2019'}s scheming to divorce and depose Octavia, Nero{'\u2019'}s wife, and install Poppea in her stead, which would prove to be only a brief moment of joy in her life (as she would live scarcely three more years).  In Green Mountains, Now Black the displacement of Octavia by Poppea is rectified by the music:  {'\u2018'}A Dio Roma{'\u2019'} is played simultaneously with and then winds up displacing {'\u2018'}Pur Ti Miro,{'\u2019'} It thus ends the quartet on a sad note, as we bid farewell to our beloved city.{'\u201D'}
                        </p>

                        <p>
                            Musically the composition is full of grief.  The grief of Orfeo for the loss of Euridice and the grief of Seneca{'\u2019'}s students and followers for his imminent death come directly from Monteverdi{'\u2019'}s originals.  But woven into the interstitial spaces are Jewish klezmer-style sobs and cries, and long descending lines that carry through from the end of the first movement through to the very end of the composition.  In effect, this turns on its head the opening line of Tolstoy{'\u2019'}s Anna Karenina ({'\u201C'}All happy families are alike; each unhappy family is unhappy in its own way{'\u201D'}):  while all unhappy families are unhappy in their own ways, we all know grief and recognize it in others, no matter what language we speak.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}