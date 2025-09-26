import React, { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Recording } from "@shared/schema";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RecordingDetail() {
    const { id } = useParams();
    const [logos, setLogos] = useState<{ [key: string]: string }>({});
    
    const { data: recordings = [], isLoading } = useQuery<Recording[]>({
        queryKey: ["/api/recordings"],
    });

    useEffect(() => {
        // Fetch logos from API
        fetch('/api/logos')
            .then(res => res.json())
            .then(data => {
                const logoMap: { [key: string]: string } = {};
                data.forEach((item: { platform: string, path: string }) => {
                    logoMap[item.platform] = item.path;
                });
                setLogos(logoMap);
            })
            .catch(error => console.error("Error fetching logos:", error));
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const recording = recordings.find(r => r.id === id || r.slug === id);

    if (!recording) {
        return (
            <div className="min-h-screen" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <Link href="/recordings">
                        <Button variant="ghost" className="mb-8">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Recordings
                        </Button>
                    </Link>
                    <div className="text-center">
                        <p className="text-gray-600 text-lg">Recording not found.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Helper function to parse links from HTML and extract platform names and URLs
    const parseStreamingLinks = (linksHtml: string): Array<{ name: string; url: string }> => {
        const links: Array<{ name: string; url: string }> = [];
        if (!linksHtml) return links;

        // Create a temporary element to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = linksHtml;
        
        // Find all anchor tags
        const anchors = tempDiv.querySelectorAll('a');
        anchors.forEach(anchor => {
            const url = anchor.getAttribute('href');
            const text = anchor.textContent || '';
            
            if (url) {
                // Map text to platform names that match our logos
                let platformName = text.trim();
                
                // Handle various text variations
                if (text.toLowerCase().includes('amazon')) {
                    platformName = 'Amazon Music';
                } else if (text.toLowerCase().includes('apple')) {
                    platformName = 'Apple Music';
                } else if (text.toLowerCase().includes('spotify')) {
                    platformName = 'Spotify';
                } else if (text.toLowerCase().includes('youtube')) {
                    platformName = 'YouTube';
                } else if (text.toLowerCase().includes('tidal')) {
                    platformName = 'Tidal';
                } else if (text.toLowerCase().includes('pandora')) {
                    platformName = 'Pandora';
                } else if (text.toLowerCase().includes('deezer')) {
                    platformName = 'Deezer';
                } else if (text.toLowerCase().includes('bemusic')) {
                    platformName = 'BeMusic';
                }
                
                links.push({ name: platformName, url });
            }
        });
        
        return links;
    };

    return (
        <div className="min-h-screen" style={{backgroundColor: '#e5e5ff'}}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {/* Back Button */}
                <Link href="/recordings">
                    <Button variant="ghost" className="mb-8">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Recordings
                    </Button>
                </Link>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="md:flex">
                        {/* Album Cover and Track Listings */}
                        {(recording.album_cover || (recording.album_track_listing && recording.album_track_listing.length > 0)) && (
                            <div className="md:w-1/2">
                                {/* Album Cover */}
                                {recording.album_cover && (
                                    <img 
                                        src={recording.album_cover}
                                        alt={recording.title}
                                        className="w-full object-cover mb-4"
                                        data-testid="recording-detail-cover"
                                    />
                                )}
                                
                                {/* Album Track Listing Images */}
                                {recording.album_track_listing && recording.album_track_listing.length > 0 && (
                                    <div className="space-y-4">
                                        {recording.album_track_listing.map((trackImage, index) => (
                                            <img 
                                                key={index}
                                                src={trackImage}
                                                alt={`Track listing ${index + 1}`}
                                                className="w-full object-cover"
                                                data-testid={`recording-track-listing-${index}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Recording Details */}
                        <div className={`p-8 ${recording.album_cover ? 'md:w-1/2' : 'w-full'}`}>
                            <h1 className="text-3xl font-playfair font-bold text-navy mb-6" data-testid="recording-detail-title">
                                {recording.title}
                            </h1>

                            {/* Label - without the word "Label" */}
                            {recording.label && (
                                <div className="mb-4">
                                    {recording.label_url ? (
                                        <a 
                                            href={recording.label_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple hover:text-purple-700 inline-flex items-center underline transition-colors duration-200"
                                            data-testid="recording-detail-label"
                                            style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                        >
                                            {recording.label}
                                        </a>
                                    ) : (
                                        <p className="text-gray-700" data-testid="recording-detail-label" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                            {recording.label}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Performers */}
                            {recording.performers && (
                                <div className="mb-4">
                                    <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>PERFORMERS</h2>
                                    <div className="text-gray-700" data-testid="recording-detail-performers">
                                        {recording.performers.split(/\r?\n/).map((line, index) => (
                                            <p 
                                                key={index} 
                                                style={{
                                                    fontFamily: 'Times, "Times New Roman", Palatino, serif',
                                                    paddingLeft: '0.375in',
                                                    textIndent: '-0.125in',
                                                    margin: 0,
                                                    minHeight: line.trim() === '' ? '1em' : 'auto'
                                                }}
                                            >
                                                {line || '\u00A0'}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Compositions */}
                            {recording.composition && (
                                <div className="mb-4">
                                    <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>COMPOSITIONS</h2>
                                    <div 
                                        className="text-gray-700 recording-compositions" 
                                        data-testid="recording-detail-composition" 
                                        style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', paddingLeft: '0.25in'}}
                                        dangerouslySetInnerHTML={{ __html: recording.composition }}
                                    />
                                </div>
                            )}

                            {/* Duration */}
                            {recording.duration && (
                                <div className="mb-4">
                                    <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>DURATION</h2>
                                    <p className="text-gray-700" data-testid="recording-detail-duration" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', paddingLeft: '0.25in'}}>
                                        {recording.duration}
                                    </p>
                                </div>
                            )}

                            {/* Purchase and/or Streaming Links */}
                            {recording.links && (
                                <div className="mb-4">
                                    <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>PURCHASE AND/OR STREAMING LINKS</h2>
                                    <div 
                                        className="recording-links-logos" 
                                        data-testid="recording-detail-links" 
                                        style={{
                                            paddingLeft: '24px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}
                                    >
                                        {parseStreamingLinks(recording.links).map((platform, index) => {
                                            const logoPath = logos[platform.name];
                                            
                                            return (
                                                <a 
                                                    key={index}
                                                    href={platform.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center hover:opacity-80 transition-opacity"
                                                    style={{
                                                        backgroundColor: '#f9f9f9',
                                                        borderRadius: '6px',
                                                        padding: '6px 12px',
                                                        border: '1px solid #e5e7eb',
                                                        width: 'fit-content'
                                                    }}
                                                >
                                                    {logoPath ? (
                                                        <img 
                                                            src={logoPath} 
                                                            alt={`${platform.name} logo`}
                                                            style={{ 
                                                                height: '24px', 
                                                                maxWidth: '120px',
                                                                objectFit: 'contain'
                                                            }}
                                                            onError={(e) => {
                                                                // Fallback to text if image fails
                                                                e.currentTarget.style.display = 'none';
                                                                const textSpan = document.createElement('span');
                                                                textSpan.className = 'text-gray-700';
                                                                textSpan.style.fontFamily = 'Times, "Times New Roman", Palatino, serif';
                                                                textSpan.style.fontSize = '14px';
                                                                textSpan.textContent = platform.name;
                                                                e.currentTarget.parentElement?.appendChild(textSpan);
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-700" style={{
                                                            fontFamily: 'Times, "Times New Roman", Palatino, serif',
                                                            fontSize: '14px'
                                                        }}>
                                                            {platform.name}
                                                        </span>
                                                    )}
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}