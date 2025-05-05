import Navbar from "@/components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { TreeBackdrop } from "@/components/auth/TreeBackdrop";
import { useAuth } from "../contexts/AuthContext";

const About = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-[#ecf6ff] via-[#fef7cd] to-[#FCF3CF]">
      <TreeBackdrop />
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-brand-teal mb-4">About EL:MEET</h1>
            <p className="text-xl text-brand-orange max-w-3xl mx-auto">
              The premier platform designed specifically for language teaching and learning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6">
                At EL:MEET, we're dedicated to breaking down language barriers through technology. 
                Our mission is to create the most effective and engaging virtual environment for 
                language education, connecting teachers and students worldwide.
              </p>
              <p className="text-lg text-gray-700">
                We believe that language learning should be accessible, interactive, and tailored 
                to the unique needs of both educators and learners.
              </p>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src="https://source.unsplash.com/photo-1581091226825-a6a2a5aee158" 
                alt="Language learning" 
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 md:order-1 rounded-lg overflow-hidden shadow-xl">
              <img 
                src="https://source.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
                alt="Our team" 
                className="w-full h-auto"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-lg text-gray-700 mb-6">
                Founded in 2023, EL:MEET was born from the recognition that existing video conferencing 
                platforms weren't optimized for the unique needs of language education.
              </p>
              <p className="text-lg text-gray-700">
                Our team of language educators and technology experts came together to build a 
                platform that combines low-latency video conferencing with specialized tools 
                designed specifically for language teaching and learning.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">What Sets Us Apart</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Specialized for Language</h3>
                <p className="text-gray-700">
                  Tools designed specifically for language teaching, including specialized IMEs, 
                  pronunciation helpers, and vocabulary pads.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Ultra-Low Latency</h3>
                <p className="text-gray-700">
                  Our platform is optimized for crystal-clear audio and video with minimal delay, 
                  essential for effective language practice.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Built by Educators</h3>
                <p className="text-gray-700">
                  Created by a team that understands the unique challenges of virtual language 
                  teaching and learning.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Our Community</h2>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Whether you're a language teacher looking for a better virtual classroom, or a 
              student seeking more effective learning tools, we invite you to join the 
              EL:MEET community.
            </p>
            <div className="flex justify-center">
              <a 
                href="/register" 
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                Get Started Today
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
