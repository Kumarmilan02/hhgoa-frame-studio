'use client';

import React, { useEffect, useState } from 'react';

interface GoaElement {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
}

const GOA_EMOJIS = ['🥥', '🌴', '🕶️', '🍹', '🌊', '🐚', '🏄', '☀️', '🍺', '🎸', '🪸', '🦀', '🌺', '🍍'];

export default function FloatingGoaVibes() {
  const [elements, setElements] = useState<GoaElement[]>([]);

  useEffect(() => {
    const newElements: GoaElement[] = [];

    for (let i = 0; i < 18; i++) {
      newElements.push({
        id: i,
        emoji: GOA_EMOJIS[Math.floor(Math.random() * GOA_EMOJIS.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 18 + 16,
        duration: Math.random() * 14 + 10,
        delay: Math.random() * 8,
        drift: (Math.random() - 0.5) * 80,
      });
    }

    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute animate-goa-float select-none"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            fontSize: `${el.size}px`,
            animationDuration: `${el.duration}s`,
            animationDelay: `${el.delay}s`,
            // @ts-expect-error CSS custom properties
            '--drift': `${el.drift}px`,
          }}
        >
          {el.emoji}
        </div>
      ))}
    </div>
  );
}
