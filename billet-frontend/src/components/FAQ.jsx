import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: 'Comment créer un événement ?',
      answer: 'Cliquez sur “Lancer un événement”, remplissez les détails et publiez-le en quelques minutes.',
    },
    {
      question: 'Ticky prend-il une commission ?',
      answer: 'Une petite commission est prélevée sur chaque billet vendu, pour couvrir les frais de service.',
    },
    {
      question: 'Puis-je vendre des billets gratuits ?',
      answer: 'Oui, vous pouvez proposer des billets gratuits ou payants selon votre besoin.',
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-16 px-4 max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12 font-anton">Foire aux questions</h2>
      
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div 
            key={idx} 
            className="border-b border-gray-200 pb-4"
          >
            <button
              onClick={() => toggleFAQ(idx)}
              className="flex justify-between items-center w-full text-left py-4 focus:outline-none"
            >
              <h3 className="text-xl font-medium text-gray-900">{faq.question}</h3>
              <span className="text-2xl text-gray-500">
                {activeIndex === idx ? '−' : '+'}
              </span>
            </button>
            
            {activeIndex === idx && (
              <div className="mt-2 text-gray-600">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;