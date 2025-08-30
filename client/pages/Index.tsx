import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Shield,
  AlertTriangle,
  Users,
  FileText,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  CheckCircle,
  Award,
  Globe,
  Lock,
  Zap,
  Eye,
  UserCheck,
  Activity,
} from "lucide-react";

import { useI18n } from '@/contexts/I18nContext';

export default function Index() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { t } = useI18n();

  const features = [
    {
      icon: FileText,
      title: "Digital Crime Reporting",
      description:
        "File and track crime reports with our comprehensive digital reporting system.",
      color: "text-crime-red",
      badge: "New",
    },
    {
      icon: Shield,
      title: "Advanced Case Management",
      description:
        "Efficient case tracking and management for law enforcement officers.",
      color: "text-blue-600",
      badge: "Popular",
    },
    {
      icon: Users,
      title: "Multi-Role Access",
      description:
        "Role-based access for officers, administrators, and citizens.",
      color: "text-green-600",
      badge: "Secure",
    },
    {
      icon: AlertTriangle,
      title: "Emergency Response",
      description:
        "Quick response system for critical incidents and emergencies.",
      color: "text-crime-yellow",
      badge: "24/7",
    },
    {
      icon: Lock,
      title: "Criminal Database",
      description: "Secure access to criminal records and investigation data.",
      color: "text-purple-600",
      badge: "Classified",
    },
    {
      icon: Activity,
      title: "Real-Time Monitoring",
      description: "Live tracking of patrol activities and incident responses.",
      color: "text-indigo-600",
      badge: "Live",
    },
  ];

  const stats = [
    { number: "500+", label: "Cases Resolved", icon: FileText, change: "+12%" },
    { number: "24/7", label: "Monitoring", icon: Clock, change: "Always" },
    { number: "50+", label: "Active Officers", icon: Shield, change: "+8%" },
    { number: "10k+", label: "Citizens Served", icon: Users, change: "+15%" },
  ];

  const testimonials = [
    {
      name: "Chief Inspector Dawit Tadesse",
      role: "Police Head",
      content:
        "This system has revolutionized our case management. Response times have improved by 40% since implementation.",
      rating: 5,
    },
    {
      name: "Detective Sara Alemayehu",
      role: "Detective Officer",
      content:
        "The criminal database integration has made investigations so much more efficient. I can access records instantly.",
      rating: 5,
    },
    {
      name: "Kebede Alemu",
      role: "Citizen",
      content:
        "Filing a crime report is now so easy. I can track the progress and get updates on my case status.",
      rating: 5,
    },
  ];

  const userRoles = [
    {
      icon: Shield,
      title: "Law Enforcement",
      description: "Officers, Detectives, and Police Leadership",
      features: [
        "Case Management",
        "Investigation Tools",
        "Criminal Database",
        "Patrol Logs",
      ],
    },
    {
      icon: UserCheck,
      title: "Administration",
      description: "System Administrators and HR Management",
      features: [
        "User Management",
        "System Configuration",
        "Asset Management",
        "Reports",
      ],
    },
    {
      icon: Users,
      title: "Citizens",
      description: "Community Members and Witnesses",
      features: [
        "Crime Reporting",
        "Case Status",
        "Emergency Contact",
        "Safe Communication",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-crime-black via-gray-900 to-crime-red-dark">
      {/* Header */}
      <header className="relative z-10 bg-crime-black/90 backdrop-blur-sm border-b border-crime-red/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-crime-red" />
              <div>
                <h1 className="text-xl font-bold text-white">{t('app.title')}</h1>
                <p className="text-gray-300 text-sm">{t('city.name')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <LanguageToggle />
              <Link to="/login">
                <Button className="bg-crime-red hover:bg-crime-red-dark text-white transition-all hover:scale-[1.02]">
                  {t('login.accessSystem')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-crime-black/80 to-crime-red-dark/80"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-crime-red/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-crime-yellow/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <Badge className="bg-crime-yellow text-crime-black px-4 py-2 text-sm font-medium mb-4">
                <Award className="w-4 h-4 mr-2" />
                {t('hero.leadingBadge')}
              </Badge>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t('hero.welcome')}
              <span className="text-crime-yellow block">{t('city.name')}</span>
              <span className="text-crime-red block">{t('app.title')}</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Empowering law enforcement and community safety through advanced
              technology. Our comprehensive platform streamlines crime
              reporting, investigation management, and emergency response for a
              safer Wolaita Sodo City.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-crime-red hover:bg-crime-red-dark text-white px-8 py-4 text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Shield className="mr-2 w-5 h-5" />
                  {t('hero.securePortal')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-crime-black px-8 py-4 text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Phone className="mr-2 w-5 h-5" />
                {t('hero.emergency')}
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                <span>{t('trust.iso')}</span>
              </div>
              <div className="flex items-center">
                <Lock className="w-5 h-5 mr-2 text-blue-400" />
                <span>{t('trust.encryption')}</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-purple-400" />
                <span>{t('trust.support')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-white/95 backdrop-blur border-crime-red/20 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <CardContent className="p-6">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-crime-red" />
                  <h3 className="text-3xl font-bold text-crime-black mb-1">
                    {stat.number}
                  </h3>
                  <p className="text-gray-600 mb-2">{stat.label}</p>
                  <Badge variant="outline" className="text-xs text-green-600">
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('features.platformTitle')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('features.platformDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/95 backdrop-blur border-crime-red/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <CardHeader className="relative">
                  <div className="absolute top-4 right-4">
                    <Badge
                      className={`
                      ${
                        feature.badge === "New"
                          ? "bg-green-500 text-white"
                          : feature.badge === "Popular"
                            ? "bg-blue-500 text-white"
                            : feature.badge === "Secure"
                              ? "bg-red-500 text-white"
                              : feature.badge === "24/7"
                                ? "bg-purple-500 text-white"
                                : feature.badge === "Classified"
                                  ? "bg-gray-800 text-white"
                                  : "bg-indigo-500 text-white"
                      }
                    `}
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                  <feature.icon
                    className={`w-12 h-12 ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                  />
                  <CardTitle className="text-crime-black">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 bg-crime-black/20 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('roles.designedFor')}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {t('roles.designedForDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {userRoles.map((role, index) => (
              <Card
                key={index}
                className="bg-white/95 backdrop-blur border-crime-red/20 hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="text-center">
                  <role.icon className="w-16 h-16 mx-auto mb-4 text-crime-red" />
                  <CardTitle className="text-xl text-crime-black">
                    {role.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {role.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-sm text-gray-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('testimonials.heading')}
            </h2>
            <p className="text-xl text-gray-300">{t('testimonials.subheading')}</p>
          </div>

          <Card className="bg-white/95 backdrop-blur border-crime-red/20">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[activeTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-500 fill-current"
                      />
                    ),
                  )}
                </div>
                <blockquote className="text-xl text-gray-700 mb-6 italic">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div className="text-center">
                  <p className="font-semibold text-crime-black">
                    {testimonials[activeTestimonial].name}
                  </p>
                  <p className="text-gray-600">
                    {testimonials[activeTestimonial].role}
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === activeTestimonial
                        ? "bg-crime-red"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-crime-red/20 to-crime-yellow/20 backdrop-blur">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Badge className="bg-crime-yellow text-crime-black px-4 py-2 text-sm font-medium mb-4">
              <Zap className="w-4 h-4 mr-2" />
              {t('cta.badge')}
            </Badge>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('cta.heading')}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">{t('cta.subheading')}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-crime-yellow hover:bg-yellow-500 text-crime-black px-8 py-4 text-lg font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Shield className="mr-2 w-5 h-5" />
                {t('cta.enterPortal')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-crime-black px-8 py-4 text-lg shadow-lg"
            >
              <Eye className="mr-2 w-5 h-5" />
              {t('cta.learnMore')}
            </Button>
          </div>

          <div className="mt-8 text-gray-400 text-sm">
            <p>🔒 All communications are encrypted and secure</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-crime-black border-t border-crime-red/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Shield className="w-6 h-6 text-crime-red" />
              <span className="text-white font-medium">{t('footer.dept')}</span>
            </div>

            <div className="flex items-center space-x-6 text-gray-300">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>{t('footer.emergency')}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{t('footer.location')}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
