import React from "react";
import { Link } from "wouter";
import { Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-navy text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-2xl font-playfair font-semibold mb-4">
                            David S. Lefkowitz
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                            Composer, Professor of Music Composition & Theory at UCLA Herb Alpert School of Music
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li>
                                <Link href="/about">
                                    <a className="hover:text-purple transition-colors duration-200" data-testid="footer-link-about">
                                        About
                                    </a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/compositions">
                                    <a className="hover:text-purple transition-colors duration-200" data-testid="footer-link-compositions">
                                        Compositions
                                    </a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/recordings">
                                    <a className="hover:text-purple transition-colors duration-200" data-testid="footer-link-recordings">
                                        Recordings
                                    </a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog">
                                    <a className="hover:text-purple transition-colors duration-200" data-testid="footer-link-blog">
                                        Blog
                                    </a>
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact">
                                    <a className="hover:text-purple transition-colors duration-200" data-testid="footer-link-contact">
                                        Contact
                                    </a>
                                </Link>
                            </li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Connect</h4>
                        <div className="flex space-x-4 mb-6">
                            <a 
                                href="#" 
                                className="text-gray-300 hover:text-purple transition-colors duration-200"
                                data-testid="social-link-twitter"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a 
                                href="#" 
                                className="text-gray-300 hover:text-purple transition-colors duration-200"
                                data-testid="social-link-linkedin"
                            >
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a 
                                href="mailto:dlefkowitz@ucla.edu" 
                                className="text-gray-300 hover:text-purple transition-colors duration-200"
                                data-testid="social-link-email"
                            >
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                        <div>
                            <p className="text-gray-300 text-sm">
                                UCLA Herb Alpert School of Music<br />
                                <a 
                                    href="mailto:dlefkowitz@ucla.edu" 
                                    className="hover:text-purple transition-colors duration-200"
                                    data-testid="contact-email"
                                >
                                    dlefkowitz@ucla.edu
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 David S. Lefkowitz. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
