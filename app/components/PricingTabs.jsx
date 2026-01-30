"use client";

import React, { useState } from "react";

const PricingTabs = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [tabSwitchKey, setTabSwitchKey] = useState(0);

  const pricingData = {
    basic: [
      {
        service: "Men's Haircut",
        price: "100 mdl",
        description:
          "A classic haircut tailored to your style and preferences.",
      },
      {
        service: "Beard Trim",
        price: "70 mdl",
        description: "Precision trimming and shaping for a sharp, clean look.",
      },
      {
        service: "Shampoo",
        price: "50 mdl",
        description: "Relaxing shampoo to cleanse and refresh your hair.",
      },
    ],
    premium: [
      {
        service: "Men's Haircut + Styling",
        price: "200 mdl",
        description:
          "A premium haircut with expert styling for a polished look.",
      },
      {
        service: "Beard Trim + Grooming",
        price: "150 mdl",
        description: "Comprehensive grooming for a well-maintained beard.",
      },
      {
        service: "Shampoo + Conditioning",
        price: "100 mdl",
        description: "Deep conditioning treatment for healthy, shiny hair.",
      },
    ],
    deluxe: [
      {
        service: "Full Haircut Package",
        price: "300 mdl",
        description:
          "Complete haircut package with styling and finishing touches.",
      },
      {
        service: "Beard Trim + Facial",
        price: "250 mdl",
        description: "A relaxing facial combined with expert beard grooming.",
      },
      {
        service: "Scalp Treatment",
        price: "150 mdl",
        description: "Therapeutic scalp treatment to promote hair health.",
      },
    ],
  };

  // Добавляем key для анимации при смене тарифа
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTabSwitchKey((prev) => prev + 1);
  };

  return (
    <section
      id="pricing-tabs"
      className="relative z-10 overflow-hidden bg-cover bg-center pb-12 pt-20 lg:pb-[90px] lg:pt-[120px]"
      style={{
        backgroundImage: "url('/360.jpg')",
        backgroundAttachment: "fixed",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
      }}
    >
      {/* Затемнение фона */}
      <div className="absolute inset-0 bg-black opacity-80 z-0"></div>

      <div className="relative container mx-auto p-6 rounded-lg z-10">
        {/* Прелоад картинок всех табов */}
        <div style={{ display: "none" }}>
          {Object.entries(pricingData).map(([tab, items]) =>
            items.map((_, idx) => (
              <img
                key={`${tab}-${idx}`}
                src={`/${tab}-${idx + 1}.jpg`}
                alt=""
                loading="eager"
                decoding="async"
              />
            )),
          )}
        </div>

        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto mb-[60px] max-w-[510px] text-center">
              <h2 className="mb-3 text-3xl font-bold leading-[1.208] text-red-500 sm:text-4xl md:text-[40px]">
                Services and our pricing Plans
              </h2>
              <p className="text-base text-gray-300">
                Choose the best plan that fits your needs. Switch between tabs
                to explore our pricing options.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          {["basic", "premium", "deluxe"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-2 mx-2 rounded border-gray-600 border-2 ${
                activeTab === tab
                  ? "bg-red-500 text-white"
                  : "bg-[#2a2a2a] text-gray-300"
              } hover:bg-indigo-500 hover:text-white transition`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Анимация fade для карточек при смене тарифа */}
        <div
          key={tabSwitchKey}
          className="-mx-4 flex flex-wrap justify-center transition-opacity duration-500 animate-fade-in"
          style={{ animation: "fadeIn 0.5s" }}
        >
          {pricingData[activeTab].map((item, index) => (
            <div key={index} className="w-full px-4 md:w-1/2 lg:w-1/3 flex">
              <div className="relative z-10 mb-10 flex-grow overflow-hidden rounded-[10px] border-2 border-gray-600 bg-[#2a2a2a] px-8 py-10 shadow-lg sm:p-12 lg:px-6 lg:py-10 xl:p-[50px] min-h-[350px] flex flex-col justify-between">
                <div>
                  <h3 className="mb-3 text-[24px] font-bold text-white">
                    {item.service}
                  </h3>
                  <p className="mb-5 text-base text-gray-300">
                    {item.description}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="mb-8 text-[32px] font-bold text-red-500">
                    {item.price}
                  </p>
                  <img
                    src={`/${activeTab}-${index + 1}.jpg`}
                    className="w-full h-64 shadow-lg object-cover rounded-md mt-4"
                    alt=""
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingTabs;
