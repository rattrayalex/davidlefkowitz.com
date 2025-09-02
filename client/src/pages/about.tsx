import React from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Profile } from "@shared/schema";
import twelvePointStarSvg from "@/assets/12_point_curved.svg";

export default function About() {
    const { data: profile, isLoading } = useQuery<Profile>({
        queryKey: ["/api/profile"],
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
                        filter: 'saturate(200%)'
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
                                src={profile?.photo_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"}
                                alt={profile?.name || "David S. Lefkowitz"}
                                className="rounded-xl shadow-lg w-full"
                                data-testid="about-photo"
                            />
                        </div>

                        {/* Bio Content */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <h2 className="text-3xl font-playfair font-bold text-navy mb-4" data-testid="profile-name" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    {profile?.name || "David S. Lefkowitz"}
                                </h2>
                                <p className="text-lg text-gray-600" data-testid="profile-institution" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    {profile?.institution || "UCLA Herb Alpert School of Music"}
                                </p>
                            </div>

                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed" data-testid="profile-bio" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    {profile?.bio || `David S. Lefkowitz is an internationally recognized composer and scholar whose works have been performed by leading ensembles worldwide. His research focuses on advanced harmonic theory and contemporary compositional techniques, bridging traditional practices with innovative approaches to musical expression.

                                    As a Professor of Music Composition & Theory at UCLA's Herb Alpert School of Music, he has mentored countless students and contributed significantly to the development of contemporary classical music pedagogy. His compositions range from intimate chamber works to large-scale orchestral pieces, each exploring the boundaries of harmonic language and structural innovation.

                                    Dr. Lefkowitz's scholarly work has been published in numerous peer-reviewed journals, and his compositions have been featured in festivals and concert halls across North America, Europe, and Asia. He continues to push the boundaries of what contemporary classical music can be, while maintaining deep respect for the traditions that inform his creative practice.`}
                                </p>
                            </div>

                            {/* Contact Info */}
                            <div className="border border-gray-300 rounded-xl p-6" style={{backgroundColor: '#e5e5ff'}}>
                                <h3 className="text-xl font-playfair font-semibold text-navy mb-4">Contact Information</h3>
                                <div className="space-y-2">
                                    <p className="text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                        <span className="font-medium">Email:</span>{" "}
                                        <a 
                                            href={`mailto:${profile?.email || "lefko@ucla.edu"}`}
                                            className="text-purple hover:text-purple-700 transition-colors duration-200"
                                            data-testid="contact-email"
                                            style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                        >
                                            {profile?.email || <>lefko<br />at ucla.edu</>}
                                        </a>
                                    </p>
                                    <p className="text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                        <span className="font-medium">Institution:</span>{" "}
                                        {profile?.institution || "UCLA Herb Alpert School of Music"}
                                    </p>
                                    {profile?.cv_url && (
                                        <p className="text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                            <span className="font-medium">CV:</span>{" "}
                                            <a 
                                                href={profile.cv_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-purple hover:text-purple-700 transition-colors duration-200"
                                                data-testid="cv-link"
                                                style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                            >
                                                Download CV
                                            </a>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Research Interests */}
            <section className="py-20 border-t border-gray-300" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-playfair font-bold text-navy mb-12 text-center" data-testid="research-interests-title">
                        Research & Teaching Interests
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="border border-gray-300 rounded-xl p-8" style={{backgroundColor: '#e5e5ff'}}>
                            <h3 className="text-xl font-playfair font-semibold text-navy mb-4">Composition</h3>
                            <ul className="space-y-2 text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <li>• Old and new modes, including non-octave repeating and arithmetic scales and modes</li>
                                <li>• Exploration of new approaches to form</li>
                                <li>• Questioning of basic musical assumptions</li>
                                <li>• Genre-crossing and culture-crossing music</li>
                            </ul>
                        </div>
                        
                        <div className="border border-gray-300 rounded-xl p-8" style={{backgroundColor: '#e5e5ff'}}>
                            <h3 className="text-xl font-playfair font-semibold text-navy mb-4">Music Theory</h3>
                            <ul className="space-y-2 text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <li>• Advanced tonal analysis</li>
                                <li>• Post-tonal theoretical frameworks</li>
                                <li>• Counterpoint and voice leading</li>
                                <li>• Contemporary analytical methods</li>
                            </ul>
                        </div>
                        
                        <div className="border border-gray-300 rounded-xl p-8" style={{backgroundColor: '#e5e5ff'}}>
                            <h3 className="text-xl font-playfair font-semibold text-navy mb-4">Teaching Philosophy</h3>
                            <ul className="space-y-2 text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <li>• Student-centered learning approaches</li>
                                <li>• Technology in music education</li>
                                <li>• Creative pedagogical methods</li>
                                <li>• Mentorship and professional development</li>
                            </ul>
                        </div>
                        
                        <div className="border border-gray-300 rounded-xl p-8" style={{backgroundColor: '#e5e5ff'}}>
                            <h3 className="text-xl font-playfair font-semibold text-navy mb-4">Current Projects</h3>
                            <ul className="space-y-2 text-gray-700" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                <li>• Grammy nomination preparation</li>
                                <li>• New orchestral commission</li>
                                <li>• Pedagogical research publication</li>
                                <li>• International collaboration initiatives</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
