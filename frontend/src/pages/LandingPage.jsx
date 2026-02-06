import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import NetworkVisualization from '../components/NetworkVisualization';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-academia-cream)] text-[var(--color-academia-charcoal)] font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 bg-[var(--color-academia-cream)]/90 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--color-academia-charcoal)] rounded-sm flex items-center justify-center text-[var(--color-academia-cream)] font-serif font-bold text-lg">
              R
            </div>
            <span className="text-xl font-bold tracking-tight font-serif">ResearchMatch</span>
          </div>
          <div className="flex gap-6 items-center">
            <Link to="/login" className="text-sm font-medium hover:text-[var(--color-academia-gold)] transition-colors">
              Log In
            </Link>
            <Link to="/register" className="px-5 py-2 bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] text-sm font-medium rounded-sm hover:bg-black transition-all">
              Join the Network
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 min-h-screen flex flex-col lg:flex-row">
        {/* Left Content */}
        <div className="lg:w-1/2 flex items-center justify-center px-8 py-20 lg:py-0 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-xl space-y-8"
          >
            <div className="inline-block px-3 py-1 border border-[var(--color-academia-gold)] text-[var(--color-academia-gold-hover)] text-xs font-semibold tracking-widest uppercase rounded-sm">
              Academic Intelligence
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-serif font-bold leading-[1.1] tracking-tight text-[var(--color-academia-charcoal)]">
              Identify <span className="text-[var(--color-academia-gold)] italic">Gaps.</span><br/>
              Align with <span className="italic">Mentors.</span><br/>
              Connect with <span className="italic">Future.</span>
            </h1>
            
            <p className="text-lg text-stone-600 leading-relaxed max-w-md">
              A precise platform for researchers to identify methodology gaps, align with PhD supervisors, and secure competitive opportunities through verified credentials.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/register" className="px-8 py-4 bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] font-medium rounded-sm hover:bg-black transition-all flex items-center justify-center gap-3 group">
                Start Researching <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="px-8 py-4 bg-transparent border border-[var(--color-academia-charcoal)] text-[var(--color-academia-charcoal)] font-medium rounded-sm hover:bg-[var(--color-academia-charcoal)] hover:text-[var(--color-academia-cream)] transition-all flex items-center justify-center">
                Explore Mentors
              </Link>
            </div>
            
            <div className="pt-8 flex items-center gap-8 border-t border-stone-200 mt-8">
              <div>
                <p className="text-3xl font-serif font-bold text-[var(--color-academia-charcoal)]">150+</p>
                <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Research Labs</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-[var(--color-academia-charcoal)]">85%</p>
                <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Match Rate</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-[var(--color-academia-charcoal)]">$2.4M</p>
                <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">Grants Secured</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Visualization */}
        <div className="lg:w-1/2 relative h-[50vh] lg:h-auto bg-[var(--color-academia-cream)] overflow-hidden">
             <NetworkVisualization />
             {/* Gradient Overlay for seamless blend */}
             <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-academia-cream)] to-transparent w-16 pointer-events-none hidden lg:block"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-academia-cream)] to-transparent h-16 pointer-events-none lg:hidden"></div>
        </div>
      </header>
      
      {/* Features Section */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
            {[
                { title: "Methodology Gaps", desc: "Identify under-explored areas in your domain using our Gemini-powered analysis engine." },
                { title: "Smart Alignment", desc: "Match with supervisors whose research interests and mentorship styles align with your profile." },
                { title: "Verifiable Impact", desc: "Generate blockchain-backed certificates for your contributions and research internships." }
            ].map((feature, idx) => (
                <div key={idx} className="space-y-4 p-6 border-l-2 border-[var(--color-academia-gold)] hover:bg-stone-50 transition-colors">
                    <h3 className="text-xl font-serif font-bold">{feature.title}</h3>
                    <p className="text-stone-600 leading-relaxed">{feature.desc}</p>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
