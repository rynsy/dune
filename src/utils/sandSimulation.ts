const CELL_SIZE = 2;

export interface SimulationState {
  grid: Uint8Array;
  width: number;
  height: number;
  colors: string[];
}

export const initSandSimulation = (canvas: HTMLCanvasElement): SimulationState => {
  const width = Math.floor(canvas.width / CELL_SIZE);
  const height = Math.floor(canvas.height / CELL_SIZE);
  return {
    grid: new Uint8Array(width * height),
    width,
    height,
    colors: ['#FFD700'] // Default color
  };
};

export const addSandParticle = (state: SimulationState, x: number, y: number, colorIndex: number): SimulationState => {
  const gridX = Math.floor(x / CELL_SIZE);
  const gridY = Math.floor(y / CELL_SIZE);
  if (gridX >= 0 && gridX < state.width && gridY >= 0 && gridY < state.height) {
    state.grid[gridY * state.width + gridX] = colorIndex + 1;
  }
  return state;
};

export const updateSandSimulation = (state: SimulationState, ctx: CanvasRenderingContext2D): SimulationState => {
  const { grid, width, height, colors } = state;
  const newGrid = new Uint8Array(grid);

  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (grid[i] !== 0) {
        if (y + 1 < height) {
          if (grid[(y + 1) * width + x] === 0) {
            newGrid[(y + 1) * width + x] = grid[i];
            newGrid[i] = 0;
          } else if (x > 0 && grid[(y + 1) * width + (x - 1)] === 0) {
            newGrid[(y + 1) * width + (x - 1)] = grid[i];
            newGrid[i] = 0;
          } else if (x < width - 1 && grid[(y + 1) * width + (x + 1)] === 0) {
            newGrid[(y + 1) * width + (x + 1)] = grid[i];
            newGrid[i] = 0;
          }
        }
      }
    }
  }

  // Render the grid
  const imageData = ctx.createImageData(width * CELL_SIZE, height * CELL_SIZE);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const colorIndex = newGrid[y * width + x];
      if (colorIndex !== 0) {
        const color = colors[colorIndex - 1];
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        for (let dy = 0; dy < CELL_SIZE; dy++) {
          for (let dx = 0; dx < CELL_SIZE; dx++) {
            const i = ((y * CELL_SIZE + dy) * width * CELL_SIZE + (x * CELL_SIZE + dx)) * 4;
            imageData.data[i] = r;
            imageData.data[i + 1] = g;
            imageData.data[i + 2] = b;
            imageData.data[i + 3] = 255;
          }
        }
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // Draw FPS
  const fps = Math.round(1000 / 16); // Assuming 60 FPS
  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.fillText(`FPS: ${fps}`, width * CELL_SIZE - 60, 20);

  return { ...state, grid: newGrid };
};
