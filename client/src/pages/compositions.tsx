import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Music, Calendar, ChevronDown, Search } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Composition } from "@shared/schema";
import { Link } from "wouter";

// Define the API response type that matches what the server returns
interface CompositionResponse {
    id: string;
    slug?: string; // URL-friendly version of title
    title: string;
    instrumentation: string; // Transformed from array to comma-separated string
    ensemble: string; // Transformed from array to comma-separated string
    year: number;
    category: string; // Derived from first element of ensemble array
    duration: string;
    premiere_info: string;
    publisher: string; // Transformed from array to comma-separated string
    recording: string;
}

// Function to generate slug from title (replace all punctuation and spaces with underscores)
function generateCompositionSlug(title: string): string {
    return title
        .replace(/[^\w\s]/g, '') // Remove all punctuation
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
}
import twelvePointStarSvg from "@/assets/12_point_curved.svg";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

// Define the category structure
const categoryStructure = {
    "Chamber": [
        "String Quartet",
        "Mixed Chamber Ensemble", 
        "Saxophone Quartet",
        "Flute Quartet",
        "Pierrot Ensemble",
        "Pierrot Ensemble plus Percussion",
        "Piano Quintet",
        "Debussy Trio",
        "Harp Quartet",
        "Voice and Ensemble",
        "Voice and Mixed Chamber Ensemble"
    ],
    "Solo or Duo": [
        "Piano Solo",
        "Piano Duo", 
        "Solos",
        "Solo Instrument & Piano",
        "String Duo",
        "Other Duos"
    ],
    "Choir/Vocal": [
        "Choral",
        "Choir and Ensemble",
        "Choir and Orchestra",
        "Children's Choir",
        "Voice and Keyboard",
        "Voice and Ensemble",
        "Voice and Mixed Chamber Ensemble"
    ],
    "Large Ensemble": [
        "Orchestra",
        "String Orchestra",
        "Choir and Orchestra",
        "Brass Ensemble", 
        "Percussion Ensemble",
        "Wind Ensemble"
    ]
};

export default function Compositions() {
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [titleSearch, setTitleSearch] = useState<string>("");
    const [instrumentSearch, setInstrumentSearch] = useState<string>("");
    const [sortMode, setSortMode] = useState<"Chronological" | "Alphabetical">("Chronological");
    
    const { data: compositions = [], isLoading } = useQuery<CompositionResponse[]>({
        queryKey: ["/api/compositions"],
    });
    
    // Updated filtering logic combining category, title, and instrument search
    const filteredCompositions = compositions
        .filter(c => {
            // Category filter - check if selected category exists in ensemble string
            const categoryMatch = selectedCategory === "All" || 
                (c.ensemble && c.ensemble.includes(selectedCategory));
            
            // Title search filter
            const titleMatch = titleSearch === "" || 
                c.title.toLowerCase().includes(titleSearch.toLowerCase());
            
            // Instrument search filter - search in instrumentation string but exclude Orchestra/Large Ensemble pieces
            const orchestraCategories = ["Orchestra", "String Orchestra", "Choir and Orchestra", "Brass Ensemble", "Percussion Ensemble", "Wind Ensemble"];
            const isOrchestraCategory = c.ensemble && orchestraCategories.some(cat => c.ensemble.includes(cat));
            const instrumentMatch = instrumentSearch === "" || 
                (!isOrchestraCategory && c.instrumentation && typeof c.instrumentation === 'string' && c.instrumentation.toLowerCase().includes(instrumentSearch.toLowerCase()));
            
            return categoryMatch && titleMatch && instrumentMatch;
        })
        .sort((a, b) => {
            // Apply sorting based on sortMode only when "All" is selected
            if (selectedCategory === "All") {
                if (sortMode === "Alphabetical") {
                    // Function to strip leading punctuation for sorting
                    const stripLeadingPunctuation = (title: string) => {
                        // Remove leading punctuation like "...", "(", quotes, etc.
                        return title.replace(/^[\s\.\(\)\[\]"'`…]+/, '');
                    };
                    
                    const aTitle = stripLeadingPunctuation(a.title);
                    const bTitle = stripLeadingPunctuation(b.title);
                    return aTitle.localeCompare(bTitle);
                } else {
                    // Chronological (newest first)
                    return (b.year || 0) - (a.year || 0);
                }
            }
            // Default chronological sort for filtered categories
            return (b.year || 0) - (a.year || 0);
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
            <section className="py-20 relative" style={{backgroundColor: '#e5e5ff'}}>
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
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-left" style={{paddingLeft: '64px'}}>
                        <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-navy mb-6" data-testid="compositions-title">
                            Compositions
                        </h1>
                    </div>
                </div>
            </section>

            {/* Search Section */}
            <section className="pb-0 pt-6" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap gap-4 justify-start items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search by Title..."
                                value={titleSearch}
                                onChange={(e) => setTitleSearch(e.target.value)}
                                className="pl-10 w-64 border-gray-300 focus:border-purple focus:ring-purple !text-lg"
                                style={{ fontSize: '18px' }}
                                data-testid="search-title"
                            />
                        </div>
                        <div className="relative">
                            <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search by Instrument..."
                                value={instrumentSearch}
                                onChange={(e) => setInstrumentSearch(e.target.value)}
                                className="pl-10 w-64 border-gray-300 focus:border-purple focus:ring-purple !text-lg"
                                style={{ fontSize: '18px' }}
                                data-testid="search-instrument"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter Section */}
            <section className="py-8 border-b border-gray-300" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap gap-4 justify-start items-center">
                        {/* Quick Search Label */}
                        <div className="text-lg font-medium text-navy mr-16">
                            Quick Search:
                        </div>
                        
                        {/* Category Filters */}
                        <div className="flex flex-wrap gap-4 items-center">
                        {/* All Button with Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                                    selectedCategory === "All"
                                        ? "bg-purple text-white shadow-lg"
                                        : "border border-gray-300 text-gray-700 hover:border-gray-400"
                                } focus:outline-none focus:ring-2 focus:ring-purple focus:ring-opacity-50`}
                                data-testid="filter-all"
                            >
                                All
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedCategory("All");
                                        setSortMode("Chronological");
                                    }}
                                    className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                                    data-testid="sort-chronological"
                                >
                                    Chronological
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setSelectedCategory("All");
                                        setSortMode("Alphabetical");
                                    }}
                                    className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                                    data-testid="sort-alphabetical"
                                >
                                    Alphabetical
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Category Dropdowns */}
                        {Object.entries(categoryStructure).map(([mainCategory, subcategories]) => (
                            <DropdownMenu key={mainCategory}>
                                <DropdownMenuTrigger className="flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-200 border border-gray-300 text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple focus:ring-opacity-50 whitespace-pre-line text-center">
                                    {mainCategory}
                                    <ChevronDown className="h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                                    {subcategories.map((subcategory) => (
                                        <DropdownMenuItem
                                            key={subcategory}
                                            onClick={() => setSelectedCategory(subcategory)}
                                            className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                                            data-testid={`filter-${subcategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                                        >
                                            {subcategory}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Compositions Grid */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {filteredCompositions.length === 0 ? (
                        <div className="text-center py-12">
                            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg" data-testid="no-compositions">
                                No compositions available in this category.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredCompositions.map((composition) => (
                                <Link 
                                    key={composition.id}
                                    href={`/compositions/${composition.slug || generateCompositionSlug(composition.title)}`}
                                    className="block"
                                >
                                <div 
                                    className="border border-purple rounded-lg p-2 hover:shadow-lg transition-shadow duration-300 cursor-pointer flex items-center gap-4 flex-wrap" 
                                    style={{backgroundColor: '#e5e5ff'}}
                                    data-testid={`composition-${composition.id}`}
                                >
                                    {/* 1. Category Badge */}
                                    <span className={`inline-block text-white text-sm px-3 py-1 rounded-full font-medium flex-shrink-0 ${
                                        (typeof composition.ensemble === 'string' && composition.ensemble.includes('String Quartet')) ? 'bg-purple' :
                                        (typeof composition.ensemble === 'string' && composition.ensemble.includes('Orchestra')) ? 'bg-gold' :
                                        (typeof composition.ensemble === 'string' && composition.ensemble.includes('Piano Solo')) ? 'bg-blue-500' :
                                        (typeof composition.ensemble === 'string' && composition.ensemble.includes('Choral')) ? 'bg-green-500' :
                                        (typeof composition.ensemble === 'string' && composition.ensemble.includes('Solos')) ? 'bg-red-500' :
                                        'bg-gray-500'
                                    }`} data-testid={`composition-category-${composition.id}`}>
                                        {typeof composition.ensemble === 'string' ? composition.ensemble : "Uncategorized"}
                                    </span>

                                    {/* 2. Title */}
                                    <h3 className="font-playfair font-semibold text-navy flex-shrink-0" data-testid={`composition-title-${composition.id}`}>
                                        {composition.title}
                                    </h3>

                                    {/* 3. Composition Date */}
                                    <span className="text-gray-600 flex-shrink-0" data-testid={`composition-year-${composition.id}`}>
                                        ({composition.year})
                                    </span>

                                    {/* 4. Instruments */}
                                    <span className="text-purple font-medium" data-testid={`composition-instrumentation-${composition.id}`}>
                                        {composition.instrumentation}
                                    </span>

                                    {/* 5. Duration */}
                                    {composition.duration && (
                                        <span className="text-gray-600 flex-shrink-0" data-testid={`composition-duration-${composition.id}`}>
                                            {composition.duration}
                                        </span>
                                    )}

                                </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
