/**
 * Client-side pixelation utility using Canvas
 */

// A vibrant, high-contrast palette suitable for Perler Beads (拼豆)
const BEAD_PALETTE = [
  '#FFFFFF', '#D1D5DB', '#4B5563', '#1F2937', '#111827', // Grayscale
  '#EF4444', '#B91C1C', '#F87171', // Red
  '#F97316', '#C2410C', '#FB923C', // Orange
  '#FBBF24', '#D97706', '#FEF08A', // Yellow
  '#10B981', '#047857', '#34D399', // Green
  '#3B82F6', '#1D4ED8', '#60A5FA', // Blue
  '#8B5CF6', '#6D28D9', '#A78BFA', // Purple
  '#EC4899', '#BE185D', '#F472B6', // Pink
  '#78350F', '#451A03', '#A16207', // Brown
];

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// Find the closest color in the Perler Bead palette to keep pixel-art clean
function getClosestPaletteColor(r: number, g: number, b: number, a: number): string | null {
  // If highly transparent, treat as transparent null
  if (a < 128) return null;

  // If extremely bright/white
  if (r > 240 && g > 240 && b > 240) return '#FFFFFF';
  // If extremely dark/black
  if (r < 30 && g < 30 && b < 30) return '#1E1E2E';

  let minDistance = Infinity;
  let closestColor = BEAD_PALETTE[0];

  for (const hex of BEAD_PALETTE) {
    const rgb = hexToRgb(hex);
    // Euclidean distance in RGB space
    const d = Math.sqrt(
      Math.pow(rgb.r - r, 2) +
      Math.pow(rgb.g - g, 2) +
      Math.pow(rgb.b - b, 2)
    );
    if (d < minDistance) {
      minDistance = d;
      closestColor = hex;
    }
  }

  return closestColor;
}

export function pixelateImage(
  imageSrc: string,
  gridSize: number = 16
): Promise<(string | null)[][]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = gridSize;
        canvas.height = gridSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get 2D canvas context'));
          return;
        }

        // Use standard canvas scaling (which blends pixels nicely)
        ctx.drawImage(img, 0, 0, gridSize, gridSize);

        const imgData = ctx.getImageData(0, 0, gridSize, gridSize);
        const data = imgData.data;

        const grid: (string | null)[][] = [];

        for (let y = 0; y < gridSize; y++) {
          const row: (string | null)[] = [];
          for (let x = 0; x < gridSize; x++) {
            const idx = (y * gridSize + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            row.push(getClosestPaletteColor(r, g, b, a));
          }
          grid.push(row);
        }

        resolve(grid);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      reject(err);
    };

    img.src = imageSrc;
  });
}
