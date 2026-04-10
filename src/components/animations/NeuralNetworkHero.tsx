"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  layer: number;
  pulse: number;
  pulseSpeed: number;
}

interface Connection {
  from: Node;
  to: Node;
  particlePos: number;
  speed: number;
  active: boolean;
}

export default function NeuralNetworkHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    // Build network
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const layers = [4, 6, 8, 6, 3];
    const nodes: Node[] = [];
    const connections: Connection[] = [];

    const layerSpacing = w / (layers.length + 1);

    layers.forEach((count, layerIdx) => {
      const nodeSpacing = h / (count + 1);
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: layerSpacing * (layerIdx + 1),
          y: nodeSpacing * (i + 1),
          layer: layerIdx,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.02,
        });
      }
    });

    // Connect adjacent layers
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j].layer === nodes[i].layer + 1) {
          connections.push({
            from: nodes[i],
            to: nodes[j],
            particlePos: Math.random(),
            speed: 0.003 + Math.random() * 0.004,
            active: Math.random() > 0.3,
          });
        }
      }
    }

    let time = 0;
    const animate = () => {
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      ctx.clearRect(0, 0, cw, ch);
      time++;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Draw connections
      connections.forEach((conn) => {
        if (!conn.active) return;
        const alpha = 0.08 + 0.04 * Math.sin(time * 0.01);
        ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.stroke();

        // Traveling particle
        conn.particlePos += conn.speed;
        if (conn.particlePos > 1) conn.particlePos = 0;

        const px = conn.from.x + (conn.to.x - conn.from.x) * conn.particlePos;
        const py = conn.from.y + (conn.to.y - conn.from.y) * conn.particlePos;

        const gradient = ctx.createRadialGradient(px, py, 0, px, py, 3);
        gradient.addColorStop(0, "rgba(0, 212, 255, 0.8)");
        gradient.addColorStop(1, "rgba(0, 212, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach((node) => {
        node.pulse += node.pulseSpeed;

        // Mouse influence
        const dx = mx - node.x / cw;
        const dy = my - node.y / ch;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist * 3);

        const baseRadius = 3 + influence * 2;
        const radius = baseRadius + Math.sin(node.pulse) * 1;

        // Glow
        const glowSize = radius * 4 + influence * 10;
        const glow = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, glowSize
        );

        const isOutput = node.layer === layers.length - 1;
        const color = isOutput ? "139, 92, 246" : "0, 212, 255";

        glow.addColorStop(0, `rgba(${color}, ${0.3 + influence * 0.3})`);
        glow.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(${color}, ${0.7 + influence * 0.3})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + influence * 0.3})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-40 pointer-events-auto"
    />
  );
}
