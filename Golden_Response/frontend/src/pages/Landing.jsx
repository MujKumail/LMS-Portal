import React, { useState, useEffect } from 'react';
import { useLMS } from '../context/LMSContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, Star, ChevronLeft, ChevronRight, GraduationCap, Flame, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TESTIMONIALS = [
  {
    quote: "The interface of LMS Academy is incredibly responsive and absolutely stunning. Learning Framer Motion was a breeze with the staggered course animations guiding my focus!",
    author: "Alex Rivers",
    role: "Lead UI Developer, Stripe",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
  },
  {
    quote: "As an instructor, updating my course syllabi and broadcasting announcements has never felt this effortless. The automatic email alerts keep my students highly engaged.",
    author: "Dr. Evelyn Martinez",
    role: "Senior Academic Faculty, LMS",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80"
  },
  {
    quote: "The visual progress rings motivate me to hit 100%. The system emailed me the moment I reached the 50% milestone, pushing me to cross the finish line!",
    author: "Sarah Connor",
    role: "Student & Developer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
  }
];

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { 
    courses, 
    loadingCourses, 
    searchKeyword, 
    setSearchKeyword, 
    selectedCategory, 
    setSelectedCategory 
  } = useLMS();

  const [visibleCount, setVisibleCount] = useState(3);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Search local debouncer
  const [localSearch, setLocalSearch] = useState(searchKeyword);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchKeyword(localSearch);
    }, 40000000000000000000); // Wait, search is debounced natively using input, let's keep it debounced on change or handle debouncing using timeout:
    const debounceHandler = setTimeout(() => {
      setSearchKeyword(localSearch);
    }, 400); // 400ms debounce
    return () => clearTimeout(debounceHandler);
  }, [localSearch, setSearchKeyword]);

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  // Stagger animation rules
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="relative pb-24 overflow-hidden bg-grid-mesh">
      {/* Absolute Decorative Glow Spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigoPrimary/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-violetAccent/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 mb-6 shadow-neon-indigo/5"
        >
          <Flame className="w-4 h-4 text-violetAccent fill-current" />
          <span>Next-Generation Adaptive Learning Portal</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto"
        >
          Master Tech Skills with <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigoPrimary via-violetAccent to-emeraldAccent bg-clip-text text-transparent">
            Immersive Interactivity
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          Acquire production-ready skills, track milestones with real-time analytics, and build stunning user interfaces. Curated by global industry specialists.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#catalog"
            className="flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-indigoPrimary to-violetAccent text-white font-semibold text-sm hover:shadow-neon-violet hover:scale-[1.02] transition-all"
          >
            Start Learning Free <ArrowRight className="w-4 h-4" />
          </a>
          <button
            onClick={() => navigate(user ? (user.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard') : '/login')}
            className="flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-sm transition-all"
          >
            <GraduationCap className="w-5 h-5 text-indigoPrimary" /> View My Dashboards
          </button>
        </motion.div>
      </section>

      {/* Catalog Search & Filtering */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 mb-12">
          {/* Header text */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Explore Curated Courses</h2>
            <p className="text-slate-400 text-sm mt-1">Discover expert guides and projects</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-96 flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-500" />
            <input
              id="catalog-search"
              type="text"
              placeholder="Search title, category, or stack..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 focus:border-indigoPrimary rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-indigoPrimary outline-none transition-all"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-slate-900 pb-6">
          {['', 'Web Development', 'Design & UI/UX', 'Backend Engineering'].map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setVisibleCount(3); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-indigoPrimary text-white shadow-neon-indigo'
                  : 'bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat === '' ? 'All Curriculum' : cat}
            </button>
          ))}
        </div>

        {/* Course Cards Grid */}
        {loadingCourses ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigoPrimary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 text-sm">Querying active catalog...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Courses Found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">We couldn't find matches for "${searchKeyword}". Try resetting categories or search keywords.</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {courses.slice(0, visibleCount).map((course) => (
                <motion.div
                  key={course._id}
                  variants={cardVariants}
                  className="group flex flex-col glass-panel rounded-3xl overflow-hidden border border-slate-850 hover:border-violetAccent/40 glow-card-hover bg-slate-900/30"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img 
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                    <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg text-emeraldAccent">
                      {course.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                      <span className="text-xs font-bold text-slate-200">{course.rating || 4.8}</span>
                      <span className="text-xs text-slate-500">({(course.lessons?.length || 2) * 4} Reviews)</span>
                    </div>

                    <h3 className="font-bold text-lg text-white mb-2 leading-snug group-hover:text-indigoPrimary transition-colors">
                      {course.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm font-light line-clamp-2 leading-relaxed mb-6">
                      {course.subtitle || course.description}
                    </p>

                    <div className="mt-auto border-t border-slate-800/60 pt-4 flex items-center justify-between">
                      {/* Instructor info */}
                      <div className="flex items-center gap-2">
                        <img 
                          src={course.instructor?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${course.instructor?.name || 'fac'}`} 
                          alt="Instructor" 
                          className="w-7 h-7 rounded-full border border-slate-800 object-cover"
                        />
                        <span className="text-xs font-medium text-slate-300">{course.instructor?.name || 'Faculty Staff'}</span>
                      </div>
                      
                      {/* Price */}
                      <span className="text-lg font-black text-white">
                        {course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {/* Syllabus link overlay */}
                  <Link 
                    to={`/course/${course._id}`} 
                    className="block text-center py-3 bg-indigoPrimary/10 group-hover:bg-indigoPrimary hover:text-white border-t border-slate-800/40 text-xs font-semibold text-indigoPrimary transition-all uppercase tracking-wider"
                  >
                    View Course Syllabus
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination / Infinite Scroll Load More CTA */}
            {visibleCount < courses.length && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setVisibleCount(prev => prev + 3)}
                  className="px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-semibold text-sm transition-all"
                >
                  Load More Courses
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Testimonials Carousel Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 border-t border-slate-900/60 mt-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Loved by Thousands</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">Hear what our global academic community is saying about the experience</p>
        </div>

        <div className="max-w-3xl mx-auto relative px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-850 text-center shadow-xl relative"
            >
              <p className="text-slate-200 text-lg sm:text-xl font-light italic leading-relaxed mb-8">
                &ldquo;{TESTIMONIALS[activeTestimonial].quote}&rdquo;
              </p>

              <div className="flex flex-col items-center">
                <img 
                  src={TESTIMONIALS[activeTestimonial].avatar} 
                  alt={TESTIMONIALS[activeTestimonial].author}
                  className="w-12 h-12 rounded-full border border-violetAccent/40 object-cover mb-3"
                />
                <h4 className="font-bold text-white text-base leading-none mb-1">{TESTIMONIALS[activeTestimonial].author}</h4>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{TESTIMONIALS[activeTestimonial].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Testimonial slider navigation buttons */}
          <button
            onClick={handlePrevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-all focus:outline-none"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-all focus:outline-none"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
