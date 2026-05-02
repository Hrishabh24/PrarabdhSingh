import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaMoon, FaSun, FaComment, FaBriefcase, FaUser, FaExternalLinkAlt, FaTerminal, FaBars, FaTimes, FaCode, FaReact } from 'react-icons/fa';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://prarabdhsingh.onrender.com/api';

const Project3DCard = ({ project }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ perspective: 1200 }}
      whileHover={{ zIndex: 10 }}
      className="relative group h-full"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="glass-panel w-full h-full rounded-3xl overflow-hidden flex flex-col border border-slate-200 dark:border-white/10 hover:border-accentCoral dark:hover:border-accentCyan shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgba(244,63,94,0.15)] dark:hover:shadow-[0_20px_40px_rgba(0,240,255,0.15)] transition-[border-color,shadow] duration-300 bg-white/60 dark:bg-[#111827]/60"
      >
        <div className="absolute inset-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }} className="w-full h-full flex flex-col relative">
          <div className="w-full h-[240px] overflow-hidden relative group/image" style={{ transformStyle: "preserve-3d" }}>
            <div className="absolute inset-0 bg-accentCoral/5 dark:bg-accentCyan/10 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500 pointer-events-none"></div>
            <motion.img
              whileHover={{ scale: 1.15 }} transition={{ duration: 0.8 }}
              src={project.imageUrl} alt={project.title}
              className="w-full h-full object-cover grayscale-[30%] dark:grayscale-[60%] group-hover:grayscale-0 transition-all duration-700 pointer-events-none"
            />

            <div style={{ transform: "translateZ(60px)" }} className="absolute inset-0 flex items-center justify-center gap-6 z-[100] opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50 backdrop-blur-md pointer-events-none group-hover:pointer-events-auto">
              <button
                type="button"
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  if (project.githubLink) window.open(project.githubLink, '_blank'); 
                }}
                className="w-14 h-14 rounded-full bg-white text-slate-900 flex items-center justify-center text-2xl shadow-2xl hover:text-accentCoral dark:hover:text-accentCyan hover:scale-110 transition-all cursor-pointer pointer-events-auto"
              >
                <FaGithub />
              </button>
              <button
                type="button"
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  if (project.link) window.open(project.link, '_blank'); 
                }}
                className="w-14 h-14 rounded-full bg-white text-slate-900 flex items-center justify-center text-2xl shadow-2xl hover:text-accentCoral dark:hover:text-accentCyan hover:scale-110 transition-all cursor-pointer pointer-events-auto"
              >
                <FaExternalLinkAlt />
              </button>
            </div>
          </div>

          <div className="p-8 flex-1 flex flex-col relative z-20 bg-gradient-to-b from-transparent to-white/20 dark:to-black/30" style={{ transform: "translateZ(30px)" }}>
            <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-accentCoral dark:group-hover:text-accentCyan transition-colors brand-logo">
              {project.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-1 leading-relaxed">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {project.technologies?.map((tech, i) => (
                <span key={i} className="text-[11px] font-semibold bg-slate-100 dark:bg-white/10 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 shadow-inner uppercase tracking-widest relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const App = () => {
  const [projects, setProjects] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springConfig = { damping: 25, stiffness: 700, mass: 0.5 };
  const cursorXSpring = useSpring(mouseX, springConfig);
  const cursorYSpring = useSpring(mouseY, springConfig);

  const spotlightDark = useMotionTemplate`radial-gradient(800px circle at ${mouseX}px ${mouseY}px, rgba(0, 240, 255, 0.04), transparent 80%)`;
  const spotlightLight = useMotionTemplate`radial-gradient(800px circle at ${mouseX}px ${mouseY}px, rgba(255, 77, 77, 0.03), transparent 80%)`;

  const navigate = useNavigate();

  useEffect(() => {
    // Secret Admin Login Shortcut (Ctrl + Shift + A)
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    const mouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", mouseMove);
    return () => window.removeEventListener("mousemove", mouseMove);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/projects`);
      if (!data || data.length === 0) {
        throw new Error("No projects found in database.");
      }
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([
        {
          _id: 1,
          title: "X-Nova Analytics",
          description: "A state-of-the-art predictive analytics platform using deep learning models to forecast market trends.",
          imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
          technologies: ["React", "Python", "TensorFlow", "Node.js"],
          githubLink: "https://github.com/Hrishabh24/TheGreenMart.git", // 👈 ADD YOUR PROJECT's GITHUB REPO LINK HERE
          link: "#" // 👈 ADD YOUR PROJECT's LIVE LINK HERE
        },
        {
          _id: 2,
          title: "Crypto Nexus",
          description: "Real-time decentralized exchange dashboard with high-frequency trading capabilities and fluid UI.",
          imageUrl: "https://images.unsplash.com/photo-1621501103258-3e125c1109a4?w=800&q=80",
          technologies: ["Vue.js", "Solidity", "TailwindCSS", "Web3.js"],
          githubLink: "https://github.com/Hrishabh24/your-repo-link", // 👈 ADD YOUR PROJECT's GITHUB REPO LINK HERE
          link: "#" // 👈 ADD YOUR PROJECT's LIVE LINK HERE
        },
        {
          _id: 3,
          title: "Aura Creative Suite",
          description: "Generative AI-powered design tool allowing professionals to craft ultra-realistic compositions.",
          imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
          technologies: ["Next.js", "Framer Motion", "OpenAI", "PostgreSQL"]
        }
      ]);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    try {
      await axios.post(`${API_URL}/messages`, contactForm);
      setFormStatus('success');
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setFormStatus(null), 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 3000);
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.3, duration: 0.8 } }
  };

  const popIn = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
  };

  const textReveal = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.8 } }
  };

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, 250]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <div className={`${isDark ? 'dark' : ''} selection:bg-accentCoral/30 selection:text-accentCoral dark:selection:bg-accentCyan/30 dark:selection:text-accentCyan font-sans`}>
      <div className="min-h-screen relative overflow-x-hidden bg-[#F8FAFC] dark:bg-[#07090E] text-slate-900 dark:text-slate-100 transition-colors duration-700">

        {/* Magic Custom Cursor */}
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-accentCoral dark:border-accentCyan fixed top-0 left-0 pointer-events-none z-[999] hidden md:block"
          style={{
            x: cursorXSpring,
            y: cursorYSpring,
            translateX: "-50%",
            translateY: "-50%",
            scale: isHovering ? 1.8 : 1,
            backgroundColor: isHovering ? "rgba(255, 255, 255, 1)" : "transparent",
            mixBlendMode: isHovering ? "difference" : "normal"
          }}
          transition={{ scale: { type: "tween", ease: "backOut", duration: 0.15 } }}
        />

        {/* Premium Modern Abstract Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Moving Subtle Dot Grid Pattern with Fade Mask */}
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}
          >
            <div className={`absolute -inset-10 animate-grid ${isDark ? 'bg-dot-grid-dark opacity-100' : 'bg-dot-grid-light opacity-50'}`}></div>
          </div>

          <div className="fixed inset-0 z-[5] bg-noise"></div>

          {/* Primary Animated Orbs (Global Scope) */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 100, 0], y: [0, -50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] right-[5%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-accentCoral/10 dark:bg-accentPurple/25 rounded-full blur-[100px] md:blur-[130px] mix-blend-multiply dark:mix-blend-screen"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], x: [0, -100, 0], y: [0, 100, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[20%] left-[-5%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] bg-accentGold/10 dark:bg-accentCyan/15 rounded-full blur-[100px] md:blur-[140px] mix-blend-multiply dark:mix-blend-screen"
          />

          {/* Floating React Icon Background */}
          <motion.div
            animate={{ y: [-30, 30, -30], rotate: [0, 360] }}
            transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 25, repeat: Infinity, ease: "linear" } }}
            className="absolute top-[20%] left-[8%] text-accentCoral/10 dark:text-accentCyan/10 pointer-events-none z-0 hidden lg:block"
          >
            <FaReact className="w-[30vw] h-[30vw] max-w-[400px] max-h-[400px] blur-[2px]" />
          </motion.div>

          {/* Interactive Cinematic Mouse Spotlight */}
          <motion.div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: isDark ? spotlightDark : spotlightLight
            }}
          />
        </div>

        {/* Navbar */}
        <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'glass-panel shadow-sm py-4' : 'bg-transparent py-6'}`}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <motion.a
              href="#" className="flex items-center gap-2 text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white brand-logo"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
            >
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                <FaCode className="text-accentCoral dark:text-accentCyan" />
              </motion.div>
              <span>PRARABDH<span className="text-accentCoral dark:text-accentCyan">.</span></span>
            </motion.a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <ul className="flex gap-8 text-[1.05rem] font-medium text-slate-600 dark:text-slate-300 relative">
                {['Home', 'About', 'Work', 'Contact'].map((item, idx) => (
                  <motion.li key={idx} whileHover={{ y: -2 }} className="relative group">
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="hover:text-slate-900 dark:hover:text-white transition-colors"
                      onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
                    >
                      {item}
                    </a>
                    <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accentCoral dark:bg-accentCyan group-hover:w-full transition-all duration-300"></div>
                  </motion.li>
                ))}
              </ul>
              <motion.button
                onClick={() => setIsDark(!isDark)}
                className="p-3 rounded-full bg-white dark:bg-white/5 text-slate-700 dark:text-yellow-400 shadow-sm border border-slate-200 dark:border-white/10 hover:border-accentCoral dark:hover:border-accentCyan cursor-pointer touch-manipulation z-50"
                aria-label="Toggle Theme"
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9, rotate: -15 }}
                onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
              >
                <AnimatePresence mode="wait">
                  <motion.div key={isDark ? 'moon' : 'sun'} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1, rotate: isDark ? [0, 180] : [0, -180] }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.5 }}>
                    {isDark ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}><FaSun className="text-lg" /></motion.div> : <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}><FaMoon className="text-lg" /></motion.div>}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-4 z-[110]">
              <motion.button
                onClick={() => setIsDark(!isDark)}
                className="p-2.5 rounded-full bg-white dark:bg-white/5 text-slate-700 dark:text-yellow-400 border border-slate-200 dark:border-white/10 shadow-sm cursor-pointer"
                whileTap={{ scale: 0.8 }}
              >
                {isDark ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}><FaSun /></motion.div> : <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}><FaMoon /></motion.div>}
              </motion.button>
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 text-slate-900 dark:text-white rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm"
                whileTap={{ scale: 0.8 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div key={mobileMenuOpen ? 'close' : 'open'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    {mobileMenuOpen ? <motion.div animate={{ rotate: 90 }} transition={{ duration: 0.5 }}><FaTimes /></motion.div> : <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}><FaBars /></motion.div>}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-white/95 dark:bg-[#07090E]/95 backdrop-blur-xl md:hidden flex justify-center items-center"
            >
              <ul className="flex flex-col gap-8 text-4xl font-extrabold text-slate-900 dark:text-white text-center brand-logo">
                {['Home', 'About', 'Work', 'Contact'].map((item, idx) => (
                  <motion.li key={idx} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}>
                    <a
                      href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-accentCoral hover:to-accentGold dark:hover:from-accentCyan dark:hover:to-accentPurple block transition-colors"
                    >
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section id="home" className="relative pt-32 pb-20 md:py-48 min-h-[90vh] flex items-center justify-center px-4 overflow-hidden"
          onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>

          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-4xl text-center relative z-10 w-full mx-auto flex flex-col items-center">

            <motion.div initial="hidden" animate="show" variants={staggerContainer} className="w-full flex flex-col items-center">
              <motion.div variants={popIn} className="inline-flex px-6 py-2.5 rounded-full border border-accentCoral/20 dark:border-accentCyan/30 bg-accentCoral/5 dark:bg-accentCyan/10 mb-8 backdrop-blur-md shadow-sm">
                <span className="text-accentCoral dark:text-accentCyan font-bold tracking-widest uppercase text-xs md:text-sm">
                  Full-Stack Software Engineer
                </span>
              </motion.div>

              <div className="overflow-hidden py-2 w-full text-center relative z-10 flex justify-center">
                <motion.h1 variants={textReveal} className="text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] font-black leading-[1.05] tracking-tighter mb-8 text-slate-900 dark:text-white drop-shadow-sm brand-logo flex flex-col items-center">
                  <span className="flex items-center justify-center gap-3 lg:gap-6">
                    Crafting digital
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                      className="text-accentCoral dark:text-accentCyan hidden sm:flex items-center justify-center"
                    >
                      <FaReact className="w-12 h-12 md:w-16 md:h-16 lg:w-[5rem] lg:h-[5rem] drop-shadow-2xl" />
                    </motion.div>
                  </span>
                  <span className="text-gradient animate-text-gradient bg-gradient-to-r from-accentCoral via-accentGold to-accentCoral dark:from-accentCyan dark:via-accentPurple dark:to-accentCyan tracking-tight mt-1 lg:mt-3">experiences.</span>
                </motion.h1>
              </div>

              <motion.p variants={fadeInUp} className="text-slate-600 dark:text-slate-400 text-lg md:text-2xl mb-12 max-w-2xl mx-auto font-normal px-4 leading-relaxed">
                Building scalable, advanced, and meticulously designed web applications using the powerful MERN stack entirely from the ground up.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full px-6 sm:w-auto">
                <motion.a
                  whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}
                  href="#projects"
                  className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-4 rounded-xl font-semibold text-white bg-slate-900 text-lg flex items-center justify-center gap-3 shadow-lg dark:bg-gradient-hover dark:shadow-[0_15px_30px_rgba(0,240,255,0.15)] relative overflow-hidden group border border-transparent transition-all"
                  onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
                >
                  <motion.div animate={{ y: [-2, 2, -2] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}><FaBriefcase className="relative z-10" /></motion.div> <span className="relative z-10">View My Work</span>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}
                  href="#contact"
                  className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-4 rounded-xl font-semibold text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-white/5 backdrop-blur-md border border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-accentCyan flex items-center justify-center gap-3 text-lg shadow-sm transition-all"
                  onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
                >
                  <motion.div animate={{ rotate: [-10, 10, -10] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}><FaComment /></motion.div> Contact Me
                </motion.a>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 md:py-32 max-w-7xl mx-auto px-6 relative z-20">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-extrabold text-center text-slate-900 dark:text-white mb-20 tracking-tight brand-logo">
              About <span className="text-gradient">Me</span>
            </motion.h2>

            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <motion.div variants={fadeInUp} className="flex-1 w-full relative">
                <div className="glass-panel p-10 md:p-14 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-accentCoral/10 dark:bg-accentPurple/20 rounded-bl-full"></div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-3 brand-logo relative z-10">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}><FaUser className="text-accentCoral dark:text-accentCyan" /></motion.div> Who I Am
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg leading-relaxed relative z-10">
                    I construct digital ecosystems rather than just websites. Rooted in deep technical expertise, I design full-stack architectures that perform exceptionally at scale while featuring a premium frontend experience.
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed relative z-10">
                    Whether leading e-commerce structural migrations or forging AI-driven dashboards, the MERN ecosystem continuously empowers me to sculpt reactive, seamless platforms with absolute zero compromises.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex-1 w-full flex flex-col justify-center px-4">
                <h3 className="text-2xl md:text-3xl font-bold mb-10 text-slate-900 dark:text-white brand-logo">Technical Arsenal</h3>
                <div className="space-y-8">
                  {[
                    { name: 'Core MERN Stack', percent: '98%' },
                    { name: 'React / Next / UI Frameworks', percent: '95%' },
                    { name: 'API Engineering (REST/GraphQL)', percent: '90%' },
                    { name: 'System Architecture & Design', percent: '85%' }
                  ].map((skill, index) => (
                    <motion.div key={index} whileHover={{ scale: 1.02, x: 5 }} className="group">
                      <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-3 text-md">
                        <span className="flex items-center gap-3">
                          {skill.name}
                        </span>
                        <span className="text-accentCoral dark:text-accentCyan">{skill.percent}</span>
                      </div>
                      <div className="h-3 w-full bg-slate-200 dark:bg-[#151822] rounded-full overflow-hidden shadow-inner relative border border-slate-300 dark:border-transparent">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: skill.percent }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: index * 0.15, type: 'spring' }}
                          className="absolute top-0 left-0 h-full bg-gradient-hover rounded-full"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-24 md:py-32 max-w-7xl mx-auto px-6 relative z-20">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-extrabold text-center text-slate-900 dark:text-white mb-20 tracking-tight brand-logo">
              Selected <span className="text-gradient">Projects</span>
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {projects.map((project, index) => (
                <Project3DCard key={project._id || index} project={project} />
              ))}
            </div>
          </motion.div>
        </section>

        {/* High-End Refactored Contact Section */}
        <section id="contact" className="py-24 md:py-32 max-w-6xl mx-auto px-6 relative z-20 mb-12">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="relative w-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl glass-panel border border-slate-200 dark:border-white/5 flex flex-col lg:flex-row"
            onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
          >
            {/* Left Side: Contact Info Pane */}
            <div className="w-full lg:w-5/12 p-10 md:p-14 bg-gradient-to-br from-accentCoral to-[#ff7a59] dark:from-accentCyan dark:to-accentPurple text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-[100px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-tr-[100px] pointer-events-none"></div>

              <motion.div variants={fadeInUp} className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight brand-logo border-b border-white/20 pb-6">Get In Touch</h2>
                  <p className="text-white/90 text-lg leading-relaxed font-medium">
                    Have an exciting project in mind or just want to say hi? I am an open book. Let's build something truly game-changing.
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    { icon: FaEnvelope, title: 'Email Me directly', detail: 'prarabdhankursingh2004@gmail.com', url: 'mailto:prarabdhankursingh2004@gmail.com' },
                    { icon: FaLinkedin, title: 'Connect on LinkedIn', detail: 'linkedin.com/in/Prarabdh Singh', url: 'https://www.linkedin.com/in/prarabdh-singh-55795b363' },

                    // 👇 ADD YOUR MAIN PORTFOLIO GITHUB REPO LINK IN THE 'url' BELOW 👇
                    { icon: FaGithub, title: 'View my code', detail: 'github.com/Prarabdh', url: 'https://github.com/Hrishabh24' }
                  ].map((item, idx) => (
                    <motion.a key={idx} href={item.url} target={item.url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" whileHover={{ x: 10, scale: 1.02 }} className="flex items-center gap-5 group cursor-pointer p-2 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center text-xl shadow-inner border border-white/30 group-hover:bg-white group-hover:text-slate-900 transition-all shrink-0">
                        <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                          <item.icon />
                        </motion.div>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white uppercase tracking-wider">{item.title}</h4>
                        <p className="text-white/80 text-sm mt-0.5">{item.detail}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Side: Clean Form */}
            <div className="w-full lg:w-7/12 p-10 md:p-14 bg-white/60 dark:bg-transparent flex flex-col justify-center">
              <motion.form variants={fadeInUp} className="w-full flex flex-col gap-6 md:gap-8" onSubmit={handleContactSubmit}>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 hidden lg:block brand-logo">Send a Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1" htmlFor="name">Name</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text" id="name"
                      className="bg-transparent border-b-2 border-slate-300 dark:border-white/20 hover:border-accentCoral dark:hover:border-accentCyan px-2 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-accentCoral dark:focus:border-accentCyan transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-slate-50 dark:focus:bg-white/5 rounded-t-lg"
                      placeholder="John Doe" required
                      value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1" htmlFor="email">Email</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="email" id="email"
                      className="bg-transparent border-b-2 border-slate-300 dark:border-white/20 hover:border-accentCoral dark:hover:border-accentCyan px-2 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-accentCoral dark:focus:border-accentCyan transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-slate-50 dark:focus:bg-white/5 rounded-t-lg"
                      placeholder="john@example.com" required
                      value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1" htmlFor="message">Message</label>
                  <motion.textarea
                    whileFocus={{ scale: 1.01 }}
                    id="message"
                    className="bg-transparent border-b-2 border-slate-300 dark:border-white/20 hover:border-accentCoral dark:hover:border-accentCyan px-2 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-accentCoral dark:focus:border-accentCyan transition-all min-h-[140px] resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-slate-50 dark:focus:bg-white/5 rounded-t-lg"
                    placeholder="Tell me how I can help..." required
                    value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  ></motion.textarea>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -3 }} whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="mt-6 px-10 py-5 rounded-xl font-bold text-base text-white bg-slate-900 dark:bg-accentCyan dark:text-slate-900 hover:bg-accentCoral dark:hover:bg-white flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_20px_rgba(0,240,255,0.2)] transition-all uppercase tracking-widest self-start w-full sm:w-auto"
                  disabled={formStatus === 'sending'}
                >
                  {formStatus === 'sending' ? 'Sending...' : 'Send Message'}
                </motion.button>

                {formStatus === 'success' && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-600 dark:text-emerald-400 font-bold mt-4 text-sm bg-emerald-50 dark:bg-emerald-900/20 py-3 px-4 rounded-lg">Message successfully sent! I will reply shortly.</motion.p>}
                {formStatus === 'error' && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 dark:text-red-400 font-bold mt-4 text-sm bg-red-50 dark:bg-red-900/20 py-3 px-4 rounded-lg">Failed to send message. Please try again.</motion.p>}
              </motion.form>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-white/5 py-10 relative z-10 glass-panel" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-600 dark:text-slate-400 font-semibold text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 text-center md:text-left brand-logo">
              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                <FaCode className="text-accentCoral dark:text-accentCyan shrink-0 text-lg md:text-xl" />
              </motion.div>
              <span>© {new Date().getFullYear()} Prarabdh Singh. All rights reserved.</span>
            </p>
            <div className="flex items-center gap-6 md:gap-8">
              {/* 👇 ADD YOUR MAIN PORTFOLIO GITHUB REPO LINK IN THE 'href' BELOW 👇 */}
              <motion.a whileHover={{ y: -5, scale: 1.15 }} href="https://github.com/Hrishabh24" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-accentCoral dark:text-slate-400 dark:hover:text-accentCyan transition-colors"><motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}><FaGithub className="text-2xl" /></motion.div></motion.a>
              <motion.a whileHover={{ y: -5, scale: 1.15 }} href="https://www.linkedin.com/in/prarabdh-singh-55795b363" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-accentCoral dark:text-slate-400 dark:hover:text-accentCyan transition-colors"><motion.div animate={{ rotateY: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}><FaLinkedin className="text-2xl" /></motion.div></motion.a>
              <motion.a whileHover={{ y: -5, scale: 1.15 }} href="mailto:prarabdhankursingh2004@gmail.com" className="text-slate-600 hover:text-accentCoral dark:text-slate-400 dark:hover:text-accentCyan transition-colors"><motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}><FaEnvelope className="text-2xl" /></motion.div></motion.a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
