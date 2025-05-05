
import Navbar from "@/components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { 
  Video, 
  Share, 
  Pencil, 
  Languages, 
  Users, 
  Timer,
  MessageSquare,
  FileText,
  Layout,
  Hand,
  Cloud
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 transition-all hover:shadow-xl">
      <div className="rounded-full bg-brand-teal/10 p-3 w-14 h-14 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
};

const Features = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Designed Specifically for Language Teaching
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              EL:MEET combines premium video conferencing with specialized tools that make language teaching and learning more effective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <FeatureCard 
              icon={<Video className="text-brand-teal" size={24} />}
              title="HD Audio & Video"
              description="Crystal-clear HD video and high-fidelity audio optimized for language nuances, with adaptive bitrate for consistent quality."
            />
            <FeatureCard 
              icon={<Share className="text-brand-teal" size={24} />}
              title="Enhanced Screen Sharing"
              description="Share your screen, specific windows, or browser tabs with optimized video playback and system audio sharing."
            />
            <FeatureCard 
              icon={<Pencil className="text-brand-teal" size={24} />}
              title="Real-time Annotation"
              description="Draw, highlight, and annotate directly onto shared content with comprehensive drawing tools."
            />
            <FeatureCard 
              icon={<Languages className="text-brand-teal" size={24} />}
              title="Language Learning Tools"
              description="Specialized IME helpers, pronunciation tools, and vocabulary pads designed specifically for language education."
            />
            <FeatureCard 
              icon={<Users className="text-brand-teal" size={24} />}
              title="Breakout Rooms"
              description="Split participants into smaller groups for conversation practice, with the ability to join and monitor any room."
            />
            <FeatureCard 
              icon={<Timer className="text-brand-teal" size={24} />}
              title="Integrated Timer"
              description="Control timed activities with a visual timer visible to all participants, perfect for speaking exercises."
            />
            <FeatureCard 
              icon={<MessageSquare className="text-brand-teal" size={24} />}
              title="Role-Play Mode"
              description="Assign roles with custom prompts visible only to assigned participants, making conversation practice more structured."
            />
            <FeatureCard 
              icon={<FileText className="text-brand-teal" size={24} />}
              title="Vocabulary & Notes Pad"
              description="Collaborative text panel for vocabulary, example sentences, and corrections, exportable for post-session review."
            />
            <FeatureCard 
              icon={<Layout className="text-brand-teal" size={24} />}
              title="Flexible View Layouts"
              description="Dynamic speaker and gallery views with customizable layouts to focus on active speakers or see all participants."
            />
            <FeatureCard 
              icon={<Hand className="text-brand-teal" size={24} />}
              title="Engagement Tools"
              description="Raise hand, emoji reactions, polls and quizzes designed to increase participant engagement during sessions."
            />
            <FeatureCard 
              icon={<Cloud className="text-brand-teal" size={24} />}
              title="Cloud Recording"
              description="Record your sessions with configurable video feeds, audio, and shared content for later review and distribution."
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Designed for Language Education
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Every feature of EL:MEET has been built with the unique needs of language teachers and learners in mind.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Teachers</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-brand-teal mr-2">✓</span>
                    <span>Comprehensive classroom management tools</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-teal mr-2">✓</span>
                    <span>Built-in assessment options with polls and quizzes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-teal mr-2">✓</span>
                    <span>Efficient feedback mechanisms for pronunciation and grammar</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-teal mr-2">✓</span>
                    <span>Session templates to save and reuse lesson structures</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-teal mr-2">✓</span>
                    <span>Integration with popular teaching resources</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Learners</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-brand-teal mr-2">✓</span>
                    <span>Immersive language practice environment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-teal mr-2">✓</span>
                    <span>Tools to support proper pronunciation and writing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-teal mr-2">✓</span>
                    <span>Interactive participation in vocabulary building</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-teal mr-2">✓</span>
                    <span>Access to session recordings for self-study</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-teal mr-2">✓</span>
                    <span>Meaningful practice through structured role-play activities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Transform Your Language Teaching?</h2>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Experience the difference with a platform built specifically for language education.
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="/register" 
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                Sign Up Free
              </a>
              <a 
                href="/pricing" 
                className="bg-white border-2 border-brand-teal text-brand-teal font-bold py-3 px-8 rounded-lg text-lg transition-colors hover:bg-brand-teal hover:text-white"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Features;
