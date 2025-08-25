import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {

    return (
        <div className="min-h-screen" style={{backgroundColor: '#e5e5ff'}}>
            {/* Hero Section */}
            <section className="py-20" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-navy mb-6" data-testid="contact-title" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            Contact
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                            Get in touch for collaboration opportunities, commission inquiries, or academic discussions
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Content */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Information */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-playfair font-bold text-navy mb-6" data-testid="contact-info-title" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    Get in Touch
                                </h2>
                                <p className="text-xl text-gray-700 leading-relaxed mb-8" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    I welcome inquiries about collaborations, commissions, academic opportunities, 
                                    and discussions about music theory and composition. Please feel free to reach out 
                                    using the form or contact information below.
                                </p>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Mail className="h-6 w-6 text-purple" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-navy mb-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>Email</h3>
                                        <a 
                                            href="mailto:lefko@ucla.edu"
                                            className="text-xl text-purple hover:text-purple-700 transition-colors duration-200"
                                            style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}
                                            data-testid="contact-email"
                                        >
                                            lefko at ucla.edu
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <MapPin className="h-6 w-6 text-purple" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-navy mb-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>Office Location</h3>
                                        <p className="text-xl text-gray-700" data-testid="contact-address" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                            UCLA Herb Alpert School of Music<br />
                                            Los Angeles, CA
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Phone className="h-6 w-6 text-purple" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-navy mb-1" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>Office Hours</h3>
                                        <p className="text-xl text-gray-700" data-testid="contact-hours" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                            By appointment<br />
                                            Please email to schedule
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Response Time */}
                            <div className="border border-gray-300 rounded-xl p-6" style={{backgroundColor: '#e5e5ff'}}>
                                <h3 className="text-xl font-semibold text-navy mb-2" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>Response Time</h3>
                                <p className="text-gray-700 text-lg" style={{fontFamily: 'Times, "Times New Roman", Palatino, serif'}}>
                                    I typically respond to inquiries within 2-3 business days. For urgent matters, 
                                    please mention "URGENT" in your subject line.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
