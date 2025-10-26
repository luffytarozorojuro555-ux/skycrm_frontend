import { Link } from "react-router-dom";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CloudIcon,
  Shield,
  Users,
  TrendingUp,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { Zap, Lock, LineChart, Database, Bell, Star } from "lucide-react";

export default function AllLogin() {
  const roles = [
    {
      key: "Admin",
      title: "Admin",
      description: "Complete system control and user management",
      icon: Shield,
      gradient: "from-blue-600 via-blue-700 to-blue-800",
      features: ["User Management", "System Settings", "Security Controls"],
    },
    {
      key: "Sales Manager",
      title: "Sales Manager",
      description: "Oversee teams and drive performance",
      icon: Users,
      gradient: "from-purple-600 via-purple-700 to-purple-800",
      features: ["Team Analytics", "Performance Reports", "Goal Setting"],
    },
    {
      key: "Sales Representatives",
      title: "Sales Representatives",
      description: "Manage leads and close deals efficiently",
      icon: TrendingUp,
      gradient: "from-teal-600 via-teal-700 to-teal-800",
      features: ["Lead Management", "Deal Pipeline", "Client Communication"],
    },
    {
      key: "Sales Team Lead",
      title: "Sales Team Lead",
      description: "Guide your team to achieve targets",
      icon: BarChart3,
      gradient: "from-indigo-600 via-indigo-700 to-indigo-800",
      features: ["Team Coordination", "Progress Tracking", "Coaching Tools"],
    },
  ];

  const navigate = useNavigate();

  const handleSelect = (roleKey) => {
    navigate("/login", { state: { role: roleKey } });
  };

  const features = [
    {
      icon: CloudIcon,
      title: "Cloud-Based Platform",
      description:
        "Access your CRM from anywhere with secure cloud infrastructure",
      color: "text-blue-600",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "Bank-level encryption and role-based access control",
      color: "text-purple-600",
    },
    {
      icon: LineChart,
      title: "Advanced Analytics",
      description: "Real-time insights and predictive sales forecasting",
      color: "text-teal-600",
    },
    {
      icon: Zap,
      title: "Workflow Automation",
      description: "Automate repetitive tasks and boost productivity",
      color: "text-indigo-600",
    },
    {
      icon: Database,
      title: "Centralized Data",
      description: "All customer information in one unified platform",
      color: "text-blue-600",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Stay updated with intelligent alerts and reminders",
      color: "text-purple-600",
    },
  ];

  const benefits = [
    "Increase sales productivity by 40%",
    "Reduce manual data entry by 60%",
    "Improve customer satisfaction scores",
    "Accelerate deal closure rates",
    "Enhance team collaboration",
    "Make data-driven decisions",
  ];

  const user = [
    {
      id: 1,
      name: "Alice",
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFpuOSjiyGEUaCyacNrXh9DC8o80KhKXWzEg&s",
    },
    {
      id: 2,
      name: "Bob",
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn9zilY2Yu2hc19pDZFxgWDTUDy5DId7ITqA&s",
    },
    {
      id: 3,
      name: "Charlie",
      avatar:
        "https://media.istockphoto.com/id/1347005975/photo/portrait-of-a-serious-muslim-young-man-looking-at-camera.jpg?s=612x612&w=0&k=20&c=mxRUDCuwDD3ML6-vMaUlTY7Ghqlj2R_LOhWWCB5CTXE=",
    },
    {
      id: 4,
      name: "Diana",
      avatar:
        "https://img.freepik.com/free-photo/close-up-smiley-woman-posing_23-2149178089.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      id: 5,
      name: "Eve",
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCwXUFTVjD_08iDhYUk9q-WNbF2o7c3RM4Mw&s",
    },
  ];

  const rolesRef = useRef(null);

  const HandleRoles = () => {
    rolesRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-900 rounded-xl flex items-center justify-center shadow-lg">
              <CloudIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-blue-600 bg-clip-text text-transparent">
                Sky CRM
              </h1>
              <p className="text-xs text-gray-600">Enterprise Sales Platform</p>
            </div>
          </div>
          <button
            onClick={HandleRoles}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium transition-opacity"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-white via-blue-50 to-white py-12 md:py-20">
        <div className="mx-auto w-[95%] md:w-[92%] lg:w-[90%] grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left animate-fade-in">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
              Transform Your Sales with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent">
                Sky CRM
              </span>
            </h2>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              The intelligent CRM platform designed for modern sales teams.
              Streamline workflows, boost productivity, and close more deals
              with powerful automation and analytics.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <button
                onClick={HandleRoles}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-900 hover:opacity-90 text-white rounded-lg font-medium text-lg transition-opacity"
              >
                Start Free Trial
              </button>
              <button className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 bg-transparent rounded-lg font-medium text-lg transition-colors">
                Watch Demo
              </button>
            </div>

            {/* Reviews Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6">
              {/* User Avatars */}
              <div className="flex -space-x-2">
                {user.map((i) => (
                  <img
                    key={i.id}
                    src={i.avatar}
                    alt={i.name}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  />
                ))}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="ml-2 text-sm md:text-base font-medium text-gray-700">
                  4/5 from 2,500+ reviews
                </span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center lg:justify-end">
            <img
              src="/modern-crm-dashboard-interface-with-charts-and-ana.jpg"
              alt="Sky CRM Dashboard"
              className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl rounded-3xl shadow-2xl border-4 border-white object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-10">
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-4 py-1.5 border-2 border-blue-600 text-blue-600 rounded-full text-sm font-medium">
            Powerful Features
          </span>
          <h3 className="text-4xl md:text-5xl font-bold">
            Everything You Need to Succeed
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools designed to streamline your sales process and
            maximize results
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="border-2 rounded-xl p-6 hover:border-blue-600 transition-all hover:shadow-xl animate-fade-in-up group bg-white"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.color}`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                <p className="text-base leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Role-Based Access Section */}
      <section
        ref={rolesRef}
        className="container mx-auto px-4 py-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl my-12"
      >
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-4 py-1.5 border-2 border-purple-600 text-purple-600 rounded-full text-sm font-medium">
            Role-Based Access
          </span>
          <h3 className="text-4xl md:text-5xl font-bold">
            Tailored for Every Role
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select your role to access a personalized dashboard with features
            designed specifically for your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <div
                key={role.key}
                onClick={() => handleSelect(role.key)}
                className="group hover:scale-105 transition-all duration-300 cursor-pointer border-2 rounded-xl hover:border-blue-600 hover:shadow-2xl animate-fade-in-up h-full bg-white p-6"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-center pb-4">
                  <div
                    className={`w-20 h-20 mx-auto bg-gradient-to-br ${role.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform shadow-lg`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">{role.title}</h4>
                  <p className="text-base text-gray-600">{role.description}</p>
                </div>
                <div className="space-y-2">
                  {role.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-blue-400/20 rounded-3xl blur-3xl" />
            <img
              src="/business-team-analyzing-sales-data-on-multiple-scr.jpg"
              alt="Team Analytics"
              className="relative rounded-3xl shadow-2xl border-4 border-white"
            />
          </div>
          <div className="space-y-8 animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 border-2 border-teal-600 text-teal-600 rounded-full text-sm font-medium">
              Proven Results
            </span>
            <h3 className="text-4xl md:text-5xl font-bold">
              Drive Real Business Impact
            </h3>
            <p className="text-xl text-gray-600 leading-relaxed">
              Join thousands of successful teams who have transformed their
              sales operations with Sky CRM
            </p>
            <div className="grid gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 hover:border-teal-600 transition-colors"
                >
                  <CheckCircle2 className="w-6 h-6 text-teal-600 flex-shrink-0" />
                  <span className="text-lg font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="container mx-auto px-4 py-10 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl my-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <span className="inline-block px-4 py-1.5 border-2 border-purple-600 text-purple-600 rounded-full text-sm font-medium">
              Enterprise Security
            </span>
            <h3 className="text-4xl md:text-5xl font-bold">
              Your Data is Safe with Us
            </h3>
            <p className="text-xl text-gray-600 leading-relaxed">
              Bank-level encryption, role-based access control, and compliance
              with industry standards ensure your data remains secure
            </p>
            <div className="grid gap-6">
              <div className="border-2 rounded-xl p-6 bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">256-bit Encryption</h4>
                    <p className="text-gray-600">
                      Military-grade data protection
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-2 rounded-xl p-6 bg-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Role-Based Access</h4>
                    <p className="text-gray-600">
                      Granular permission controls
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-3xl blur-3xl" />
            <img
              src="/cybersecurity-dashboard.png"
              alt="Security Features"
              className="relative rounded-3xl shadow-2xl border-4 border-white"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-5 mb-12">
        <div className="bg-gradient-to-br from-blue-600 via-blue-400 to-teal-600 rounded-xl text-white overflow-hidden relative p-16">
          <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10" />
          <div className="text-center space-y-6 relative z-10">
            <span className="inline-block px-4 py-1.5 bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm">
              Limited Time Offer
            </span>
            <h3 className="text-4xl md:text-5xl font-bold text-white">
              Ready to Transform Your Sales?
            </h3>
            <p className="text-blue-50 text-xl max-w-3xl mx-auto leading-relaxed">
              Join thousands of teams already using Sky CRM to streamline their
              sales process, boost productivity, and grow their business
              exponentially
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <button
                onClick={HandleRoles}
                className="px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-lg transition-colors"
              >
                Start Free 30-Day Trial
              </button>
              <button className="px-8 py-3 border-2 border-white text-white hover:bg-white/10 bg-transparent rounded-lg font-medium text-lg transition-colors">
                Schedule a Demo
              </button>
            </div>
            <p className="text-blue-100 text-sm pt-4">
              No credit card required • Cancel anytime • 24/7 support
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/90 backdrop-blur-md py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-900 rounded-xl flex items-center justify-center">
                <CloudIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold bg-blue-600  bg-clip-text text-transparent">
                  Sky CRM
                </h3>
                <p className="text-xs text-gray-600">
                  Enterprise Sales Platform
                </p>
              </div>
            </div>
            <p className="text-gray-600 text-center">
              &copy; 2025 Sky CRM. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// import React from 'react'
// import { useNavigate } from 'react-router-dom'

// const roles = [
//   { key: 'Admin', label: 'Admin' },
//   { key: 'Sales Manager', label: 'Sales Manager' },
//   { key: 'Sales Team Lead', label: 'Sales Team Lead' },
//   { key: 'Sales Representatives', label: 'Sales Representatives' }
// ]

// const AllLogin = () => {
//   const navigate = useNavigate()

//   const handleSelect = (roleKey) => {
//     navigate('/login', { state: { role: roleKey } })
//   }

//   return (
//     <div className="min-h-screen grid place-items-center bg-gray-50">
//       <div className="bg-white p-6 rounded-2xl shadow w-[360px] space-y-4">
//         <h1 className="text-xl font-semibold text-center">Select Role to Continue</h1>
//         <div className="grid gap-3">
//           {roles.map(r => (
//             <button
//               key={r.key}
//               className="w-full py-2 border rounded-lg hover:bg-gray-100"
//               onClick={() => handleSelect(r.key)}
//             >
//               {r.label}
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default AllLogin
