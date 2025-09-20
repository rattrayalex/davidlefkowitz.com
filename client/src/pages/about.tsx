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
                
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-left" style={{paddingLeft: '64px'}}>
                        <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-navy mb-6" data-testid="about-title" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            About
                        </h1>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="pt-12 pb-4">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Photo - floated left with responsive sizing */}
                    <div className="float-left mr-6 mb-4 w-72 h-72 md:w-96 md:h-96">
                        <img 
                            src={(profile as any)?.photo_url}
                            alt={(profile as any)?.name}
                            className="rounded-xl shadow-lg w-full h-full object-cover"
                            data-testid="about-photo"
                        />
                    </div>

                    {/* Bio Content - flows around photo */}
                    <div className="space-y-6">
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
                                {(profile as any)?.bio ? (
                                    (profile as any).bio.split('\n\n').map((paragraph: string, index: number) => (
                                        <p key={index} className="mb-2" style={{textIndent: '36px'}} dangerouslySetInnerHTML={{__html: paragraph}} />
                                    ))
                                ) : (
                                    <p>Loading bio content...</p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Clear float */}
                    <div className="clear-both"></div>
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
