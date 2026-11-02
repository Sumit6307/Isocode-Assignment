"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  PhoneCall,
  Clock,
  Sparkles,
  ArrowRight,
  Home,
  Layers,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { ChatBox } from "@/components/chat/ChatBox";

export default function HomePage() {
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("shubh-residency");

  const projects = [
    {
      id: "shubh-residency",
      name: "Shubh Residency",
      tagline: "Spacious Living by the Serene Shela Lake",
      location: "Near Shela Lake, Off SG Highway, Shela, Ahmedabad",
      reraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD/RAA10000/A1/260126",
      priceRange: "₹65 Lakh - ₹95 Lakh",
      configs: "2 & 3 BHK Premium Residences",
      totalUnits: 240,
      availableUnits: 82,
      possession: "December 2027",
      amenities: [
        "Clubhouse & Swimming Pool",
        "Fully Equipped Gymnasium",
        "Children's Play Park",
        "Covered Parking per Unit",
        "Landscaped Jogging Track",
        "24/7 Multi-Tier Security",
      ],
      highlights: [
        "10 mins to SG Highway corporate corridor",
        "Pre-approved by SBI, HDFC & ICICI",
        "Vastu-compliant layouts",
      ],
    },
    {
      id: "aarambh-heights",
      name: "Aarambh Heights",
      tagline: "Contemporary Architecture in Prime South Bopal",
      location: "Near Bopal Lake, South Bopal, Ahmedabad",
      reraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD/RAA10001/B2/150226",
      priceRange: "₹78 Lakh - ₹1.2 Crore",
      configs: "2 & 3 BHK Smart-Ready Homes",
      totalUnits: 180,
      availableUnits: 124,
      possession: "March 2028",
      amenities: [
        "Rooftop Infinity Swimming Pool",
        "Sky Lounge & Yoga Deck",
        "Dedicated EV Charging Stations",
        "Co-Working Workspace Pods",
        "Indoor Badminton Court",
        "Senior Citizen Gazebo Lounge",
      ],
      highlights: [
        "5 mins from South Bopal Circle",
        "Smart-Home Automation Ready",
        "Pre-approved home loans with top banks",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-stone-100 to-stone-50 border-b border-stone-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                AI Assistant Response Under 2 Minutes • 24/7 In Buyer's Language
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-950 leading-tight">
                Premium Residential Living in Ahmedabad.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
                Explore 420 meticulously planned 2 & 3 BHK homes across Shela and Bopal. Get transparent pricing from our verified sales fact sheet and reserve your site visit instantly.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/chat">
                  <Button size="lg" leftIcon={<MessageSquare className="w-4 h-4" />}>
                    Chat with AI & Book Site Visit
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    Explore Sales Dashboard
                  </Button>
                </Link>
              </div>

              {/* RERA and compliance trust line */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-stone-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Gujarat RERA Registered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-700" />
                  <span>Real Free Slots • No Double Booking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-stone-600" />
                  <span>DPDP Act 2023 Compliant</span>
                </div>
              </div>
            </div>

            {/* Quick Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xl p-6 relative">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-stone-900">
                        Lead Assistant Demo
                      </h3>
                      <p className="text-[10px] text-emerald-600 font-medium">
                        ● Online • Answers from Fact Sheet
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-mono">
                    Median: 90s response
                  </span>
                </div>

                <div className="py-4 space-y-3 text-xs">
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-stone-700">
                    <p className="font-semibold text-stone-900 mb-1">
                      Buyer: "What are the prices and free slots for 3 BHK in Shela?"
                    </p>
                    <p className="text-teal-900 mt-1 leading-relaxed">
                      AI: "Shubh Residency in Shela offers 3 BHK (1,550 - 1,750 sq ft) priced between ₹82L - ₹95L. We have 2 slots open tomorrow at 10:00 AM and 2:00 PM. Would you like me to reserve one?"
                    </p>
                  </div>

                  <div className="bg-teal-50/70 p-3 rounded-xl border border-teal-200/80 text-teal-950 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs">Nov 1 • 10:00 AM - 11:30 AM</p>
                      <p className="text-[11px] text-teal-700">Shubh Residency Site Office</p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                      Available
                    </span>
                  </div>
                </div>

                <Link href="/chat">
                  <Button fullWidth size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Try Interactive AI Chat Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      <section id="projects" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Our Two Live Residential Projects
          </h2>
          <p className="text-sm text-stone-500 mt-2">
            Ahmedabad West's highest growth micro-markets with verified titles, RERA approvals, and top bank partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              {/* Project Card Header */}
              <div className="p-6 border-b border-stone-100">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded">
                      Active Development
                    </span>
                    <h3 className="text-xl font-bold text-stone-950 mt-1">
                      {p.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">{p.tagline}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-400 block">Starting From</span>
                    <span className="text-base font-bold text-teal-800">
                      {p.priceRange}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 space-y-4 flex-1">
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>{p.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Configurations</span>
                    <strong className="text-stone-800">{p.configs}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Inventory</span>
                    <strong className="text-stone-800">
                      {p.availableUnits} of {p.totalUnits} Units Free
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Expected Handover</span>
                    <strong className="text-stone-800">{p.possession}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">RERA Number</span>
                    <span className="font-mono text-[10px] text-teal-800 truncate block">
                      {p.reraNumber}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-stone-800 mb-2">
                    Key Amenities & Features:
                  </h4>
                  <ul className="grid grid-cols-2 gap-1.5 text-xs text-stone-600">
                    {p.amenities.map((a, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between">
                <Link href={`/chat?project=${p.id}`} className="w-full">
                  <Button fullWidth size="md" leftIcon={<Calendar className="w-4 h-4" />}>
                    Check Free Slots & Book Visit
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating AI Chat Widget Trigger */}
      <div className="fixed bottom-6 right-6 z-50">
        {!showChatModal ? (
          <button
            onClick={() => setShowChatModal(true)}
            className="flex items-center gap-2.5 bg-stone-900 hover:bg-stone-800 text-white px-4 py-3 rounded-full shadow-2xl transition-transform hover:scale-105 border border-stone-700 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div className="text-left">
              <span className="text-xs font-bold block leading-none">
                AI Booking Desk
              </span>
              <span className="text-[10px] text-teal-300">
                Instant Slot Reservation
              </span>
            </div>
          </button>
        ) : (
          <div className="w-[380px] sm:w-[420px] h-[580px]">
            <ChatBox
              isWidget
              onClose={() => setShowChatModal(false)}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-stone-900 text-stone-400 py-10 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-stone-200">Company A • Ahmedabad, Gujarat</p>
            <p className="text-[11px] mt-0.5">
              RERA Reg: PR/GJ/AHMEDABAD/AHMEDABAD/RAA10000 & RAA10001
            </p>
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <Link href="/login" className="hover:text-white">Reviewer Login</Link>
            <Link href="/dashboard" className="hover:text-white">Admin Dashboard</Link>
            <Link href="/chat" className="hover:text-white">Buyer AI Chat</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
