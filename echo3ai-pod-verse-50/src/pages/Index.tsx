import React from 'react';
import Hero from '../components/Hero';
import PodcastUpload from '../components/PodcastUpload';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import LiveDemo from '../components/LiveDemo';
import Security from '../components/Security';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import PodcastVisuals from '../components/PodcastVisuals';

const Index = () => {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden text-lg md:text-xl p-8 md:p-16">
      <PodcastVisuals />
      <div className="relative z-10">
        <Hero />
        <PodcastUpload />
        <Features />
        <HowItWorks />
        <LiveDemo />
        <Security />
        <Testimonials />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
