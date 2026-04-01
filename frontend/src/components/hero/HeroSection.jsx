import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import AnimatedShaderHero from '../ui/AnimatedShaderHero';

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToPrompt = () => {
    const promptSection = document.getElementById('prompt-section');
    if (promptSection) {
      promptSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatedShaderHero
      trustBadge={{
        text: "Powered by Amazon Bedrock",
        icons: ["⚡"]
      }}
      headline={{
        line1: "Architect Your Cloud",
        line2: "In Minutes, Not Months"
      }}
      subtitle="Transform simple business ideas into production-ready AWS architectures. Get cost-optimized, scalable, and balanced solutions — powered by AI."
      buttons={{
        primary: {
          text: "Start Building",
          onClick: scrollToPrompt
        },
        secondary: {
          text: "Analyze Existing Design",
          onClick: () => navigate('/analyze')
        }
      }}
    >
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in-up animation-delay-1000">
        <button
          onClick={scrollToPrompt}
          className="flex flex-col items-center gap-2 text-violet-300/60 hover:text-violet-300 transition-colors cursor-pointer"
        >
          <span className="text-xs font-medium tracking-widest uppercase">Scroll to begin</span>
          <ArrowDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </AnimatedShaderHero>
  );
};

export default HeroSection;
