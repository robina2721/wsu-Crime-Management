import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Shield,
  AlertTriangle,
  Users,
  FileText,
  Phone,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function Index() {
  const features = [
    {
      icon: FileText,
      title: 'Crime Reporting',
      description: 'File and track crime reports with our comprehensive reporting system.',
      color: 'text-crime-red'
    },
    {
      icon: Shield,
      title: 'Case Management',
      description: 'Efficient case tracking and management for law enforcement officers.',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Multi-Role Access',
      description: 'Role-based access for officers, administrators, and citizens.',
      color: 'text-green-600'
    },
    {
      icon: AlertTriangle,
      title: 'Emergency Response',
      description: 'Quick response system for critical incidents and emergencies.',
      color: 'text-crime-yellow'
    }
  ];

  const stats = [
    { number: '500+', label: 'Cases Resolved', icon: FileText },
    { number: '24/7', label: 'Monitoring', icon: Clock },
    { number: '50+', label: 'Active Officers', icon: Shield },
    { number: '10k+', label: 'Citizens Served', icon: Users }
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
                <h1 className="text-xl font-bold text-white">Crime Management System</h1>
                <p className="text-gray-300 text-sm">Wolaita Sodo City</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button className="bg-crime-red hover:bg-crime-red-dark text-white">
                  Login / Access System
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-crime-black/80 to-crime-red-dark/80"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Secure. Efficient.
              <span className="text-crime-yellow block">Crime Management</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Advanced crime management system for Wolaita Sodo City.
              Streamline reporting, investigation, and case management with our comprehensive platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-crime-red hover:bg-crime-red-dark text-white px-8 py-4 text-lg">
                  Access System
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-crime-black px-8 py-4 text-lg"
              >
                <Phone className="mr-2 w-5 h-5" />
                Emergency: 911
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/95 backdrop-blur border-crime-red/20 text-center">
                <CardContent className="p-6">
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-crime-red" />
                  <h3 className="text-2xl font-bold text-crime-black">{stat.number}</h3>
                  <p className="text-gray-600">{stat.label}</p>
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
              Comprehensive Crime Management
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our platform provides all the tools necessary for effective law enforcement and community safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/95 backdrop-blur border-crime-red/20 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                  <CardTitle className="text-crime-black">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-crime-red/10 backdrop-blur">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Access our secure system to manage cases, file reports, or monitor activities.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-crime-yellow hover:bg-yellow-500 text-crime-black px-8 py-4 text-lg font-medium">
              Login to System
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-crime-black border-t border-crime-red/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Shield className="w-6 h-6 text-crime-red" />
              <span className="text-white font-medium">Wolaita Sodo City Police Department</span>
            </div>

            <div className="flex items-center space-x-6 text-gray-300">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>Emergency: 911</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Wolaita Sodo, Ethiopia</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400">
            <p>&copy; 2024 Wolaita Sodo City Crime Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
