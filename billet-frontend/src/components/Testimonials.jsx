import React, { useState, useEffect } from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      text: "Ticky m’a permis de gérer mon festival en toute simplicité. Interface intuitive et service au top.",
      author: "Julie M.",
    },
    {
      text: "Grâce à Ticky, j’ai pu vendre mes billets en ligne sans me prendre la tête.",
      author: "Karim D.",
    },
    {
      text: "Le processus de création d’événement est rapide et fluide. Bravo !",
      author: "Sophie L.",
    },
    {
      text: "En tant qu'organisateur, je ne reviendrai jamais en arrière. Ticky est juste parfait.",
      author: "Ali T.",
    },
  ];

  const [current, setCurrent] = useState(0);

  // Auto-slide toutes les 6s (facultatif)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="bg-white py-24 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-anton mb-6 relative inline-block">
          Ils nous font confiance
          <span className="block w-1/4 h-[3px] bg-black mt-2 mx-auto"></span>
        </h2>

        <div className="relative">
          {/* Slide content */}
          <div className="transition-all duration-700 ease-in-out">
            <p className="text-xl sm:text-2xl font-inter text-gray-800 italic">
              “{testimonials[current].text}”
            </p>
            <p className="mt-4 text-sm text-red-700 font-medium">
              – {testimonials[current].author}
            </p>
          </div>

          {/* Bullets navigation */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === current ? 'bg-black scale-125' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
