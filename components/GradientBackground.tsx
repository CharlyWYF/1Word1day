"use client";

import { useEffect, useState } from "react";

const GRADIENTS = [
  "from-indigo-950 via-purple-950 to-slate-950",
  "from-slate-950 via-purple-950 to-blue-950",
  "from-gray-950 via-indigo-950 to-violet-950",
  "from-blue-950 via-indigo-950 to-slate-950",
  "from-violet-950 via-fuchsia-950 to-slate-950",
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
