"use client";

import React from "react";

export default function CarCard({
  car,
}: {
  car: { id: number; name: string; type: string; pricePerDay: number; img: string };
}) {
  return (
    <article className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
      <div className="h-44 bg-gray-100">
        <img src={car.img} alt={car.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{car.name}</h3>
            <p className="text-sm text-gray-500">{car.type}</p>
          </div>
          <div className="text-right">
            <div className="font-bold text-indigo-600">${car.pricePerDay}</div>
            <div className="text-xs text-gray-400">/ day</div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            Rent now
          </button>
          <button className="text-sm text-gray-500 hover:text-gray-700">Details</button>
        </div>
      </div>
    </article>
  );
}
