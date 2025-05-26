"use client";

import { useRouter } from "next/navigation";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";

export default function Home() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  type Particle = {
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    speedX: number;
    speedY: number;
  };

  const [particles, setParticles] = useState<Particle[]>([]);

  // Smooth mouse movement with slower spring animation
  const springConfig = { stiffness: 50, damping: 25, mass: 0.8 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  // Generate smaller, slower particles
  useEffect(() => {
    setIsMounted(true);
    const generateParticles = () => {
      const count = typeof window !== "undefined" && window.innerWidth < 768 ? 15 : 30;
      return Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        color: `hsla(${Math.random() < 0.5 ? '24, 83%, 50%' : '215, 10%, 45%'}, ${Math.random() * 0.3 + 0.5})`, // Orange (#F97316) or grayish-blue (#6B7280)
        speedX: (Math.random() - 0.5) * 0.02,
        speedY: (Math.random() - 0.5) * 0.02,
      }));
    };

    if (typeof window !== "undefined") {
      setParticles(generateParticles());
      const handleResize = () => setParticles(generateParticles());
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Optimized canvas animation with throttling
  const animateParticles = useCallback(() => {
    if (!canvasRef.current || !isMounted || particles.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Update particles
    setParticles((prev) =>
      prev.map((p) => {
        let newX = p.x + p.speedX;
        let newY = p.y + p.speedY;

        if (newX > 100) newX = 0;
        if (newX < 0) newX = 100;
        if (newY > 100) newY = 0;
        if (newY < 0) newY = 100;

        return { ...p, x: newX, y: newY };
      })
    );

    // Draw particles
    particles.forEach((p1, index) => {
      const x1 = (p1.x / 100) * rect.width;
      const y1 = (p1.y / 100) * rect.height;

      ctx.beginPath();
      ctx.arc(x1, y1, p1.size, 0, Math.PI * 2);
      ctx.fillStyle = p1.color;
      ctx.shadowBlur = 4;
      ctx.shadowColor = p1.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      for (let j = index + 1; j < Math.min(particles.length, index + 5); j++) {
        const p2 = particles[j];
        const x2 = (p2.x / 100) * rect.width;
        const y2 = (p2.y / 100) * rect.height;
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        
        if (distance < 100) {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `hsla(24, 83%, 50%, ${0.4 - distance / 250})`; // Orange connections (#F97316)
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      const mouseXPos = mousePosition.x;
      const mouseYPos = mousePosition.y;
      const distanceToMouse = Math.sqrt((mouseXPos - x1) ** 2 + (mouseYPos - y1) ** 2);
      if (distanceToMouse < 120) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(mouseXPos, mouseYPos);
        ctx.strokeStyle = `hsla(215, 10%, 45%, ${0.3 - distanceToMouse / 400})`; // Grayish-blue cursor connections (#6B7280)
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
    });
  }, [particles, mousePosition, isMounted]);

  // Throttled animation loop
  useEffect(() => {
    let lastTime = 0;
    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= 16) {
        animateParticles();
        lastTime = currentTime;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (isMounted) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animateParticles, isMounted]);

  // Throttled mouse movement
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        setMousePosition({ x: e.clientX, y: e.clientY });
      }, 10);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, [mouseX, mouseY]);

  // Cycle through taglines
  const taglines = ["Connect", "Grow", "Succeed", "Inspire", "Elevate"];
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Typewriter effect
  const secondQuote = "Seek guidance from those who've walked the path—experience shapes wisdom.";
  useEffect(() => {
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < secondQuote.length) {
        setTypedText(secondQuote.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 60);
    return () => clearInterval(typeInterval);
  }, []);

  // Slower grid movement
  const gridTranslateX = useTransform(
    mouseX,
    [0, typeof window !== "undefined" ? window.innerWidth : 1920],
    [-8, 8]
  );
  const gridTranslateY = useTransform(
    mouseY,
    [0, typeof window !== "undefined" ? window.innerHeight : 1080],
    [-8, 8]
  );

  // Animation variants
  const quoteVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 1.2, 
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    },
  };

  const taglineVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { 
        duration: 0.8, 
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    },
    exit: { 
      opacity: 0, 
      x: 20, 
      scale: 0.95,
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    },
  };

  const buttonVariants = {
    hover: { 
      scale: 1.02, 
      boxShadow: "0 8px 32px rgba(249, 115, 22, 0.3)", // Orange shadow (#F97316)
      transition: { 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    },
    tap: { 
      scale: 0.98, 
      transition: { 
        duration: 0.15,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    },
  };

  // Reduced motion support
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setIsReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-gray-950 text-white overflow-hidden select-none"> {/* #0A0E1A */}
      {/* Grid Background */}
      <motion.div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(#F97316 0.5px, transparent 0.5px),
            linear-gradient(90deg, #F97316 0.5px, transparent 0.5px)
          `,
          backgroundSize: "40px 40px",
          backgroundColor: "#0A0E1A",
          x: isReducedMotion ? 0 : gridTranslateX,
          y: isReducedMotion ? 0 : gridTranslateY,
        }}
        animate={
          isReducedMotion
            ? {}
            : {
                backgroundPosition: ["0% 0%", "100% 100%"],
                transition: { duration: 80, repeat: Infinity, ease: "linear" },
              }
        }
      >
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(249, 115, 22, 0.2) 0.5px, transparent 0.5px),
              linear-gradient(-45deg, rgba(249, 115, 22, 0.2) 0.5px, transparent 0.5px)
            `,
            backgroundSize: "60px 60px",
          }}
          animate={
            isReducedMotion
              ? {}
              : {
                  backgroundPosition: ["0% 0%", "100% 100%"],
                  transition: { duration: 90, repeat: Infinity, ease: "linear" },
                }
          }
        />
      </motion.div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-5 bg-gradient-to-br from-gray-950/95 via-gray-900/90 to-orange-900/20" /> {/* #0A0E1A to #7C2D12 */}

      {/* Canvas for Particles */}
      {isMounted && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10 w-full h-full"
          style={{ opacity: isReducedMotion ? 0.5 : 0.7 }}
        />
      )}

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <motion.div
          className="flex flex-col items-center justify-center text-center max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Logo */}
          <motion.div
            className="relative mb-12"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={
              isReducedMotion
                ? {}
                : { 
                    scale: 1.01, 
                    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } 
                  }
            }
          >
            <h1 className="text-6xl md:text-9xl font-bold text-white drop-shadow-lg"> 
              GrowSync
              <motion.div
                className="absolute inset-0 -z-10 bg-orange-500/20 blur-3xl rounded-full" /> {/* #F97316 */}
            </h1>
          </motion.div>

          {/* Animated Tagline */}
          <AnimatePresence mode="wait">
            <motion.p
              key={taglineIndex}
              className="text-2xl md:text-3xl text-orange-500 mb-10 font-medium tracking-wide relative" 
              variants={taglineVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {taglines[taglineIndex]}
              <motion.span
                className="block h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 mt-3 rounded-full" /> {/* #F97316 to #EA580C */}
            </motion.p>
          </AnimatePresence>

          {/* Quotes */}
          <motion.div className="max-w-3xl space-y-8 mb-16">
            <motion.p
              className="text-xl md:text-2xl text-gray-100 italic leading-relaxed" 
              variants={quoteVariants}
              initial="hidden"
              animate="visible"
              whileHover={
                isReducedMotion
                  ? {}
                  : {
                      textShadow: "0 0 20px rgba(249, 115, 22, 0.3)", // Orange glow (#F97316)
                      transition: { duration: 0.5 },
                    }
              }
            >
              "Extraordinary mentors shape extraordinary students."
            </motion.p>
            <motion.p
              className="text-lg md:text-xl text-gray-300 leading-relaxed" 
              variants={quoteVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              whileHover={
                isReducedMotion
                  ? {}
                  : {
                      textShadow: "0 0 20px rgba(107, 114, 128, 0.3)", // Grayish-blue glow (#6B7280)
                      transition: { duration: 0.5 },
                    }
              }
            >
              {typedText}
              <motion.span
                className="inline-block w-0.5 h-6 bg-orange-500 ml-1" /> {/* #F97316 */}
            </motion.p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.6 }}
          >
            <motion.button
              className="relative px-10 py-4 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/50 text-orange-400 font-medium rounded-full overflow-hidden backdrop-blur-sm" 
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => router.push("/sign-in")}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Sign In
                <motion.span
                  animate={{ x: [0, 2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  →
                </motion.span>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-orange-600/30 opacity-0" /> {/* #F97316 to #EA580C */}
            </motion.button>
            
            <motion.button
              className="relative px-10 py-4 bg-gradient-to-r from-gray-600/50 to-gray-500/50 border border-gray-400/50 text-gray-200 font-medium rounded-full overflow-hidden backdrop-blur-sm" 
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => router.push("/sign-up")}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Sign Up
                <motion.span
                  animate={{ y: [0, -1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  ↑
                </motion.span>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gray-600/40 to-gray-500/40 opacity-0" /> {/* #4B5563 to #6B7280 */}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Cursor Effects */}
      <motion.div
        className="fixed w-32 h-32 bg-orange-500/10 rounded-full blur-2xl z-15 pointer-events-none"
        style={{
          x: useTransform(
            mouseX,
            [0, typeof window !== "undefined" ? window.innerWidth : 1920],
            [-64, 64]
          ),
          y: useTransform(
            mouseY,
            [0, typeof window !== "undefined" ? window.innerHeight : 1080],
            [-64, 64]
          ),
        }}
        animate={
          isReducedMotion
            ? {}
            : {
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1],
                transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
              }
        }
      />
    </div>
  );
}