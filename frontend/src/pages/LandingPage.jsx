import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiSearch, FiUsers, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';
import NetworkVisualization from '../components/NetworkVisualization';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-academia-cream)] text-[var(--color-academia-charcoal)] font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 bg-[var(--color-academia-cream)]/90 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--color-academia-charcoal)] rounded-sm flex items-center justify-center text-[var(--color-academia-cream)] font-serif font-bold text-xl shadow-lg">
              R
            </div>
            <span className="text-xl font-bold tracking-tight font-serif">ResearchMatch</span>
          </div>
          <div className="flex gap-6 items-center">
            <Link to="/login" className="text-sm font-medium hover:text-[var(--color-academia-gold)] transition-colors relative group">
              Log In
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-academia-gold)] transition-all group-hover:w-full"></span>
            </Link>
            <Link to="/register" className="px-6 py-2.5 bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] text-sm font-medium rounded-sm hover:bg-stone-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
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
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-block px-4 py-1.5 border border-[var(--color-academia-gold)] text-[var(--color-academia-gold-hover)] text-xs font-bold tracking-widest uppercase rounded-sm bg-[var(--color-academia-gold)]/5">
              Academic Intelligence
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-serif font-bold leading-[1.1] tracking-tight text-[var(--color-academia-charcoal)]">
              Identify <span className="text-[var(--color-academia-gold)] italic relative inline-block">
                Gaps.
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-[var(--color-academia-gold)] opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none">
                   <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span><br/>
              Align with <span className="italic">Mentors.</span><br/>
              Connect with <span className="italic">Future.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg text-stone-600 leading-relaxed max-w-md border-l-4 border-[var(--color-academia-gold)] pl-6">
              A precise platform for researchers to identify methodology gaps, align with PhD supervisors, and secure competitive opportunities through verified credentials.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/register" className="px-8 py-4 bg-[var(--color-academia-charcoal)] text-[var(--color-academia-cream)] font-medium rounded-sm hover:bg-stone-900 transition-all flex items-center justify-center gap-3 group shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Start Researching <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="px-8 py-4 bg-transparent border border-[var(--color-academia-charcoal)] text-[var(--color-academia-charcoal)] font-medium rounded-sm hover:bg-[var(--color-academia-charcoal)] hover:text-[var(--color-academia-cream)] transition-all flex items-center justify-center shadow-sm hover:shadow-lg">
                Explore Mentors
              </Link>
            </motion.div>
            
            <motion.div variants={itemVariants} className="pt-8 flex items-center gap-8 border-t border-stone-200 mt-8">
              {[
                  { label: "Research Labs", value: "150+" },
                  { label: "Match Rate", value: "85%" },
                  { label: "Grants Secured", value: "$2.4M" }
              ].map((stat, idx) => (
                  <div key={idx} className="group cursor-default">
                    <p className="text-3xl font-serif font-bold text-[var(--color-academia-charcoal)] group-hover:text-[var(--color-academia-gold)] transition-colors duration-300">{stat.value}</p>
                    <p className="text-xs text-stone-500 uppercase tracking-wider mt-1 font-bold">{stat.label}</p>
                  </div>
              ))}
            </motion.div>
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
      <section className="py-24 px-8 max-w-7xl mx-auto relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--color-academia-gold)] to-transparent opacity-30"></div>
        <div className="grid md:grid-cols-3 gap-8">
            {[
                { 
                  title: "Methodology Gaps", 
                  desc: "Identify under-explored areas in your domain using our Gemini-powered analysis engine.",
                  icon: <FiSearch size={28} />
                },
                { 
                  title: "Smart Alignment", 
                  desc: "Match with supervisors whose research interests and mentorship styles align with your profile.",
                  icon: <FiUsers size={28} />
                },
                { 
                  title: "Verifiable Impact", 
                  desc: "Generate blockchain-backed certificates for your contributions and research internships.",
                  icon: <FiAward size={28} />
                }
            ].map((feature, idx) => (
                <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="group p-8 bg-white border border-stone-100 rounded-sm shadow-sm hover:shadow-xl hover:border-[var(--color-academia-gold)]/30 transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 text-[var(--color-academia-gold)]">
                       <div className="scale-150">{feature.icon}</div>
                    </div>
                    <div className="w-14 h-14 bg-[var(--color-academia-cream)] rounded-full flex items-center justify-center text-[var(--color-academia-gold)] mb-6 group-hover:bg-[var(--color-academia-charcoal)] group-hover:text-[var(--color-academia-gold)] transition-colors duration-300 shadow-inner">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-serif font-bold mb-3 group-hover:text-[var(--color-academia-gold-hover)] transition-colors">{feature.title}</h3>
                    <p className="text-stone-600 leading-relaxed text-sm">{feature.desc}</p>
                </motion.div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
