
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileAudio, Search, CircleCheck, MessageSquare, BookAudio, ShieldCheck } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: FileAudio,
      title: "Censorship-Resistant Storage",
      description: "IPFS-pinned audio & transcripts ensure your content stays accessible forever, no matter what.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Search,
      title: "AI Transcription & Moderation", 
      description: "Whisper + Gemini/OpenAI pipelines provide accurate transcripts with smart content moderation.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: MessageSquare,
      title: "Semantic & Conversational Search",
      description: "Find episodes by topic or ask in natural language. Our AI understands context and meaning.",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: CircleCheck,
      title: "Instant Tipping",
      description: "Sepolia Test ETH payments let listeners support creators directly.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: BookAudio,
      title: "Multilingual Support",
      description: "Real-time translations and transcripts make podcasts accessible to global audiences.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: ShieldCheck,
      title: "AI Fact Check",
      description: "Fact-checking with DuckDuckGo, Cheerio, and advanced language moderation for safe, reliable content.",
      gradient: "from-yellow-500 to-green-500"
    }
  ];

  return (
    <section className="py-20 px-4 relative bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powered by Next-Gen Technology
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the perfect blend of AI intelligence and decentralized infrastructure
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-gray-900/50 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 group transform-gpu hover:-translate-y-2 cursor-pointer"
            >
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 transform-gpu shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
