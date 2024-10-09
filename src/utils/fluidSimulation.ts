interface FluidState {
  width: number;
  height: number;
  density: number[];
  velocity: number[];
}

export const initFluidSimulation = (canvas: HTMLCanvasElement): FluidState => {
  const width = canvas.width;
  const height = canvas.height;
  
  const state: FluidState = {
    width,
    height,
    density: new Array(width * height).fill(0),
    velocity: new Array(width * height * 2).fill(0),
  };

  return state;
};

export const updateFluidSimulation = (state: FluidState, ctx: CanvasRenderingContext2D): FluidState => {
  const { width, height, density, velocity } = state;

  // Perform fluid simulation calculations
  // This is a placeholder for the actual simulation logic
  // You would need to implement the fluid dynamics equations here

  // Draw on canvas context
  ctx.clearRect(0, 0, width, height);
  
  // Example: Draw density as grayscale
  const imageData = ctx.createImageData(width, height);
  for (let i = 0; i < density.length; i++) {
    const value = Math.floor(density[i] * 255);
    imageData.data[i * 4] = value;
    imageData.data[i * 4 + 1] = value;
    imageData.data[i * 4 + 2] = value;
    imageData.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);

  // Return updated state
  return { ...state, density, velocity };
};
