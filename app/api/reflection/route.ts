import { NextResponse } from "next/server";

function randomFrom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: Request) {
  const { mood } = await req.json();

  const openings = [
    "Today carries a quiet undercurrent.",
    "There’s a subtle shift in the air.",
    "Something within you feels different.",
    "The day unfolds with a gentle tone.",
  ];

  const moodLines: any = {
    calm: [
      "Stillness becomes your advantage.",
      "Peace is not passive, it is powerful.",
      "Let silence sharpen your awareness.",
    ],
    focused: [
      "Clarity is your compass.",
      "Your attention feels deliberate and sharp.",
      "Depth comes easily when you let it.",
    ],
    tired: [
      "Softness is not weakness.",
      "Rest is part of progress.",
      "Move slowly, but move kindly.",
    ],
    motivated: [
      "Momentum hums beneath your skin.",
      "Energy gathers around intention.",
      "This is a day for beginning.",
    ],
  };

  const closings = [
    "Choose one meaningful step.",
    "Let the small act matter.",
    "Trust the rhythm you’re in.",
    "Begin without waiting for perfect conditions.",
  ];

  const reflection = `
${randomFrom(openings)} 
${randomFrom(moodLines[mood] || [])} 
${randomFrom(closings)}
  `.trim();

  return NextResponse.json({
    reflection,
  });
}
