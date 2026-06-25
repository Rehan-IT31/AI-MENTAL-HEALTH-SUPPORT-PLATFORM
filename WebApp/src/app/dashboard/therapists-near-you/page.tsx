"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

/* ---------------- TYPES ---------------- */

type Therapist = {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  phone: string;
  clinic: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
};

type TherapistWithDistance = Therapist & {
  distance?: number;
  distanceText?: string;
};

/* ---------------- MUMBAI THERAPISTS ---------------- */

const therapists: Therapist[] = [
  {
    id: "1",
    name: "Dr. Ananya Deshpande",
    specialization: "Clinical Psychologist",
    rating: 4.8,
    phone: "+91 98201 44521",
    clinic: "MindBalance Clinic",
    address: "Veera Desai Rd, Andheri West, Mumbai",
    location: { lat: 19.1367, lng: 72.8261 },
  },
  {
    id: "2",
    name: "Dr. Rohan Malhotra",
    specialization: "CBT Therapist",
    rating: 4.6,
    phone: "+91 98922 33110",
    clinic: "Serenity Mental Health",
    address: "Bandra Kurla Complex, Bandra East, Mumbai",
    location: { lat: 19.0596, lng: 72.8295 },
  },
  {
    id: "3",
    name: "Dr. Pooja Iyer",
    specialization: "Psychiatrist",
    rating: 4.7,
    phone: "+91 98190 77219",
    clinic: "MindCare Hospital",
    address: "Hiranandani Gardens, Powai, Mumbai",
    location: { lat: 19.1176, lng: 72.906 },
  },
  {
    id: "4",
    name: "Dr. Kunal Shah",
    specialization: "Addiction Specialist",
    rating: 4.5,
    phone: "+91 99301 66544",
    clinic: "ReNew Life Clinic",
    address: "SV Road, Malad West, Mumbai",
    location: { lat: 19.1873, lng: 72.8484 },
  },
  {
    id: "5",
    name: "Dr. Neha Kulkarni",
    specialization: "Child Psychologist",
    rating: 4.9,
    phone: "+91 98765 44321",
    clinic: "Bright Minds Center",
    address: "Gokhale Rd, Dadar West, Mumbai",
    location: { lat: 19.0183, lng: 72.8424 },
  },
  {
    id: "6",
    name: "Dr. Sameer Khan",
    specialization: "Marriage & Family Therapist",
    rating: 4.4,
    phone: "+91 97654 88990",
    clinic: "Harmony Wellness",
    address: "Link Rd, Jogeshwari West, Mumbai",
    location: { lat: 19.145, lng: 72.842 },
  },
  {
    id: "7",
    name: "Dr. Ritu Mehra",
    specialization: "Trauma Therapist",
    rating: 4.7,
    phone: "+91 98111 22009",
    clinic: "SafeSpace Therapy",
    address: "Carter Rd, Bandra West, Mumbai",
    location: { lat: 19.0607, lng: 72.8225 },
  },
  {
    id: "8",
    name: "Dr. Akash Verma",
    specialization: "Behavioral Therapist",
    rating: 4.3,
    phone: "+91 99002 77118",
    clinic: "MindPath Clinic",
    address: "Vikhroli East, Mumbai",
    location: { lat: 19.1111, lng: 72.9397 },
  },
  {
    id: "9",
    name: "Dr. Shweta Nair",
    specialization: "Anxiety Specialist",
    rating: 4.8,
    phone: "+91 99887 11223",
    clinic: "CalmNest Clinic",
    address: "Chembur East, Mumbai",
    location: { lat: 19.0626, lng: 72.897 },
  },
  {
    id: "10",
    name: "Dr. Amit Joshi",
    specialization: "Depression Specialist",
    rating: 4.6,
    phone: "+91 98203 90987",
    clinic: "InnerHeal Clinic",
    address: "Thane West, Mumbai",
    location: { lat: 19.2183, lng: 72.9781 },
  },
  {
    id: "11",
    name: "Dr. Sana Sheikh",
    specialization: "Psychodynamic Therapist",
    rating: 4.5,
    phone: "+91 98455 66123",
    clinic: "MindSpring",
    address: "Kurla West, Mumbai",
    location: { lat: 19.0728, lng: 72.8826 },
  },
  {
    id: "12",
    name: "Dr. Vikram Rao",
    specialization: "Stress Management",
    rating: 4.4,
    phone: "+91 97777 55441",
    clinic: "Balance Point Clinic",
    address: "Lower Parel, Mumbai",
    location: { lat: 18.997, lng: 72.8303 },
  },
];

/* ---------------- MAP ---------------- */

const TherapistMap = dynamic(
  () => import("@/components/TherapistMap"),
  { ssr: false }
);

const MUMBAI_LOCATION = { lat: 19.076, lng: 72.8777 };

/* ---------------- HELPERS ---------------- */

const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ---------------- PAGE ---------------- */

export default function TherapistsNearYouPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  const enriched: TherapistWithDistance[] = therapists.map((t) => {
    const km = calculateDistance(
      MUMBAI_LOCATION.lat,
      MUMBAI_LOCATION.lng,
      t.location.lat,
      t.location.lng
    );
    return { ...t, distance: km, distanceText: `${km.toFixed(1)} km` };
  });

  const handleBook = () => {
    if (!selectedId) return;
    setToast(true);
    setTimeout(() => setToast(false), 1800);
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 h-screen">
      {/* LIST */}
      <div className="space-y-4 overflow-y-auto">
        {enriched.map((t) => (
          <div
            key={t.id}
            className={`border rounded-lg p-4 transition ${
              selectedId === t.id ? "border-blue-500 bg-blue-50" : ""
            }`}
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-sm text-gray-600">{t.specialization}</p>
                <p className="text-sm">⭐ {t.rating} • {t.distanceText}</p>
                <p className="text-xs text-gray-500">{t.clinic}</p>
                <p className="text-xs text-gray-500">{t.address}</p>
                <p className="text-xs text-gray-500">📞 {t.phone}</p>
              </div>

              <input
                type="radio"
                checked={selectedId === t.id}
                onChange={() => setSelectedId(t.id)}
              />
            </div>

            <button
              disabled={selectedId !== t.id}
              onClick={handleBook}
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-300"
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>

      {/* MAP */}
      <TherapistMap userLocation={MUMBAI_LOCATION} therapists={enriched} />

      {/* TOAST */}
     {toast && (
  <div className="fixed bottom-6 right-6 z-[9999] bg-green-600 text-white px-4 py-2 rounded shadow animate-pulse">
    ✅ Appointment Booked
  </div>
)}

    </div>
  );
}
