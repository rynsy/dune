const CELL_SIZE = 1; // Change this from 2 to 1

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

export const updateSandSimulation = (state: SimulationState, ctx: CanvasRenderingContext2D, gravity: number, fallSpeed: number): SimulationState => {
  const { grid, width, height, colors } = state;
  const newGrid = new Uint8Array(grid.length);

  const maxFallDistance = Math.ceil(fallSpeed);

  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const cell = grid[i];

      if (cell === 0) continue; // Empty cell

      let newY = y;
      let moved = false;

      for (let fall = 0; fall < maxFallDistance && newY < height - 1; fall++) {
        const below = (newY + 1) * width + x;
        const belowLeft = (newY + 1) * width + (x - 1);
        const belowRight = (newY + 1) * width + (x + 1);

        if (Math.random() < gravity) {
          if (newGrid[below] === 0 && grid[below] === 0) {
            newY++;
            moved = true;
          } else if (x > 0 && newGrid[belowLeft] === 0 && grid[belowLeft] === 0) {
            newY++;
            x--;
            moved = true;
          } else if (x < width - 1 && newGrid[belowRight] === 0 && grid[belowRight] === 0) {
            newY++;
            x++;
            moved = true;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      const newIndex = newY * width + x;
      newGrid[newIndex] = cell;
    }
  }

  // Draw the updated grid
  const imageData = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < newGrid.length; i++) {
    const cell = newGrid[i];
    if (cell !== 0) {
      const color = colors[cell - 1];
      const [r, g, b] = hexToRgb(color);
      const index = i * 4;
      imageData.data[index] = r;
      imageData.data[index + 1] = g;
      imageData.data[index + 2] = b;
      imageData.data[index + 3] = 255;
    } else {
      const index = i * 4;
      imageData.data[index + 3] = 0; // Set alpha to 0 for empty cells
    }
  }
  ctx.putImageData(imageData, 0, 0);

  return { ...state, grid: newGrid };
};

// Helper function to convert hex color to RGB
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [0, 0, 0];
};
