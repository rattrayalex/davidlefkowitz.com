import React from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Recording } from "@shared/schema";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RecordingDetail() {
    const { id } = useParams();
    
    const { data: recordings = [], isLoading } = useQuery<Recording[]>({
        queryKey: ["/api/recordings"],
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const recording = recordings.find(r => r.id === id);

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
                        {(recording.album_cover || recording.album_track_listing?.length > 0) && (
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
                                            <ExternalLink className="ml-1 h-3 w-3" />
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
                                    <p className="text-gray-700" data-testid="recording-detail-performers" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                        {recording.performers}
                                    </p>
                                </div>
                            )}

                            {/* Compositions */}
                            {recording.composition && (
                                <div className="mb-4">
                                    <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>COMPOSITIONS</h2>
                                    <p className="text-gray-700 whitespace-pre-wrap" data-testid="recording-detail-composition" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                        {recording.composition}
                                    </p>
                                </div>
                            )}

                            {/* Duration */}
                            {recording.duration && (
                                <div className="mb-4">
                                    <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>DURATION</h2>
                                    <p className="text-gray-700" data-testid="recording-detail-duration" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                        {recording.duration}
                                    </p>
                                </div>
                            )}

                            {/* Purchase and/or Streaming Links */}
                            {recording.links && (
                                <div className="mb-4">
                                    <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>PURCHASE AND/OR STREAMING LINKS</h2>
                                    <div 
                                        className="text-gray-700 recording-links" 
                                        data-testid="recording-detail-links" 
                                        style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                        dangerouslySetInnerHTML={{ __html: recording.links }}
                                    />
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}