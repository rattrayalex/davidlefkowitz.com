import React from "react";
import { Link } from "wouter";

export default function Footer() {
    return (
        <footer className="text-navy py-16" style={{backgroundColor: '#e5e5ff'}}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-2xl font-playfair font-semibold mb-4 text-navy" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            David S. Lefkowitz
                        </h3>
                        <p className="text-gray-700 leading-relaxed" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            Composer, Professor of Music Composition & Theory at UCLA Herb Alpert School of Music
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-navy" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>Quick Links</h4>
                        <ul className="space-y-2 text-gray-700">
                            <li>
                                <Link href="/about" className="hover:text-purple transition-colors duration-200" data-testid="footer-link-about" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link href="/compositions" className="hover:text-purple transition-colors duration-200" data-testid="footer-link-compositions">
                                    Compositions
                                </Link>
                            </li>
                            <li>
                                <Link href="/recordings" className="hover:text-purple transition-colors duration-200" data-testid="footer-link-recordings">
                                    Recordings
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="hover:text-purple transition-colors duration-200" data-testid="footer-link-blog">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-purple transition-colors duration-200" data-testid="footer-link-contact">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div className="mt-12 pt-8 text-center text-gray-600">
                    <p style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>&copy; 2024 David S. Lefkowitz. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
