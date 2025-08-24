import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

export default function Header() {
    const [location] = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Compositions", href: "/compositions" },
        { name: "Recordings", href: "/recordings" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
    ];

    const isActive = (href: string) => {
        if (href === "/" && location === "/") return true;
        if (href !== "/" && location.startsWith(href)) return true;
        return false;
    };

    return (
        <header className="relative bg-white shadow-sm border-b border-gray-100">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo/Name */}
                    <div className="flex items-center">
                        <Link href="/">
                            <h1 className="text-2xl font-playfair font-semibold text-navy cursor-pointer hover:text-purple transition-colors duration-200">
                                David S. Lefkowitz
                            </h1>
                        </Link>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`font-medium transition-colors duration-200 ${
                                    isActive(item.href) 
                                        ? "text-purple" 
                                        : "text-gray-700 hover:text-purple"
                                }`}
                                data-testid={`nav-link-${item.name.toLowerCase()}`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    
                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-600 hover:text-purple focus:outline-none"
                            data-testid="mobile-menu-button"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
                
                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden pb-4" data-testid="mobile-menu">
                        <div className="flex flex-col space-y-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`font-medium py-2 transition-colors duration-200 block ${
                                        isActive(item.href) 
                                            ? "text-purple" 
                                            : "text-gray-700 hover:text-purple"
                                    }`}
                                    data-testid={`mobile-nav-link-${item.name.toLowerCase()}`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
