import React, { useEffect, useRef, useState, useCallback } from 'react';
import { initSandSimulation, updateSandSimulation, SimulationState, addSandParticle } from '../utils/sandSimulation';
import ColorPicker from './ColorPicker';

const Simulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [simulation, setSimulation] = useState<SimulationState | null>(null);
  const [sandColor, setSandColor] = useState<string>('#FFD700'); // Default to gold
  const [brushSize, setBrushSize] = useState<number>(10); // Default brush size
  const animationFrameRef = useRef<number | null>(null);
  const isMouseDownRef = useRef(false);
  const lastMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setSimulation(initSandSimulation(canvas));

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    isMouseDownRef.current = true;
    handleMouseMove(event);
  }, []);

  const handleMouseUp = useCallback(() => {
    isMouseDownRef.current = false;
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    lastMousePositionRef.current = { x, y };
  }, []);

  useEffect(() => {
    if (!simulation || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      let updatedSimulation = updateSandSimulation(simulation, ctx);
      
      // Add sand particles continuously while mouse is down
      if (isMouseDownRef.current) {
        const { x, y } = lastMousePositionRef.current;
        const particlesToAdd = Math.ceil(brushSize * deltaTime / 16); // Adjust particle addition based on frame time
        for (let i = 0; i < particlesToAdd; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * brushSize / 2;
          const newX = x + Math.cos(angle) * radius;
          const newY = Math.max(0, y + Math.sin(angle) * radius - 5);
          
          let colorIndex = updatedSimulation.colors.indexOf(sandColor);
          if (colorIndex === -1) {
            colorIndex = updatedSimulation.colors.length;
            updatedSimulation.colors.push(sandColor);
          }
          
          updatedSimulation = addSandParticle(updatedSimulation, newX, newY, colorIndex);
        }
      }

      setSimulation(updatedSimulation);
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [simulation, sandColor, brushSize]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      />
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
        <label htmlFor="colorPicker" style={{ marginRight: '10px' }}>Sand Color: </label>
        <ColorPicker color={sandColor} onChange={setSandColor} />
      </div>
      <div style={{ marginTop: '10px' }}>
        <label htmlFor="brushSize">Brush Size: {brushSize}</label>
        <input
          id="brushSize"
          type="range"
          min="1"
          max="50"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          style={{ width: '200px', marginLeft: '10px' }}
        />
      </div>
    </div>
  );
};

export default Simulation;
