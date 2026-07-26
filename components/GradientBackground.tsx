"use client";

import { useEffect, useState } from "react";

const GRADIENTS = [
  "from-pink-100 via-purple-100 to-blue-100",
  "from-amber-100 via-rose-100 to-indigo-100",
  "from-sky-100 via-indigo-50 to-purple-100",
  "from-teal-50 via-cyan-50 to-sky-100",
  "from-rose-50 via-fuchsia-50 to-purple-100",
];

export default function GradientBackground() {
  const [gradient, setGradient] = useState(GRADIENTS[0]);

  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        86400000
    );
    setGradient(GRADIENTS[dayOfYear % GRADIENTS.length]);
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br ${gradient} -z-10 transition-all duration-1000`}
    />
  );
}
