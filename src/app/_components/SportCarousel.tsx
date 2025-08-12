"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const sports = [
  { name: "Running", image: "/sports/running.jpg" },
  { name: "Cycling", image: "/sports/cycling.jpg" },
  { name: "Swimming", image: "/sports/swimming.jpg" },
  { name: "Triathlon", image: "/sports/triathlon.jpg" },
  { name: "Pickleball", image: "/sports/pickleball.jpg" },
];

export default function SportsCarousel() {
  const [index, setIndex] = useState(0);

  const prev = () => {
    setIndex((prev) => (prev === 0 ? sports.length - 1 : prev - 1));
  };

  const next = () => {
    setIndex((prev) => (prev === sports.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex gap-4 transition-transform duration-500"
           style={{ transform: `translateX(-${index * 220}px)` }}>
        {sports.map((sport, i) => (
          <div key={i} className="w-52 flex-shrink-0 bg-white shadow rounded-lg overflow-hidden text-center">
            <div className="relative h-32 w-full">
              <Image src={sport.image} alt={sport.name} fill className="object-cover" />
            </div>
            <p className="py-2 font-semibold">{sport.name}</p>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
