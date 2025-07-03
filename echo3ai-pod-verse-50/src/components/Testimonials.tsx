
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Echo3AI transformed how I distribute my podcast. The AI transcription is incredibly accurate, and knowing my content is censorship-resistant gives me peace of mind.",
      author: "Sarah Chen",
      title: "Tech Entrepreneur & Podcast Host",
      avatar: "SC"
    },
    {
      quote: "The search functionality is game-changing. I can find any discussion about blockchain from months ago in seconds. The tipping feature helps me support my favorite creators directly.",
      author: "Marcus Rodriguez", 
      title: "Crypto Enthusiast & Listener",
      avatar: "MR"
    },
    {
      quote: "As a non-English speaker, the real-time translation feature opened up a whole world of podcasts I couldn't access before. This is the future of inclusive media.",
      author: "Yuki Tanaka",
      title: "International Listener",
      avatar: "YT"
    }
  ];

  return (
    <section className="py-20 px-4 relative bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by Early Adopters
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join podcasters and listeners who are already experiencing the future of decentralized media
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 transition-all duration-500 hover:scale-105 transform-gpu hover:-translate-y-2 cursor-pointer group shadow-2xl hover:shadow-blue-500/10"
            >
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="text-4xl text-blue-400 mb-4 group-hover:text-blue-300 transition-colors">"</div>
                  <p className="text-gray-300 leading-relaxed italic group-hover:text-gray-200 transition-colors">
                    {testimonial.quote}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform duration-300">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold group-hover:text-blue-300 transition-colors">
                      {testimonial.author}
                    </div>
                    <div className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                      {testimonial.title}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
