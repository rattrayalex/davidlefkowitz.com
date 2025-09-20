import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface RecordingInfo {
    id: string;
    slug: string;
    title: string;
    album_cover: string;
}

interface BlogPostReference {
    id: string;
    slug: string;
    title: string;
    published_date: string;
}

interface CompositionDetailResponse {
    id: string;
    slug?: string;
    title: string;
    instrumentation: string;
    ensemble: string;
    year: number;
    category: string;
    duration: string;
    premiere_info: string;
    publisher: string[] | string;  // Can be array or string for compatibility
    recording: string;
    streaming_links: string;
    recording_info: RecordingInfo[] | RecordingInfo | null;
    program_note: string;
    related_blogposts?: BlogPostReference[];
}

export default function CompositionDetail() {
    const { slug } = useParams();
    const [location] = useLocation();
    
    // Preserve search params from the URL
    const searchParams = location.includes('?') ? location.substring(location.indexOf('?')) : '';
    
    const { data: composition, isLoading } = useQuery<CompositionDetailResponse>({
        queryKey: [`/api/compositions/${slug}`],
        enabled: !!slug,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!composition) {
        return (
            <div className="min-h-screen" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Link href={`/compositions${searchParams}`}>
                        <a className="inline-flex items-center text-purple hover:text-purple-dark mb-6">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Compositions
                        </a>
                    </Link>
                    <h1 className="text-3xl font-playfair font-bold text-navy mb-4" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                        Composition Not Found
                    </h1>
                    <p className="text-gray-600" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                        The composition you're looking for doesn't exist or has been removed.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{backgroundColor: '#e5e5ff'}}>
            {/* Hero Section */}
            <section className="py-12 relative" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <Link href={`/compositions${searchParams}`}>
                        <a className="inline-flex items-center text-purple hover:text-purple-dark mb-6" data-testid="link-back-to-compositions">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Compositions
                        </a>
                    </Link>
                    
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl">
                        {/* Title and Year with Category Badge */}
                        <div className="mb-8">
                            <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-navy mb-4" data-testid="composition-title" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                {composition.title}
                            </h1>
                            {(composition.year || composition.category) && (
                                <div className="flex items-center">
                                    {composition.category && (
                                        <span className={`inline-block text-white text-sm px-4 py-2 rounded-full font-medium mr-4 ${
                                            composition.ensemble.includes('String Quartet') ? 'bg-purple' :
                                            composition.ensemble.includes('Orchestra') ? 'bg-gold' :
                                            composition.ensemble.includes('Piano Solo') ? 'bg-blue-500' :
                                            composition.ensemble.includes('Choral') ? 'bg-green-500' :
                                            composition.ensemble.includes('Solos') ? 'bg-red-500' :
                                            'bg-gray-500'
                                        }`} data-testid="composition-category">
                                            {composition.category}
                                        </span>
                                    )}
                                    {composition.year && (
                                        <span className="text-xl text-gray-600" data-testid="composition-year" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                            {composition.year}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Details Grid - Check if this is Expanded Universe or Parallel Universes */}
                        {(composition.slug === 'Expanded_Universe' || composition.slug === 'Parallel_Universes') ? (
                            // Special layout for Preludes and Fugues books
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Instrumentation */}
                                    {composition.instrumentation && (
                                        <div>
                                            <h2 className="text-lg font-semibold text-navy mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                Instrumentation
                                            </h2>
                                            <p className="text-gray-700" data-testid="composition-instrumentation" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                {composition.instrumentation}
                                            </p>
                                        </div>
                                    )}

                                    {/* Duration */}
                                    {composition.duration && (
                                        <div>
                                            <h2 className="text-lg font-semibold text-navy inline mr-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                Duration:
                                            </h2>
                                            <span className="text-gray-700" data-testid="composition-duration" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                {composition.duration}
                                            </span>
                                        </div>
                                    )}

                                    {/* Publisher */}
                                    {composition.publisher && (
                                        Array.isArray(composition.publisher) ? composition.publisher.length > 0 : composition.publisher
                                    ) && (
                                        <div>
                                            <h2 className="text-lg font-semibold text-navy mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                Publisher
                                            </h2>
                                            <div 
                                                className="text-gray-700 [&_a]:text-purple [&_a]:hover:text-purple-700 [&_a]:underline [&_a]:transition-colors [&_a]:duration-200" 
                                                data-testid="composition-publisher" 
                                                style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                            >
                                                {Array.isArray(composition.publisher) ? (
                                                    composition.publisher.map((pub, index) => (
                                                        <div key={index} dangerouslySetInnerHTML={{ __html: pub }} />
                                                    ))
                                                ) : (
                                                    <div dangerouslySetInnerHTML={{ __html: composition.publisher }} />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recording(s) - Moved to left column below Publisher */}
                                    {composition.recording_info && (() => {
                                        // Handle both single recording (legacy) and multiple recordings (new format)
                                        const recordings = Array.isArray(composition.recording_info) 
                                            ? composition.recording_info 
                                            : [composition.recording_info];
                                        
                                        const validRecordings = recordings.filter(rec => rec && rec.album_cover);
                                        
                                        if (validRecordings.length === 0) return null;
                                        
                                        return (
                                            <div className="w-48">
                                                <h2 className="text-lg text-navy mb-2 whitespace-nowrap" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                    <span className="font-semibold">
                                                        {validRecordings.length > 1 ? 'Recordings' : 'Recording'}
                                                    </span>{' '}
                                                    <span className="font-normal" style={{fontSize: '1rem', lineHeight: '1.0'}}>
                                                        (click on image{validRecordings.length > 1 ? 's' : ''}<br />for information and links)
                                                    </span>
                                                </h2>
                                                <div className="space-y-4">
                                                    {validRecordings.map((recordingInfo, index) => (
                                                        <div key={`${recordingInfo.id}-${index}`}>
                                                            <Link href={`/recordings/${recordingInfo.slug}`}>
                                                                <a className="block hover:opacity-90 transition-opacity" data-testid={`composition-recording-link-${index}`}>
                                                                    <img 
                                                                        src={recordingInfo.album_cover}
                                                                        alt={recordingInfo.title}
                                                                        className="w-full h-48 object-cover rounded-lg shadow-md"
                                                                        data-testid={`composition-recording-cover-${index}`}
                                                                    />
                                                                </a>
                                                            </Link>
                                                            <p className="text-gray-600 mt-2 break-words" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1rem'}}>
                                                                {recordingInfo.title}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Additional Streaming Links - Moved to left column below Recording */}
                                    {composition.streaming_links && composition.streaming_links.trim() && (
                                        <div>
                                            <h2 className="text-lg font-semibold text-navy mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                {composition.recording_info && 
                                                 ((Array.isArray(composition.recording_info) && composition.recording_info.length > 0) || 
                                                  (!Array.isArray(composition.recording_info) && composition.recording_info)) 
                                                 ? "Additional Streaming Links" : "Streaming Links"}
                                            </h2>
                                            <div 
                                                className="text-gray-700 recording-links [&_a]:text-purple [&_a]:hover:text-purple-700 [&_a]:underline [&_a]:transition-colors [&_a]:duration-200" 
                                                data-testid="composition-streaming-links" 
                                                style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                            >
                                                {/* Check if content has HTML */}
                                                {composition.streaming_links.includes('<a ') ? (
                                                    <div dangerouslySetInnerHTML={{ __html: composition.streaming_links }} />
                                                ) : (
                                                    composition.streaming_links.split('\n').map((link, index) => {
                                                        // Check if the link contains a URL
                                                        const urlMatch = link.match(/(https?:\/\/[^\s]+)/);
                                                        if (urlMatch) {
                                                            const url = urlMatch[1];
                                                            const text = link.replace(url, '').trim() || url;
                                                            return (
                                                                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-purple hover:text-purple-700 underline">
                                                                    {text}
                                                                </a>
                                                            );
                                                        } else if (link.trim()) {
                                                            // Plain text link
                                                            return (
                                                                <span key={index} className="block">
                                                                    {link}
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Relevant Blogposts - At the top of right column */}
                                    {composition.related_blogposts && composition.related_blogposts.length > 0 && (
                                        <div>
                                            <h2 className="text-lg font-semibold text-navy mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                Relevant Blogposts
                                            </h2>
                                            <div 
                                                className="text-gray-700 recording-links" 
                                                data-testid="composition-related-blogposts" 
                                                style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                            >
                                                {composition.related_blogposts.map((blogpost, index) => {
                                                    // Remove ", Book I" or ", Book II" from the title for these specific compositions
                                                    const displayTitle = blogpost.title.replace(/, Book I+$/i, '');
                                                    return (
                                                        <Link key={blogpost.id} href={`/blog/${blogpost.slug}`}>
                                                            <a className="text-purple hover:text-purple-700 underline transition-colors duration-200" data-testid={`blogpost-link-${index}`}>
                                                                {displayTitle}
                                                            </a>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Default layout for all other compositions
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Instrumentation */}
                                    {composition.instrumentation && (
                                        <div>
                                            <h2 className="text-lg font-semibold text-navy mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                Instrumentation
                                            </h2>
                                            <p className="text-gray-700" data-testid="composition-instrumentation" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                {composition.instrumentation}
                                            </p>
                                        </div>
                                    )}


                                    {/* Duration */}
                                    {composition.duration && (
                                        <div>
                                            <h2 className="text-lg font-semibold text-navy inline mr-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                Duration:
                                            </h2>
                                            <span className="text-gray-700" data-testid="composition-duration" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                {composition.duration}
                                            </span>
                                        </div>
                                    )}

                                    {/* Recording(s) */}
                                    {composition.recording_info && (() => {
                                        // Handle both single recording (legacy) and multiple recordings (new format)
                                        const recordings = Array.isArray(composition.recording_info) 
                                            ? composition.recording_info 
                                            : [composition.recording_info];
                                        
                                        const validRecordings = recordings.filter(rec => rec && rec.album_cover);
                                        
                                        if (validRecordings.length === 0) return null;
                                        
                                        return (
                                            <div className="w-48">
                                                <h2 className="text-lg text-navy mb-2 whitespace-nowrap" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                    <span className="font-semibold">
                                                        {validRecordings.length > 1 ? 'Recordings' : 'Recording'}
                                                    </span>{' '}
                                                    <span className="font-normal" style={{fontSize: '1rem', lineHeight: '1.0'}}>
                                                        (click on image{validRecordings.length > 1 ? 's' : ''}<br />for information and links)
                                                    </span>
                                                </h2>
                                                <div className="space-y-4">
                                                    {validRecordings.map((recordingInfo, index) => (
                                                        <div key={`${recordingInfo.id}-${index}`}>
                                                            <Link href={`/recordings/${recordingInfo.slug}`}>
                                                                <a className="block hover:opacity-90 transition-opacity" data-testid={`composition-recording-link-${index}`}>
                                                                    <img 
                                                                        src={recordingInfo.album_cover}
                                                                        alt={recordingInfo.title}
                                                                        className="w-full h-48 object-cover rounded-lg shadow-md"
                                                                        data-testid={`composition-recording-cover-${index}`}
                                                                    />
                                                                </a>
                                                            </Link>
                                                            <p className="text-gray-600 mt-2 break-words" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif', fontSize: '1rem'}}>
                                                                {recordingInfo.title}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Publisher */}
                                    {composition.publisher && (
                                        Array.isArray(composition.publisher) ? composition.publisher.length > 0 : composition.publisher
                                    ) && (
                                        <div>
                                            <h2 className="text-lg font-semibold text-navy mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                Publisher
                                            </h2>
                                            <div 
                                                className="text-gray-700 [&_a]:text-purple [&_a]:hover:text-purple-700 [&_a]:underline [&_a]:transition-colors [&_a]:duration-200" 
                                                data-testid="composition-publisher" 
                                                style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                            >
                                                {Array.isArray(composition.publisher) ? (
                                                    composition.publisher.map((pub, index) => (
                                                        <div key={index} dangerouslySetInnerHTML={{ __html: pub }} />
                                                    ))
                                                ) : (
                                                    <div dangerouslySetInnerHTML={{ __html: composition.publisher }} />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Streaming Links */}
                                    {composition.streaming_links && composition.streaming_links.trim() && (
                                        <div>
                                            <h2 className="text-lg font-semibold text-navy mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                {composition.recording_info && 
                                                 ((Array.isArray(composition.recording_info) && composition.recording_info.length > 0) || 
                                                  (!Array.isArray(composition.recording_info) && composition.recording_info)) 
                                                 ? "Additional Streaming Links" : "Streaming Links"}
                                            </h2>
                                            <div 
                                                className="text-gray-700 recording-links [&_a]:text-purple [&_a]:hover:text-purple-700 [&_a]:underline [&_a]:transition-colors [&_a]:duration-200" 
                                                data-testid="composition-streaming-links" 
                                                style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                            >
                                                {/* Check if content has HTML */}
                                                {composition.streaming_links.includes('<a ') ? (
                                                    <div dangerouslySetInnerHTML={{ __html: composition.streaming_links }} />
                                                ) : (
                                                    composition.streaming_links.split('\n').map((link, index) => {
                                                        // Check if the link contains a URL
                                                        const urlMatch = link.match(/(https?:\/\/[^\s]+)/);
                                                        if (urlMatch) {
                                                            const url = urlMatch[1];
                                                            const text = link.replace(url, '').trim() || url;
                                                            return (
                                                                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-purple hover:text-purple-700 underline">
                                                                    {text}
                                                                </a>
                                                            );
                                                        } else if (link.trim()) {
                                                            // Plain text link
                                                            return (
                                                                <span key={index} className="block">
                                                                    {link}
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Relevant Blogposts */}
                                    {composition.related_blogposts && composition.related_blogposts.length > 0 && (
                                        <div>
                                            <h2 className="text-lg font-semibold text-navy mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                                Relevant Blogposts
                                            </h2>
                                            <div 
                                                className="text-gray-700 recording-links" 
                                                data-testid="composition-related-blogposts" 
                                                style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                            >
                                                {composition.related_blogposts.map((blogpost, index) => (
                                                    <Link key={blogpost.id} href={`/blog/${blogpost.slug}`}>
                                                        <a className="text-purple hover:text-purple-700 underline transition-colors duration-200" data-testid={`blogpost-link-${index}`}>
                                                            {blogpost.title}
                                                        </a>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Program Note */}
                        {composition.program_note && (
                            <div className="mt-8">
                                <h2 className="text-2xl font-semibold text-navy mb-4" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Program Note
                                </h2>
                                <div 
                                    className="text-gray-700 max-w-none" 
                                    data-testid="composition-program-note"
                                    style={{
                                        fontFamily: 'Times, "Times New Roman", Palatino, serif',
                                        fontSize: '1.125rem',
                                        lineHeight: '1.2'
                                    }}
                                >
                                    {(() => {
                                        const lines = composition.program_note.split('\n');
                                        const elements: JSX.Element[] = [];
                                        let inTable = false;
                                        let tableRows: string[] = [];
                                        
                                        for (let i = 0; i < lines.length; i++) {
                                            const line = lines[i];
                                            const trimmedLine = line.trim();
                                            
                                            // Check if this is the table header
                                            if (trimmedLine.startsWith('No.') && trimmedLine.includes('Key') && trimmedLine.includes('Prelude')) {
                                                inTable = true;
                                                tableRows = [line];
                                            }
                                            // Check if we're in the table and this is a data row
                                            else if (inTable && (
                                                /^\s*\d+\s+\(/.test(line) || // Lines starting with number and parenthesis  
                                                /^\s*$/.test(line) // Empty line ends the table
                                            )) {
                                                if (/^\s*$/.test(line)) {
                                                    // Empty line - end of table
                                                    // Process the table
                                                    elements.push(
                                                        <div key={`table-${i}`} style={{
                                                            fontFamily: 'Times, "Times New Roman", Palatino, serif',
                                                            fontSize: '1.125rem',
                                                            margin: '0.5em 0'
                                                        }}>
                                                            <table style={{borderSpacing: 0}}>
                                                                {tableRows.map((row, rowIndex) => {
                                                                    if (rowIndex === 0) {
                                                                        // Header row
                                                                        return (
                                                                            <tr key={rowIndex}>
                                                                                <td style={{paddingRight: '0.5em', textAlign: 'left', width: '3em'}}>No.</td>
                                                                                <td style={{paddingRight: '1em', textAlign: 'left', width: '4em'}}>(Key)</td>
                                                                                <td style={{paddingRight: '1em', textAlign: 'center'}}>Prelude</td>
                                                                                <td style={{paddingRight: '1em', textAlign: 'center'}}>Fugue</td>
                                                                                <td style={{textAlign: 'center'}}>Total</td>
                                                                            </tr>
                                                                        );
                                                                    } else {
                                                                        // Data row - parse the values
                                                                        const match = row.match(/^\s*(\d+)\s+\(([^)]+)\)\s*([\d:]+)?\s*([\d:]+)?\s*([\d:]+)?/);
                                                                        if (match) {
                                                                            const num = match[1];
                                                                            const key = match[2];
                                                                            const times = [match[3], match[4], match[5]].filter(t => t);
                                                                            
                                                                            // Special handling for rows 7 and 13
                                                                            if (num === '7' || num === '13') {
                                                                                return (
                                                                                    <tr key={rowIndex}>
                                                                                        <td style={{paddingRight: '0.5em', textAlign: 'left', width: '3em'}}>{num}</td>
                                                                                        <td style={{paddingRight: '1em', textAlign: 'left', width: '4em'}}>({key})</td>
                                                                                        <td colSpan={2} style={{paddingRight: '1em', textAlign: 'center'}}>{times[0]}</td>
                                                                                        <td style={{textAlign: 'center'}}>{times[1] || ''}</td>
                                                                                    </tr>
                                                                                );
                                                                            } else {
                                                                                return (
                                                                                    <tr key={rowIndex}>
                                                                                        <td style={{paddingRight: '0.5em', textAlign: 'left', width: '3em'}}>{num}</td>
                                                                                        <td style={{paddingRight: '1em', textAlign: 'left', width: '4em'}}>({key})</td>
                                                                                        <td style={{paddingRight: '1em', textAlign: 'center'}}>{times[0] || ''}</td>
                                                                                        <td style={{paddingRight: '1em', textAlign: 'center'}}>{times[1] || ''}</td>
                                                                                        <td style={{textAlign: 'center'}}>{times[2] || ''}</td>
                                                                                    </tr>
                                                                                );
                                                                            }
                                                                        }
                                                                    }
                                                                })}
                                                            </table>
                                                        </div>
                                                    );
                                                    inTable = false;
                                                    tableRows = [];
                                                } else {
                                                    // Add to table rows
                                                    tableRows.push(line);
                                                }
                                            }
                                            // Regular paragraph
                                            else if (!inTable && trimmedLine) {
                                                elements.push(
                                                    <p key={i} style={{margin: 0}}>
                                                        {line}
                                                    </p>
                                                );
                                            }
                                            // Empty line outside table
                                            else if (!inTable) {
                                                elements.push(
                                                    <p key={i} style={{margin: 0}}>
                                                        {line}
                                                    </p>
                                                );
                                            }
                                        }
                                        
                                        // Handle case where table goes to end of text
                                        if (inTable && tableRows.length > 0) {
                                            elements.push(
                                                <div key="table-end" style={{
                                                    fontFamily: 'Times, "Times New Roman", Palatino, serif',
                                                    fontSize: '1.125rem',
                                                    margin: '0.5em 0'
                                                }}>
                                                    <table style={{borderSpacing: 0}}>
                                                        {tableRows.map((row, rowIndex) => {
                                                            if (rowIndex === 0) {
                                                                // Header row
                                                                return (
                                                                    <tr key={rowIndex}>
                                                                        <td style={{paddingRight: '0.5em', textAlign: 'right', width: '3em'}}>No.</td>
                                                                        <td style={{paddingRight: '1em', textAlign: 'left', width: '4em'}}>(Key)</td>
                                                                        <td style={{paddingRight: '1em', textAlign: 'center'}}>Prelude</td>
                                                                        <td style={{paddingRight: '1em', textAlign: 'center'}}>Fugue</td>
                                                                        <td style={{textAlign: 'center'}}>Total</td>
                                                                    </tr>
                                                                );
                                                            } else {
                                                                // Data row - parse the values
                                                                const match = row.match(/^\s*(\d+)\s+\(([^)]+)\)\s*([\d:]+)?\s*([\d:]+)?\s*([\d:]+)?/);
                                                                if (match) {
                                                                    const num = match[1];
                                                                    const key = match[2];
                                                                    const times = [match[3], match[4], match[5]].filter(t => t);
                                                                    
                                                                    // Special handling for rows 7 and 13
                                                                    if (num === '7' || num === '13') {
                                                                        return (
                                                                            <tr key={rowIndex}>
                                                                                <td style={{paddingRight: '0.5em', textAlign: 'right', width: '3em'}}>{num}</td>
                                                                                <td style={{paddingRight: '1em', textAlign: 'left', width: '4em'}}>({key})</td>
                                                                                <td colSpan={2} style={{paddingRight: '1em', textAlign: 'center'}}>{times[0]}</td>
                                                                                <td style={{textAlign: 'center'}}>{times[1] || ''}</td>
                                                                            </tr>
                                                                        );
                                                                    } else {
                                                                        return (
                                                                            <tr key={rowIndex}>
                                                                                <td style={{paddingRight: '0.5em', textAlign: 'right', width: '3em'}}>{num}</td>
                                                                                <td style={{paddingRight: '1em', textAlign: 'left', width: '4em'}}>({key})</td>
                                                                                <td style={{paddingRight: '1em', textAlign: 'center'}}>{times[0] || ''}</td>
                                                                                <td style={{paddingRight: '1em', textAlign: 'center'}}>{times[1] || ''}</td>
                                                                                <td style={{textAlign: 'center'}}>{times[2] || ''}</td>
                                                                            </tr>
                                                                        );
                                                                    }
                                                                }
                                                            }
                                                        })}
                                                    </table>
                                                </div>
                                            );
                                        }
                                        
                                        return elements;
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}