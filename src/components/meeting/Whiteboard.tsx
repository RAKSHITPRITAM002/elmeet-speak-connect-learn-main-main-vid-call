import React, { useRef, useEffect } from "react";

interface WhiteboardProps {
  meetingId: string;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ meetingId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Initialize whiteboard drawing here.
    // Implement drawing, annotation tools, and persistence as needed.
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    // Draw a sample background grid for illustration.
    context.strokeStyle = "#ddd";
    for (let x = 0; x < canvas.width; x += 20) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }
    // Additional annotation tools can be integrated here.
  }, []);

  return (
    <section className="border p-4 rounded">
      <h2 className="text-2xl mb-2">Whiteboard</h2>
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="border rounded"
      ></canvas>
    </section>
  );
};

export default Whiteboard;