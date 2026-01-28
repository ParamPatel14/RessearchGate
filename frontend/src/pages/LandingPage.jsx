import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheck, FiUsers, FiAward, FiBookOpen } from 'react-icons/fi';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-800">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">RM</div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">ResearchMatch</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-6 py-2.5 text-indigo-600 font-medium hover:bg-indigo-50 rounded-full transition-colors">
            Log In
          </Link>
          <Link to="/register" className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-full shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-8 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 space-y-8">
          <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold tracking-wide uppercase mb-2">
            🚀 The Future of Academic Research
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight text-gray-900">
            Find Your Perfect <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Research Match</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
            Connect with top mentors, join groundbreaking projects, and build your academic portfolio with verifiable certificates and real-world experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/register" className="px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-full shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center gap-2">
              Get Started Now <FiArrowRight />
            </Link>
            <Link to="/login" className="px-8 py-4 bg-white text-gray-700 text-lg font-bold rounded-full border border-gray-200 shadow-md hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center">
              Explore Opportunities
            </Link>
          </div>
          
          <div className="flex items-center gap-4 pt-8 text-sm text-gray-500 font-medium">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*13}`} alt="avatar" />
                </div>
              ))}
            </div>
            <p>Joined by 1000+ researchers this week</p>
          </div>
        </div>

        <div className="lg:w-1/2 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-2xl opacity-30 animate-pulse"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 transform rotate-2 hover:rotate-0 transition-all duration-500">
             {/* Mock Dashboard Preview */}
             <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <div className="space-y-1">
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        <div className="h-3 w-24 bg-gray-100 rounded"></div>
                    </div>
                    <div className="h-10 w-10 bg-indigo-100 rounded-full"></div>
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-4">
                        <div className="h-12 w-12 bg-indigo-200 rounded-lg flex-shrink-0"></div>
                        <div className="space-y-2 w-full">
                            <div className="h-4 w-3/4 bg-indigo-300 rounded"></div>
                            <div className="h-3 w-1/2 bg-indigo-200 rounded"></div>
                        </div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-gray-100 flex gap-4 shadow-sm">
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex-shrink-0"></div>
                        <div className="space-y-2 w-full">
                            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                            <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                </div>
                <div className="pt-4 flex justify-between items-center">
                    <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                    <div className="h-10 w-32 bg-indigo-600 rounded-lg"></div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose ResearchMatch?</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">We provide the tools you need to succeed in your academic journey, from finding mentors to publishing your work.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
                <FeatureCard 
                    icon={<FiUsers className="w-8 h-8 text-indigo-600" />}
                    title="Smart Matching"
                    description="Our algorithm connects you with mentors whose research interests and skill requirements align perfectly with your profile."
                />
                <FeatureCard 
                    icon={<FiBookOpen className="w-8 h-8 text-purple-600" />}
                    title="Research Lab"
                    description="Manage your projects, submit assignments, and track your progress with our integrated Kanban-style research lab."
                />
                <FeatureCard 
                    icon={<FiAward className="w-8 h-8 text-green-600" />}
                    title="Verifiable Certificates"
                    description="Earn blockchain-ready digital certificates upon project completion to showcase your achievements to the world."
                />
            </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-20 bg-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-4 gap-8 text-center">
            <StatItem number="500+" label="Active Mentors" />
            <StatItem number="1,200+" label="Opportunities" />
            <StatItem number="$2.5M" label="Grant Funding" />
            <StatItem number="98%" label="Match Success" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
                <span className="text-2xl font-bold text-white">ResearchMatch</span>
                <p className="text-sm mt-2">© 2026 ResearchMatch. All rights reserved.</p>
            </div>
            <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

const StatItem = ({ number, label }) => (
    <div>
        <div className="text-4xl md:text-5xl font-bold text-indigo-400 mb-2">{number}</div>
        <div className="text-indigo-200 font-medium">{label}</div>
    </div>
);

export default LandingPage;
