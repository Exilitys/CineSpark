import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Film,
  Sparkles,
  Target,
  Eye,
  Heart,
  Zap,
  Users,
  Award,
  ArrowLeft,
  Github,
  Linkedin,
  Instagram,
  GraduationCap,
  MapPin,
  Code,
  Lightbulb,
  Star,
} from "lucide-react";

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation First",
      description:
        "We push the boundaries of what's possible with AI technology in filmmaking.",
    },
    {
      icon: Users,
      title: "Creator-Centric",
      description:
        "Every feature is designed with filmmakers' needs and workflows in mind.",
    },
    {
      icon: Zap,
      title: "Efficiency",
      description:
        "We transform weeks of pre-production work into hours of intelligent automation.",
    },
    {
      icon: Heart,
      title: "Accessibility",
      description:
        "Making professional filmmaking tools available to creators at every level.",
    },
  ];

  const achievements = [
    {
      icon: Award,
      title: "AI Innovation",
      description:
        "Pioneering the integration of advanced AI in film pre-production workflows",
    },
    {
      icon: Users,
      title: "Creator Community",
      description:
        "Empowering filmmakers worldwide with cutting-edge technology",
    },
    {
      icon: Zap,
      title: "Industry Impact",
      description: "Revolutionizing how stories are developed and visualized",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 sm:mb-6"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-cinema-900/20 to-gold-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <div className="relative">
                <Film className="h-12 w-12 sm:h-16 sm:w-16 text-gold-500" />
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-cinema-400 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              About{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
                CineSparkAI
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-4">
              Revolutionizing filmmaking through the power of artificial
              intelligence, transforming creative visions into production-ready
              masterpieces.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8">
                Transforming Ideas Into{" "}
                <span className="text-gold-400">Cinematic Reality</span>
              </h2>
              <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-300 leading-relaxed">
                <p>
                  CineSparkAI is at the forefront of the entertainment
                  technology revolution, bridging the gap between creative
                  imagination and professional film production. Our cutting-edge
                  AI platform empowers filmmakers, storytellers, and content
                  creators to transform their ideas into comprehensive
                  pre-production packages in a fraction of the traditional time.
                </p>
                <p>
                  Founded on the belief that great stories deserve great tools,
                  we've developed an intelligent ecosystem that understands the
                  nuances of storytelling, cinematography, and visual narrative.
                  From concept to camera-ready, CineSparkAI is your creative
                  partner in bringing extraordinary stories to life.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-gold-500/20 to-cinema-500/20 rounded-2xl p-6 sm:p-8 border border-gold-500/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="text-center"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <achievement.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">
                        {achievement.title}
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {achievement.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-700"
            >
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cinema-500 to-cinema-600 rounded-full flex items-center justify-center mr-4">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                To democratize professional filmmaking by providing intelligent,
                AI-powered tools that transform creative concepts into
                production-ready content. We believe every storyteller deserves
                access to professional-grade pre-production capabilities,
                regardless of their budget or technical expertise.
              </p>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center text-cinema-400">
                  <Star className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Accelerate creative workflows by 90%
                  </span>
                </div>
                <div className="flex items-center text-cinema-400">
                  <Star className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Make professional tools accessible to all creators
                  </span>
                </div>
                <div className="flex items-center text-cinema-400">
                  <Star className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Enhance storytelling through intelligent automation
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-700"
            >
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center mr-4">
                  <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                To become the global standard for AI-assisted filmmaking,
                creating a future where technology amplifies human creativity
                rather than replacing it. We envision a world where every great
                story can be told with professional quality, powered by
                intelligent tools that understand and enhance the art of visual
                storytelling.
              </p>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center text-gold-400">
                  <Star className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Lead the AI revolution in entertainment
                  </span>
                </div>
                <div className="flex items-center text-gold-400">
                  <Star className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Empower the next generation of filmmakers
                  </span>
                </div>
                <div className="flex items-center text-gold-400">
                  <Star className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Transform how stories are brought to life
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
              Our Core Values
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              The principles that guide our innovation and drive our commitment
              to revolutionizing the film industry
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-gold-500 transition-all duration-300 group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Solve */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
              Solving Real{" "}
              <span className="text-gold-400">Industry Challenges</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              CineSparkAI addresses the most pressing pain points in modern film
              production
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-xl p-6 sm:p-8 border border-gray-700"
            >
              <div className="text-red-400 mb-4">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  ❌ Traditional Challenges
                </h3>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-400">
                <li>• Weeks of manual pre-production planning</li>
                <li>• Expensive professional consultation</li>
                <li>• Complex storyboarding processes</li>
                <li>• Limited access to industry tools</li>
                <li>• High barrier to entry for new creators</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gold-500/10 to-cinema-500/10 rounded-xl p-6 sm:p-8 border border-gold-500/30"
            >
              <div className="text-gold-400 mb-4">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">⚡ Our Solution</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-300">
                <li>• AI-powered story generation in minutes</li>
                <li>• Automated professional shot lists</li>
                <li>• Intelligent visual storyboarding</li>
                <li>• Affordable subscription model</li>
                <li>• User-friendly interface for all skill levels</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-xl p-6 sm:p-8 border border-gray-700"
            >
              <div className="text-green-400 mb-4">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">✅ The Result</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-400">
                <li>• 90% faster pre-production workflow</li>
                <li>• Professional-quality output</li>
                <li>• Significant cost savings</li>
                <li>• Enhanced creative possibilities</li>
                <li>• Democratized filmmaking tools</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder Profile */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
              Meet Our Founder
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
              The visionary behind CineSparkAI's revolutionary approach to
              filmmaking technology
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 md:p-12 border border-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-center">
                {/* Profile Image Placeholder */}
                <div className="lg:col-span-1">
                  <div className="relative">
                    <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-gradient-to-br from-gold-500 to-cinema-600 rounded-full flex items-center justify-center">
                      <div className="w-36 h-36 sm:w-44 sm:h-44 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                        <img
                          src="/asset/fotoCarlo.jpg"
                          alt="Jonathan Carlo"
                          className="rounded-full w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
                      <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Profile Content */}
                <div className="lg:col-span-2 text-center lg:text-left">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Jonathan Carlo
                  </h3>
                  <p className="text-gold-400 text-lg font-medium mb-4">
                    Founder & CEO
                  </p>

                  <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center text-gray-400">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      <span className="text-sm">Computer Science Student</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        Binus University, Tangerang
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-300 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                    Jonathan Carlo is a passionate Computer Science student at
                    Binus University in Tangerang, Indonesia, with a deep
                    fascination for artificial intelligence and its
                    transformative potential in creative industries. Combining
                    his technical expertise with a love for storytelling,
                    Jonathan founded CineSparkAI to bridge the gap between
                    cutting-edge AI technology and the art of filmmaking.
                  </p>

                  <p className="text-gray-300 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
                    His vision extends beyond just creating another tech
                    platform—he's building a future where AI amplifies human
                    creativity, making professional filmmaking tools accessible
                    to creators worldwide. Through CineSparkAI, Jonathan is
                    pioneering the next generation of entertainment technology,
                    one story at a time.
                  </p>

                  {/* Social Links */}
                  <div className="flex justify-center lg:justify-start space-x-4">
                    <a
                      href="https://github.com/Exilitys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors duration-200 group"
                    >
                      <Github className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-white" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/jonathan-carlo-670b73233/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-200 group"
                    >
                      <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-white" />
                    </a>
                    <a
                      href="https://www.instagram.com/jonathancarlo20/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-200 group"
                    >
                      <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-white" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-br from-gold-500/10 to-cinema-500/10 rounded-2xl p-8 sm:p-12 border border-gold-500/30"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Transform Your{" "}
              <span className="text-gold-400">Creative Vision?</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Join thousands of creators who are already using CineSparkAI to
              bring their stories to life. Start your filmmaking journey today
              with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-5 w-5" />
                <span>Start Creating</span>
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Eye className="h-5 w-5" />
                <span>View Pricing</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};