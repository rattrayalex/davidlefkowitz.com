import React from "react";
import { Link, useLocation } from "wouter";

export default function Footer() {
    const [location] = useLocation();
    
    const navigationItems = [
        { name: "About", href: "/about" },
        { name: "Compositions", href: "/compositions" },
        { name: "Recordings", href: "/recordings" },
        { name: "Media", href: "/media" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
    ];

    // Filter out the current page from the Quick Links
    const filteredItems = navigationItems.filter(item => {
        if (item.href === "/" && location === "/") return false;
        if (item.href !== "/" && location.startsWith(item.href)) return false;
        return true;
    });

    const isFYCPage = location === '/fyc';
    
    return (
        <footer className="text-navy py-12" style={{backgroundColor: '#e5e5ff'}}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-2xl font-playfair font-semibold mb-4 text-navy" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            David S. Lefkowitz
                        </h3>
                        <p className="text-gray-700 leading-relaxed" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            Composer, Professor of Music Composition & Theory<br />at UCLA Herb Alpert School of Music
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-navy" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>Quick Links</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <ul className="space-y-2 text-gray-700">
                                {filteredItems.slice(0, Math.ceil(filteredItems.length / 2)).map((item) => (
                                    <li key={item.name}>
                                        <Link 
                                            href={item.href} 
                                            className="hover:text-purple transition-colors duration-200" 
                                            data-testid={`footer-link-${item.name.toLowerCase()}`}
                                            style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <ul className="space-y-2 text-gray-700">
                                {filteredItems.slice(Math.ceil(filteredItems.length / 2)).map((item) => (
                                    <li key={item.name}>
                                        <Link 
                                            href={item.href} 
                                            className="hover:text-purple transition-colors duration-200" 
                                            data-testid={`footer-link-${item.name.toLowerCase()}`}
                                            style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div className="mt-12 pt-1 text-center text-gray-600">
                    <p style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>&copy; 2025 David S. Lefkowitz. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
