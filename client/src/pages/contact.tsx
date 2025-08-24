import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ContactForm, contactFormSchema } from "@shared/schema";

export default function Contact() {
    const { toast } = useToast();
    
    const form = useForm<ContactForm>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    const contactMutation = useMutation({
        mutationFn: async (data: ContactForm) => {
            return apiRequest("POST", "/api/contact", data);
        },
        onSuccess: () => {
            toast({
                title: "Message sent successfully!",
                description: "Thank you for your message. I will get back to you soon.",
            });
            form.reset();
        },
        onError: (error) => {
            toast({
                title: "Error sending message",
                description: "Please try again later or contact me directly via email.",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: ContactForm) => {
        contactMutation.mutate(data);
    };

    return (
        <div className="min-h-screen" style={{backgroundColor: '#e5e5ff'}}>
            {/* Hero Section */}
            <section className="py-20" style={{backgroundColor: '#e5e5ff'}}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-navy mb-6" data-testid="contact-title">
                            Contact
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                                <h2 className="text-3xl font-playfair font-bold text-navy mb-6" data-testid="contact-info-title">
                                    Get in Touch
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-8">
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
                                        <h3 className="font-semibold text-navy mb-1">Email</h3>
                                        <a 
                                            href="mailto:dlefkowitz@ucla.edu"
                                            className="text-purple hover:text-purple-700 transition-colors duration-200"
                                            data-testid="contact-email"
                                        >
                                            dlefkowitz@ucla.edu
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <MapPin className="h-6 w-6 text-purple" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-navy mb-1">Office Location</h3>
                                        <p className="text-gray-700" data-testid="contact-address">
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
                                        <h3 className="font-semibold text-navy mb-1">Office Hours</h3>
                                        <p className="text-gray-700" data-testid="contact-hours">
                                            By appointment<br />
                                            Please email to schedule
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Response Time */}
                            <div className="border border-gray-300 rounded-xl p-6" style={{backgroundColor: '#e5e5ff'}}>
                                <h3 className="font-semibold text-navy mb-2">Response Time</h3>
                                <p className="text-gray-700 text-sm">
                                    I typically respond to inquiries within 2-3 business days. For urgent matters, 
                                    please mention "URGENT" in your subject line.
                                </p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="border border-gray-300 rounded-xl p-8" style={{backgroundColor: '#e5e5ff'}}>
                            <h2 className="text-2xl font-playfair font-bold text-navy mb-6" data-testid="contact-form-title">
                                Send a Message
                            </h2>
                            
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="Your full name"
                                                        data-testid="contact-form-name"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="email"
                                                        placeholder="your.email@example.com"
                                                        data-testid="contact-form-email"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="Brief description of your inquiry"
                                                        data-testid="contact-form-subject"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Message</FormLabel>
                                                <FormControl>
                                                    <Textarea 
                                                        placeholder="Please share details about your inquiry, collaboration idea, or question..."
                                                        className="min-h-[120px]"
                                                        data-testid="contact-form-message"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full bg-purple hover:bg-purple-700 text-white"
                                        disabled={contactMutation.isPending}
                                        data-testid="contact-form-submit"
                                    >
                                        {contactMutation.isPending ? (
                                            "Sending..."
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
