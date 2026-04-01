import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedShaderHero from '../ui/AnimatedShaderHero';

const HeroSection = () => {
  const navigate = useNavigate();

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
          onClick: () => {
            const el = document.getElementById('prompt-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        },
        secondary: {
          text: "Analyze Existing Design",
          onClick: () => navigate('/analyze')
        }
      }}
    />
  );
};

export default HeroSection;
