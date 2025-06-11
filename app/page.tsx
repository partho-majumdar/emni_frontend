"use client";

import { motion, useSpring, useTransform, AnimatePresence, useMotionValue } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [loadingButton, setLoadingButton] = useState<string | null>(null);
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
    opacity: number;
  };

  const [particles, setParticles] = useState<Particle[]>([]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    setIsMounted(true);
    const generateParticles = () => {
      const count = typeof window !== "undefined" && window.innerWidth < 768 ? 25 : 50;
      return Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        color: Math.random() < 0.3 ? '#f97316' : Math.random() < 0.6 ? '#ffffff' : '#6b7280',
        speedX: (Math.random() - 0.5) * 0.05,
        speedY: (Math.random() - 0.5) * 0.05,
        opacity: Math.random() * 0.6 + 0.2,
      }));
    };

    if (typeof window !== "undefined") {
      setParticles(generateParticles());
      const handleResize = () => setParticles(generateParticles());
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const animateParticles = useCallback(() => {
    if (!canvasRef.current || !isMounted || particles.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.clearRect(0, 0, rect.width, rect.height);

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

    particles.forEach((p1, index) => {
      const x1 = (p1.x / 100) * rect.width;
      const y1 = (p1.y / 100) * rect.height;

      for (let j = index + 1; j < Math.min(particles.length, index + 3); j++) {
        const p2 = particles[j];
        const x2 = (p2.x / 100) * rect.width;
        const y2 = (p2.y / 100) * rect.height;
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        
        if (distance < 120) {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          const opacity = (120 - distance) / 120 * 0.3;
          ctx.strokeStyle = `rgba(107, 114, 128, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      const mouseXPos = mousePosition.x;
      const mouseYPos = mousePosition.y;
      const distanceToMouse = Math.sqrt((mouseXPos - x1) ** 2 + (mouseYPos - y1) ** 2);
      if (distanceToMouse < 150) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(mouseXPos, mouseYPos);
        const opacity = (150 - distanceToMouse) / 150 * 0.4;
        ctx.strokeStyle = `rgba(249, 115, 22, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    particles.forEach((p) => {
      const x = (p.x / 100) * rect.width;
      const y = (p.y / 100) * rect.height;

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color === '#f97316' ? `rgba(249, 115, 22, ${p.opacity})` :
                      p.color === '#ffffff' ? `rgba(255, 255, 255, ${p.opacity})` :
                      `rgba(107, 114, 128, ${p.opacity})`;
      ctx.shadowBlur = p.color === '#f97316' ? 8 : 4;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }, [particles, mousePosition, isMounted]);

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const taglines = ["Connect", "Grow", "Succeed", "Inspire", "Elevate"];
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

  const gridTranslateX = useTransform(mouseX, [0, typeof window !== "undefined" ? window.innerWidth : 1920], [-15, 15]);
  const gridTranslateY = useTransform(mouseY, [0, typeof window !== "undefined" ? window.innerHeight : 1080], [-15, 15]);

  const handleNavigation = async (route: string, buttonId: string) => {
    setLoadingButton(buttonId);
    
    // Simulate loading time (you can adjust or remove this)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    router.push(route);
  };

  const LoadingSpinner = () => (
    <div className="flex items-center space-x-2">
      <motion.div
        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <span>Loading...</span>
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-900 text-white overflow-hidden relative">
     
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="absolute inset-0 bg-gradient-radial from-orange-500/10 via-transparent to-transparent" />
        
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(249, 115, 22, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(249, 115, 22, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px",
            x: gridTranslateX,
            y: gridTranslateY,
          }}
        />
        
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            x: useTransform(gridTranslateX, (x) => x * -0.5),
            y: useTransform(gridTranslateY, (y) => y * -0.5),
          }}
        />
      </div>

      {isMounted && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-8 py-16">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="relative">
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-white relative z-10">
                Grow<span className="text-orange-500">Sync</span>
              </h1>
              <div className="absolute inset-0 text-8xl md:text-9xl font-black tracking-tighter text-orange-500 blur-lg opacity-30">
                GrowSync
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.p
                key={taglineIndex}
                className="text-2xl md:text-3xl text-gray-400 font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {taglines[taglineIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          <motion.div 
            className="max-w-4xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative group">
              <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-300 rounded-full"></div>
              <div className="border-l-4 border-orange-500 pl-8 py-4">
                <p className="text-2xl md:text-3xl text-white font-light leading-relaxed">
                  "Extraordinary mentors shape extraordinary students."
                </p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>
              <div className="border-l-4 border-gray-500 pl-8 py-4">
                <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed whitespace-nowrap overflow-hidden">
                  {typedText}
                  <motion.span 
                    className="inline-block w-0.5 h-5 bg-orange-500 ml-2"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <motion.button
              className="relative px-8 py-4 text-white font-semibold text-lg rounded-xl transition-all duration-300 group overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              whileHover={loadingButton !== "signin" ? { scale: 1.05 } : {}}
              whileTap={loadingButton !== "signin" ? { scale: 0.98 } : {}}
              onClick={() => handleNavigation("/sign-in", "signin")}
              disabled={loadingButton !== null}
            >
              <span className="relative z-10">
                {loadingButton === "signin" ? <LoadingSpinner /> : "Sign In →"}
              </span>
              
              <div className={`absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 transition-opacity duration-300 ${
                loadingButton !== "signin" ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
              }`}></div>
              <div className={`absolute inset-[2px] rounded-[10px] transition-colors duration-300 ${
                loadingButton !== "signin" ? 'bg-gray-900 group-hover:bg-gray-800/50' : 'bg-gray-800/50'
              }`}></div>
              
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-400/20 blur-xl transition-opacity duration-300 -z-10 ${
                loadingButton !== "signin" ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
              }`}></div>
            </motion.button>
            
            <motion.button
              className="relative px-8 py-4 text-white font-semibold text-lg rounded-xl transition-all duration-300 group overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              whileHover={loadingButton !== "signup" ? { scale: 1.05 } : {}}
              whileTap={loadingButton !== "signup" ? { scale: 0.98 } : {}}
              onClick={() => handleNavigation("/sign-up", "signup")}
              disabled={loadingButton !== null}
            >
              <span className="relative z-10">
                {loadingButton === "signup" ? <LoadingSpinner /> : "Sign Up ↗"}
              </span>
              
              <div className={`absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-gray-400 via-white to-gray-400 transition-opacity duration-300 ${
                loadingButton !== "signup" ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
              }`}></div>
              <div className={`absolute inset-[2px] rounded-[10px] transition-colors duration-300 ${
                loadingButton !== "signup" ? 'bg-gray-900 group-hover:bg-gray-800/50' : 'bg-gray-800/50'
              }`}></div>
              
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-gray-400/10 blur-xl transition-opacity duration-300 -z-10 ${
                loadingButton !== "signup" ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
              }`}></div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="fixed w-40 h-40 rounded-full pointer-events-none z-30 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0.05) 50%, transparent 100%)',
          x: useTransform(mouseX, (value) => value - 80),
          y: useTransform(mouseY, (value) => value - 80),
        }}
      />

      <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
  );
}
