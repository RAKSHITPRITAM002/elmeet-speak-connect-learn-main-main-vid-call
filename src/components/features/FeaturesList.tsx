
import { FeatureCard } from "./FeatureCard";
import { Video, Monitor, Pencil, Globe, Clock, Users } from "lucide-react";

export const FeaturesList = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Features designed for language teaching
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Everything you need to deliver effective language lessons online.
          </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Video size={24} />}
            title="Ultra-Low Latency"
            description="Experience real-time conversation with minimal delay - critical for language pronunciation and practice."
          />
          
          <FeatureCard
            icon={<Monitor size={24} />}
            title="Optimized Screen Sharing"
            description="Share educational videos, presentations, and online resources with smooth playback and synchronized audio."
          />
          
          <FeatureCard
            icon={<Pencil size={24} />}
            title="Advanced Annotation"
            description="Annotate directly on shared screens with comprehensive tools for highlighting, drawing, and text markup."
          />
          
          <FeatureCard
            icon={<Globe size={24} />}
            title="Language Teaching Tools"
            description="Specialized features like character pads, vocabulary notes, and pronunciation helpers."
          />
          
          <FeatureCard
            icon={<Clock size={24} />}
            title="Scheduling & Recording"
            description="Schedule lessons in advance and record sessions for review, with secure cloud storage."
          />
          
          <FeatureCard
            icon={<Users size={24} />}
            title="Breakout Rooms"
            description="Split students into smaller groups for conversation practice, with teacher monitoring capabilities."
          />
        </div>
      </div>
    </section>
  );
};
