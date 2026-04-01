import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Loader2 } from 'lucide-react';

// AWS service "icons" as emoji+text pairs
const AWS_SERVICES = [
  { emoji: '🪣', name: 'S3' },
  { emoji: '⚡', name: 'Lambda' },
  { emoji: '🖥️', name: 'EC2' },
  { emoji: '🗄️', name: 'RDS' },
  { emoji: '🌐', name: 'CloudFront' },
  { emoji: '📨', name: 'SQS' },
  { emoji: '🔔', name: 'SNS' },
  { emoji: '📊', name: 'DynamoDB' },
  { emoji: '🐳', name: 'ECS' },
  { emoji: '🔒', name: 'IAM' },
  { emoji: '📈', name: 'CloudWatch' },
  { emoji: '🌊', name: 'Kinesis' },
  { emoji: '🧠', name: 'SageMaker' },
  { emoji: '🔑', name: 'KMS' },
  { emoji: '🏗️', name: 'CloudFormation' },
];

const FUN_FACTS = [
  "💡 Lambda can process 10M requests/month in the free tier!",
  "💡 S3 stores over 100 trillion objects worldwide.",
  "💡 AWS has 33+ regions across the globe.",
  "💡 DynamoDB can handle 20M+ requests per second.",
  "💡 CloudFront has 400+ edge locations.",
  "💡 EC2 offers 500+ instance types.",
  "💡 AWS serves millions of active customers.",
  "💡 Lambda supports 10 programming languages.",
  "💡 S3 offers 99.999999999% (11 9's) durability.",
  "💡 AWS launched in 2006 with just S3 and EC2.",
];

const PROGRESS_MESSAGES = [
  "Analyzing your requirements...",
  "Identifying AWS services...",
  "Evaluating cost-performance trade-offs...",
  "Building architecture diagrams...",
  "Optimizing for scalability...",
  "Generating multiple options...",
  "Calculating cost estimates...",
  "Finalizing your solutions...",
];

const LoadingGame = ({ progress = 0 }) => {
  const canvasRef = useRef(null);
  const gameStateRef = useRef({
    basket: { x: 0, width: 80, height: 20 },
    items: [],
    score: 0,
    spawnTimer: 0,
    gameActive: true,
  });
  const keysRef = useRef({ left: false, right: false });
  const animFrameRef = useRef();
  const [score, setScore] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);
  const [progressMsg, setProgressMsg] = useState(0);
  const [mouseX, setMouseX] = useState(null);

  // Rotate fun facts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % FUN_FACTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Rotate progress messages based on progress
  useEffect(() => {
    const msgIndex = Math.min(
      Math.floor((progress / 100) * PROGRESS_MESSAGES.length),
      PROGRESS_MESSAGES.length - 1
    );
    setProgressMsg(msgIndex);
  }, [progress]);

  // Key handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = true;
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') keysRef.current.right = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = 320;
      gameStateRef.current.basket.x = canvas.width / 2 - 40;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const spawnItem = () => {
      const service = AWS_SERVICES[Math.floor(Math.random() * AWS_SERVICES.length)];
      gameStateRef.current.items.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -30,
        speed: 1.5 + Math.random() * 2,
        service,
        size: 28,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
      });
    };

    const gameLoop = () => {
      const gs = gameStateRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Subtle grid background
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Move basket
      const speed = 6;
      if (mouseX !== null) {
        gs.basket.x = mouseX - gs.basket.width / 2;
      } else {
        if (keysRef.current.left) gs.basket.x -= speed;
        if (keysRef.current.right) gs.basket.x += speed;
      }
      gs.basket.x = Math.max(0, Math.min(w - gs.basket.width, gs.basket.x));

      // Draw basket (cloud shape)
      const bx = gs.basket.x;
      const by = h - 50;
      const bw = gs.basket.width;

      // Basket glow
      ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
      ctx.shadowBlur = 15;

      // Main basket rectangle
      ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, 30, 8);
      ctx.fill();
      ctx.stroke();

      // Cloud icon on basket
      ctx.shadowBlur = 0;
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#C084FC';
      ctx.fillText('☁️', bx + bw / 2, by + 22);

      // Spawn items
      gs.spawnTimer++;
      if (gs.spawnTimer > 50) {
        spawnItem();
        gs.spawnTimer = 0;
      }

      // Update and draw items
      gs.items = gs.items.filter((item) => {
        item.y += item.speed;
        item.rotation += item.rotSpeed;

        // Draw item
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);

        // Glow
        ctx.shadowColor = 'rgba(139, 92, 246, 0.3)';
        ctx.shadowBlur = 10;

        // Circle background
        ctx.fillStyle = 'rgba(24, 24, 27, 0.8)';
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, item.size / 2 + 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Emoji
        ctx.font = `${item.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.service.emoji, 0, 2);

        ctx.restore();

        // Collision detection
        const itemBottom = item.y + item.size / 2;
        const itemCenterX = item.x;
        if (
          itemBottom >= by &&
          itemBottom <= by + 35 &&
          itemCenterX >= bx - 5 &&
          itemCenterX <= bx + bw + 5
        ) {
          gs.score++;
          setScore(gs.score);
          return false; // Remove caught item
        }

        // Remove if offscreen
        if (item.y > h + 40) return false;

        return true;
      });

      // Score display
      ctx.shadowBlur = 0;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillStyle = '#A78BFA';
      ctx.textAlign = 'left';
      ctx.fillText(`☁️ Services Caught: ${gs.score}`, 15, 25);

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mouseX]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  const handleTouchMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    setMouseX(touch.clientX - rect.left);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
            <span className="text-violet-300 text-sm font-medium">AI is working</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Crafting Your Architecture
          </h2>
          <p className="text-zinc-400 text-sm">
            Catch AWS services while you wait! Use ← → arrows or mouse.
          </p>
        </div>

        {/* Game canvas */}
        <div className="glass-strong rounded-2xl overflow-hidden p-1">
          <div className="rounded-xl overflow-hidden bg-zinc-950/80">
            <canvas
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              className="w-full cursor-none"
              style={{ height: '320px' }}
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={progressMsg}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-zinc-400"
              >
                {PROGRESS_MESSAGES[progressMsg]}
              </motion.span>
            </AnimatePresence>
            <span className="text-sm text-violet-400 font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Fun fact */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFact}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="text-center px-6 py-3 rounded-xl bg-violet-500/5 border border-violet-500/10"
            >
              <p className="text-zinc-300 text-sm">{FUN_FACTS[currentFact]}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingGame;
