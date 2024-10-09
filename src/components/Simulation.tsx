import React, { useEffect, useRef, useState, useCallback } from 'react';
import { initSandSimulation, updateSandSimulation, SimulationState, addSandParticle } from '../utils/sandSimulation';
import ColorPicker from './ColorPicker';

const Simulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [simulation, setSimulation] = useState<SimulationState | null>(null);
  const [sandColor, setSandColor] = useState<string>('#FFD700');
  const [brushSize, setBrushSize] = useState<number>(10);
  const [gravity, setGravity] = useState<number>(1);
  const [fallSpeed, setFallSpeed] = useState<number>(1);
  const [fps, setFps] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const isMouseDownRef = useRef(false);
  const lastMousePositionRef = useRef({ x: 0, y: 0 });
  const fpsCounterRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());

  const updateCanvasSize = useCallback(() => {
    if (canvasRef.current && offscreenCanvasRef.current) {
      const canvas = canvasRef.current;
      const offscreenCanvas = offscreenCanvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      setSimulation(initSandSimulation(canvas));
    }
  }, []);

  useEffect(() => {
    offscreenCanvasRef.current = document.createElement('canvas');
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [updateCanvasSize]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    isMouseDownRef.current = true;
    handlePointerMove(event);
  }, []);

  const handlePointerUp = useCallback(() => {
    isMouseDownRef.current = false;
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    lastMousePositionRef.current = { x, y };
  }, []);

  useEffect(() => {
    if (!simulation || !canvasRef.current || !offscreenCanvasRef.current) return;

    const canvas = canvasRef.current;
    const offscreenCanvas = offscreenCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const offscreenCtx = offscreenCanvas.getContext('2d');
    if (!ctx || !offscreenCtx) return;

    const render = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTimeRef.current;
      lastFrameTimeRef.current = currentTime;

      // Update FPS calculation
      fpsCounterRef.current.push(deltaTime);
      if (fpsCounterRef.current.length > 60) {
        fpsCounterRef.current.shift();
      }
      const averageFrameTime = fpsCounterRef.current.reduce((a, b) => a + b, 0) / fpsCounterRef.current.length;
      const calculatedFps = Math.round(1000 / averageFrameTime);
      setFps(calculatedFps);

      let updatedSimulation = updateSandSimulation(simulation, offscreenCtx, gravity, fallSpeed);
      
      if (isMouseDownRef.current) {
        const { x, y } = lastMousePositionRef.current;
        const particlesToAdd = Math.ceil(brushSize * deltaTime / 16);
        for (let i = 0; i < particlesToAdd; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * brushSize / 2;
          const newX = x + Math.cos(angle) * radius;
          const newY = Math.max(0, y + Math.sin(angle) * radius);
          
          let colorIndex = updatedSimulation.colors.indexOf(sandColor);
          if (colorIndex === -1) {
            colorIndex = updatedSimulation.colors.length;
            updatedSimulation.colors.push(sandColor);
          }
          
          updatedSimulation = addSandParticle(updatedSimulation, newX, newY, colorIndex);
        }
      }

      setSimulation(updatedSimulation);

      // Copy from offscreen canvas to main canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offscreenCanvas, 0, 0);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [simulation, sandColor, brushSize, gravity, fallSpeed]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          touchAction: 'none'
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerUp}
      />
      <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <label htmlFor="colorPicker" style={{ marginRight: '10px', color: 'black' }}>Sand Color: </label>
          <ColorPicker color={sandColor} onChange={setSandColor} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="brushSize" style={{ color: 'black', marginRight: '10px' }}>Brush Size: {brushSize}</label>
          <input
            id="brushSize"
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            style={{ width: '150px' }}
          />
        </div>
        <div>
          <label htmlFor="gravity" style={{ color: 'black', marginRight: '10px' }}>Gravity: {gravity.toFixed(2)}</label>
          <input
            id="gravity"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={gravity}
            onChange={(e) => setGravity(Number(e.target.value))}
            style={{ width: '150px' }}
          />
        </div>
        <div>
          <label htmlFor="fallSpeed" style={{ color: 'black', marginRight: '10px' }}>Fall Speed: {fallSpeed.toFixed(2)}</label>
          <input
            id="fallSpeed"
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={fallSpeed}
            onChange={(e) => setFallSpeed(Number(e.target.value))}
            style={{ width: '150px' }}
          />
        </div>
      </div>
      <div style={{ position: 'absolute', top: 10, right: 10, color: 'black' }}>
        FPS: {fps}
      </div>
    </div>
  );
};

export default Simulation;