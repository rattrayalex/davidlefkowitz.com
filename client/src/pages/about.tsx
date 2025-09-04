import React from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Profile } from "@shared/schema";
import twelvePointStarSvg from "@/assets/12_point_curved.svg";

export default function About() {
    const { data: profile, isLoading } = useQuery({
        queryKey: ["/api/profile"],
        queryFn: async () => {
            const response = await fetch("/api/profile");
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        },
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{backgroundColor: '#e5e5ff'}}>
            {/* Hero Section */}
            <section className="pt-20 pb-16 relative" style={{backgroundColor: '#e5e5ff'}}>
                {/* 12-pointed star decoration */}
                <div 
                    className="absolute -top-0 right-4 opacity-100 pointer-events-none hidden md:block"
                    style={{
                        backgroundImage: `url(${twelvePointStarSvg})`,
                        backgroundPosition: 'center center', 
                        backgroundSize: '300px 300px',
                        backgroundRepeat: 'no-repeat',
                        width: '300px',
                        height: '300px',
                        zIndex: 0,
                        filter: 'saturate(400%)'
                    }}
                ></div>
                
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-navy mb-6" data-testid="about-title" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            About
                        </h1>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-4">
                
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-3 gap-12 items-start">
                        {/* Photo */}
                        <div className="md:col-span-1">
                            <img 
                                src={(profile as any)?.photo_url}
                                alt={(profile as any)?.name}
                                className="rounded-xl shadow-lg w-full"
                                data-testid="about-photo"
                            />
                        </div>

                        {/* Bio Content */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <h2 className="text-3xl font-playfair font-bold text-navy mb-4" data-testid="profile-name" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    {(profile as any)?.name}
                                </h2>
                                <p className="text-lg text-gray-600" data-testid="profile-institution" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    {(profile as any)?.institution}
                                </p>
                            </div>

                            <div className="prose prose-lg max-w-none">
                                <div className="text-gray-700 leading-relaxed" data-testid="profile-bio" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    {profile ? (
                                        <div>
                                            <p className="mb-4">
                                                Composer, theorist, and professor David S. Lefkowitz has won international acclaim, with performances in Japan, China, Hong Kong, Taiwan, Russia, Ukraine, Switzerland, Italy, Netherlands, UK, France, Germany, Hungary, Czechoslovakia, Spain, Canada, Mexico, Israel, and Egypt. He has won recognition from Fukui Harp Music, ASCAP Young Composers, NACUSA, Guild of Temple Musicians, Chicago Civic Orchestra, Washington International, Society for New Music's Brian Israel, ALEA III, and Gaudeamus Music Week. He has had residencies with the University of Nevada/Las Vegas, National Sun-Yat Sen University (Kaoshiung, Taiwan), National Capital Normal University (Beijing, China), Herzen University (St. Petersburg, Russia), and Meet the Composer. He has presented his music at countless universities across four continents and throughout the United States. He has also been a judge for many competitions for composers, locally, nationally, and in St. Petersburg, Russia.
                                            </p>
                                            <p className="mb-4">
                                                Dr. David S. Lefkowitz received his Ph.D. in Music Composition and Theory from the Eastman School of Music/University of Rochester, where he studied primarily with Samuel Adler and Joseph Schwantner. He received his M.A. in Music Composition from University of Pennsylvania, where he studied primarily with George Crumb. He received his B.A. from Cornell University, where he studied both philosophy and music, and where he studied music composition with Karel Husa and Yehudi Wyner.
                                            </p>
                                            <p className="mb-4">
                                                At UCLA, David S. Lefkowitz teaches courses in Music Composition, Orchestration, Contemporary Music Analysis, Music Theory, Speculative Music Theory, and Music Theory for Composers. In his 31 years at UCLA, he has been nominated by the Music Department for the Distinguished Teaching Award, he served as Chair of the Division of Composition for more than 7 years, and has served for three years as Vice Chair of the Department. He has been very active inviting ensembles from around the world to residencies at UCLA, including the Moscow Contemporary Music Ensemble, the Quatuor Diotima (Diotima String Quartet), Yarn/Wire
                                            </p>
                                            <p className="mb-4">
                                                David S. Lefkowitz's more than 150 compositions range from intimate works for many different solo instruments to large ensemble music for orchestra and for wind ensemble, and for choir, soloists, and orchestra. He has received more than 50 commissions for new works, from soloists Inna Faliks, Gloria Cheng, Suzana Bartal, Susanne Kessel, David Geringas, Grace Cloutier, Petteri Iivonen, Robert Paterson, and Hans Joachim Dumeier; and for ensembles incluing Yarlung Artists for Elinor Frey and David Fung and for Lindsay Deutsch and Joanne Pearce Martin, Pacific Serenades, Coretet for Quartet Integra and for the Sibelius Piano Trio, Cantor's Assembly, Glory Star Children's Chorus, Center for Jewish Culture and Creativity for the Synergy Ensemble, Debussy Trio, Russian String Orchestra, Moscow Contemporary Music Ensemble, Herzen University for the St. Petersburg in the Mirror of the World's Cultural Heritage competition, Irina Donskaya for a harp quartet, Cornell University Glee Club, Baroque Camerata of Zhongshan Daxue (Kaoshiung, Taiwan), Harvard Westlake Symphony Orchestra, and for the Beijing City Opera Company. Lefkowitz's compositions have been released on more than twenty commercial recordings, including on Bridge, Yarlung, Albany, and Parnassus Records, including four all-Lefkowitz recordings: David S. Lefkowitz Preludes and Fugues on Bridge Records, Harp's Desire: The Harp Music of David S. Lefkowitz and Music of Contradictions on Albany Records, and Inner World: the Music of David S. Lefkowitz on Yarlung Records. His most recent composition, Green Mountains, Now Black, commissioned for Quartet Integra string quartet, will be released on Yarlung Records later this year. His music has been published by Fatrock Music, Zenon Music, C. Alan Publications, Warner Brothers/Chappell Music, Yelton Rhodes Music. Most of his music is available through Floating Point Music.
                                            </p>
                                        </div>
                                    ) : (
                                        <p>Loading bio content...</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* Research Interests */}
            <section className="py-12 border-t border-gray-300" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-playfair font-bold text-navy mb-12 text-center" data-testid="research-interests-title">
                        Research & Teaching Interests
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="border border-gray-300 rounded-xl p-8" style={{backgroundColor: '#e5e5ff'}}>
                            <h3 className="text-xl font-playfair font-semibold text-navy mb-4">Composition</h3>
                            <ul className="space-y-2 text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Old and new modes, including non-octave repeating and arithmetic scales and modes</li>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Exploration of new approaches to form</li>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Questioning of basic musical assumptions</li>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Genre-crossing and culture-crossing music</li>
                            </ul>
                        </div>
                        
                        <div className="border border-gray-300 rounded-xl p-8" style={{backgroundColor: '#e5e5ff'}}>
                            <h3 className="text-xl font-playfair font-semibold text-navy mb-4">Current Projects</h3>
                            <ul className="space-y-2 text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Large-scale string quartet</li>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Two volume set of preludes and fugues for piano, prepared piano, and piano duo</li>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Music for harp</li>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Music for voice and chamber ensemble</li>
                            </ul>
                        </div>
                        
                        <div className="border border-gray-300 rounded-xl p-8" style={{backgroundColor: '#e5e5ff'}}>
                            <h3 className="text-xl font-playfair font-semibold text-navy mb-4">Music Theory</h3>
                            <ul className="space-y-2 text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Contemporary set theory and advanced set theory extensions</li>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Analysis of timbre, and other multi-dimensional parameters</li>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Use of mathematical approaches to better allow for integration of subjective evaluation</li>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Post-tonal theoretic frameworks</li>
                            </ul>
                        </div>
                        
                        <div className="border border-gray-300 rounded-xl p-8" style={{backgroundColor: '#e5e5ff'}}>
                            <h3 className="text-xl font-playfair font-semibold text-navy mb-4">Teaching Philosophy</h3>
                            <ul className="space-y-2 text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Critical thinking through music theory</li>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Questioning assumptions and approaches, to yield new approaches</li>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• Retrospective meta-discussions of music theory</li>
                                <li style={{textIndent: '-11px', paddingLeft: '11px'}}>• One-on-one music composition instruction focused on student's style while questioning assumptions to expand compositional horizons</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
