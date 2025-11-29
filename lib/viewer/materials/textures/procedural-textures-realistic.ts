import * as THREE from 'three';

/**
 * Helper to create a base canvas
 */
function createCanvas(size: number = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    return { canvas, ctx, size };
}

/**
 * Helper to create a noise texture for grain/grunge
 */
function createNoiseCanvas(size: number, opacity: number = 0.2) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;     // R
        data[i + 1] = val; // G
        data[i + 2] = val; // B
        data[i + 3] = opacity * 255; // Alpha
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/**
 * Helper to vary a color slightly
 */
function randomizeColor(hex: string, variance: number): string {
    const c = new THREE.Color(hex);
    // Shift HSL
    const h = c.getHSL({ h: 0, s: 0, l: 0 });

    // Randomize Lightness significantly, Hue slightly
    h.l += (Math.random() - 0.5) * variance;
    h.h += (Math.random() - 0.5) * (variance * 0.2);

    // Clamp
    h.l = Math.max(0, Math.min(1, h.l));

    c.setHSL(h.h, h.s, h.l);
    return '#' + c.getHexString();
}

interface TextureSet {
    map: THREE.Texture;
    roughnessMap: THREE.Texture;
    bumpMap: THREE.Texture;
    normalMap: THREE.Texture;
}

interface BrickPalette {
    bg: string;       // Mortar
    fill: string;     // Brick Face
    line: string;     // Hatch Lines (Unused in realistic mode, kept for compat)
    outline: string;  // Brick Outline (Used for subtle edging)
}

function drawBeveledBrickNormals(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number
) {
    const bevelSize = 4; // Width of the bevel in pixels
    const flatNormal = 'rgb(128, 128, 255)';

    // 1. Fill Face (Flat)
    ctx.fillStyle = flatNormal;
    ctx.fillRect(x, y, w, h);

    // 2. Draw Bevels (Trapezoids)

    // Top Edge (Y+) -> Green High (128, 255, 255)
    ctx.fillStyle = 'rgb(128, 255, 255)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w - bevelSize, y + bevelSize);
    ctx.lineTo(x + bevelSize, y + bevelSize);
    ctx.fill();

    // Bottom Edge (Y-) -> Green Low (128, 0, 255)
    ctx.fillStyle = 'rgb(128, 0, 255)';
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w - bevelSize, y + h - bevelSize);
    ctx.lineTo(x + bevelSize, y + h - bevelSize);
    ctx.fill();

    // Right Edge (X+) -> Red High (255, 128, 255)
    ctx.fillStyle = 'rgb(255, 128, 255)';
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w - bevelSize, y + h - bevelSize);
    ctx.lineTo(x + w - bevelSize, y + bevelSize);
    ctx.fill();

    // Left Edge (X-) -> Red Low (0, 128, 255)
    ctx.fillStyle = 'rgb(0, 128, 255)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x + bevelSize, y + h - bevelSize);
    ctx.lineTo(x + bevelSize, y + bevelSize);
    ctx.fill();
}

export function generateRedRubberBrickTextures(): TextureSet {
    const size = 1024;
    const rows = 14;
    const cols = 4;
    const rowHeight = size / rows;
    const pairWidth = size / cols;
    const mortarGap = rowHeight * 0.05;

    // 1. Albedo
    const albedoPalette: BrickPalette = {
        bg: '#e0e0e0',      // Pale Grey (Putty)
        fill: '#dea589',    // Rubber Red
        line: '#b74b20ff',  // Unused
        outline: '#8b2e18'  // Deep Red Outline
    };

    // 2. Roughness
    const roughnessPalette: BrickPalette = {
        bg: '#FFFFFF',      // Mortar Rough
        fill: '#303030',    // Brick Smooth (Rubber is smooth)
        line: '#404040',
        outline: '#505050'
    };

    // 3. Bump
    const bumpPalette: BrickPalette = {
        bg: '#101010',      // Mortar Recessed
        fill: '#FFFFFF',    // Brick High
        line: '#EEEEEE',
        outline: '#DDDDDD'
    };

    // Red Rubber: Low variance (0.1), Fine Noise (0.1)
    const map = generateRedRubberLayer(size, rows, cols, mortarGap, albedoPalette, true, 0.1, 0.1);
    const roughnessMap = generateRedRubberLayer(size, rows, cols, mortarGap, roughnessPalette, false, 0.05, 0.15);
    const bumpMap = generateRedRubberLayer(size, rows, cols, mortarGap, bumpPalette, false, 0.0, 0.05);
    const normalMap = generateRedRubberNormalLayer(size, rows, cols, mortarGap);

    return { map, roughnessMap, bumpMap, normalMap };
}

function generateRedRubberLayer(
    size: number, rows: number, cols: number, mortarGap: number,
    palette: BrickPalette, useColorSpace: boolean,
    variance: number = 0.0, noiseOpacity: number = 0.0
): THREE.Texture {
    const { canvas, ctx } = createCanvas(size);
    const rowHeight = size / rows;
    const pairWidth = size / cols;
    const stretcherWidth = pairWidth * (2 / 3);
    const headerWidth = pairWidth * (1 / 3);

    // Fill Background
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, size, size);

    for (let row = 0; row < rows; row++) {
        const y = row * rowHeight;
        const rowOffset = (row % 2 !== 0) ? -(pairWidth * 0.5) : 0;

        for (let col = -1; col <= cols; col++) {
            const groupX = (col * pairWidth) + rowOffset;

            // Stretcher
            drawBrick(ctx, groupX, y, stretcherWidth, rowHeight, mortarGap, palette, size, variance);
            // Header
            drawBrick(ctx, groupX + stretcherWidth, y, headerWidth, rowHeight, mortarGap, palette, size, variance);
        }
    }

    // Apply Noise
    if (noiseOpacity > 0) {
        const noise = createNoiseCanvas(size, noiseOpacity);
        ctx.globalCompositeOperation = 'overlay';
        ctx.drawImage(noise, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.repeat.set(1, 1);
    if (useColorSpace) {
        texture.colorSpace = THREE.SRGBColorSpace;
    }

    return texture;
}

function generateRedRubberNormalLayer(
    size: number, rows: number, cols: number, mortarGap: number
): THREE.Texture {
    const { canvas, ctx } = createCanvas(size);
    const rowHeight = size / rows;
    const pairWidth = size / cols;
    const stretcherWidth = pairWidth * (2 / 3);
    const headerWidth = pairWidth * (1 / 3);

    // Base Normal
    ctx.fillStyle = 'rgb(128, 128, 255)';
    ctx.fillRect(0, 0, size, size);

    for (let row = 0; row < rows; row++) {
        const y = row * rowHeight;
        const rowOffset = (row % 2 !== 0) ? -(pairWidth * 0.5) : 0;

        for (let col = -1; col <= cols; col++) {
            const groupX = (col * pairWidth) + rowOffset;

            // Stretcher
            drawBeveledBrickNormals(
                ctx,
                groupX + (mortarGap / 2), y + (mortarGap / 2),
                stretcherWidth - mortarGap, rowHeight - mortarGap
            );

            // Header
            drawBeveledBrickNormals(
                ctx,
                groupX + stretcherWidth + (mortarGap / 2), y + (mortarGap / 2),
                headerWidth - mortarGap, rowHeight - mortarGap
            );
        }
    }

    // Noise on Normal Map
    const noise = createNoiseCanvas(size, 0.05);
    ctx.globalCompositeOperation = 'overlay';
    ctx.drawImage(noise, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.repeat.set(1, 1);
    texture.colorSpace = THREE.NoColorSpace;

    return texture;
}

function drawBrick(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    gap: number, palette: BrickPalette, size: number,
    variance: number = 0.0
) {
    const bX = x + (gap / 2);
    const bY = y + (gap / 2);
    const bW = w - gap;
    const bH = h - gap;

    if (bX > size || bX + bW < 0) return;

    // Solid Fill with Variance
    const fillColor = variance > 0 ? randomizeColor(palette.fill, variance) : palette.fill;
    ctx.fillStyle = fillColor;
    ctx.fillRect(bX, bY, bW, bH);

    // No Hatching

    // Outline
    if (palette.outline !== palette.fill) {
        ctx.strokeStyle = palette.outline;
        ctx.lineWidth = 2;
        ctx.strokeRect(bX, bY, bW, bH);
    }
}