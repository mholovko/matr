import * as THREE from 'three';


interface TextureSet {
    map: THREE.Texture;
    roughnessMap?: THREE.Texture;
    bumpMap?: THREE.Texture;
    normalMap?: THREE.Texture;
}

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
 * Generates a technical drawing of Stretcher Bond brickwork.
 * Matches the layout of the provided photo but in a CAD style.
 * SEAMLESS FIX: Uses integer column counts to ensure perfect tiling.
 */
export function generateReclaimedBrickTextures(): TextureSet {
    const { canvas, ctx, size } = createCanvas(1024);

    // --- CONFIGURATION ---

    // 1. Grid Definition (CRITICAL FOR SEAMLESS TILING)
    // To be seamless, the brick width must divide the canvas size exactly.
    // 1024 / 4 = 256px width. 1024 / 12 = 85.3px height. Ratio ~3:1 (Standard Brick)
    const rows = 12;
    const cols = 4;

    const brickHeight = size / rows;
    const brickWidth = size / cols;

    // 2. Appearance
    const mortarGap = brickHeight * 0.12; // Gap size

    // Colors from your snippet (Matches uploaded image)
    const bgColor = '#704f38';      // Darker Brown (Mortar/Background)
    const brickOutline = '#402a1a'; // Deep Brown (Stroke)
    const hatchColor = '#79604b';   // Lighter Brown (Brick Fill)
    const hatchLineColor = '#5b4133'; // Medium Brown (Diagonal lines)

    // 3. Fill Background (Mortar)
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // 4. Draw Bricks
    // We loop from -1 to cols + 1 to handle the offset rows gracefully at edges
    for (let row = 0; row < rows; row++) {
        const y = row * brickHeight;

        // Stagger: odd rows shift left by half a brick
        const isOffset = row % 2 !== 0;
        const rowOffset = isOffset ? -(brickWidth / 2) : 0;

        for (let col = -1; col <= cols; col++) {
            const x = (col * brickWidth) + rowOffset;

            // Math for the inner brick (Brick Size - Mortar Gap)
            const bX = x + (mortarGap / 2);
            const bY = y + (mortarGap / 2);
            const bW = brickWidth - mortarGap;
            const bH = brickHeight - mortarGap;

            // Optimization: Don't draw if completely off-screen
            if (bX > size || bX + bW < 0) continue;

            // --- A. SOLID FILL ---
            ctx.fillStyle = hatchColor;
            ctx.fillRect(bX, bY, bW, bH);

            // --- B. HATCHING ---
            // We clip to the brick rectangle so lines don't spill into mortar
            ctx.save();
            ctx.beginPath();
            ctx.rect(bX, bY, bW, bH);
            ctx.clip();

            ctx.strokeStyle = hatchLineColor;
            ctx.lineWidth = 2; // Line thickness

            // Draw diagonal lines
            // We draw a bit extra to cover the corners
            const hatchSpacing = 16;
            for (let h = -bW; h < bW + bH; h += hatchSpacing) {
                ctx.beginPath();
                // 45 degree angle: x moves same amount as y
                ctx.moveTo(bX + h, bY + bH);
                ctx.lineTo(bX + h + bH, bY);
                ctx.stroke();
            }
            ctx.restore();

            // --- C. OUTLINE ---
            ctx.strokeStyle = brickOutline;
            ctx.lineWidth = 3;
            ctx.strokeRect(bX, bY, bW, bH);
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;

    // 12 rows corresponds to roughly 1 meter in height for standard bricks
    texture.repeat.set(1, 1);

    // Important: SRGB Encoding usually looks better for colors

    return { map: texture };
}

export function generatePineFloorTexture(): THREE.Texture {
    const { canvas, ctx, size } = createCanvas(512);
    ctx.fillStyle = '#fdf6e3';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = '#d2b48c';
    ctx.lineWidth = 4;
    const planks = 8;
    const step = size / planks;
    ctx.beginPath();
    for (let i = 0; i <= size; i += step) {
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
    }
    ctx.stroke();
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.rotation = Math.PI / 2;
    return texture;
}

/**
 * Generates "Red Rubber" Brick Texture (Flemish Bond).
 * Pattern: Stretcher (Brick) + Header (Half Brick).
 * Offset: 50% of the total unit width.
 */
export function generateRedRubberBrickTextures(): THREE.Texture {
    const { canvas, ctx, size } = createCanvas(1024);

    // --- CONFIGURATION ---

    // 1. Grid Definition
    // We define a "Pair" as 1 Stretcher + 1 Header.
    // To be seamless, the Pair Width must divide the canvas exactly.
    const rows = 14; // Slightly tighter rows for "gauged" brickwork
    const cols = 4;  // 4 Pairs of (Stretcher+Header) across

    const rowHeight = size / rows;
    const pairWidth = size / cols; // The width of (Brick + Half Brick)

    // Ratios: Stretcher is ~2/3 of the pair, Header is ~1/3
    const stretcherWidth = pairWidth * (2 / 3);
    const headerWidth = pairWidth * (1 / 3);

    // 2. Appearance (Red Rubber Style)
    // Red Rubbers have very fine joints (putty joints)
    const mortarGap = rowHeight * 0.05;

    // Colors: Bright Orange-Red, smooth finish
    const bgColor = '#e0e0e0';      // Pale Grey/White (Fine Lime Putty)
    const brickOutline = '#8b2e18'; // Deep Red outline
    const hatchColor = '#dea589';   // "Rubber" Red (Warm Orange-Red)
    const hatchLineColor = '#b74b20ff';

    // 3. Fill Background (Mortar)
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // 4. Draw Loops
    for (let row = 0; row < rows; row++) {
        const y = row * rowHeight;

        // OFFSET LOGIC:
        // "row offset exact 0.5 of brick+halfbrick"
        // Even rows: 0 offset. Odd rows: 50% of pairWidth.
        const rowOffset = (row % 2 !== 0) ? -(pairWidth * 0.5) : 0;

        // Loop -1 to cols to handle wrapping at the edges
        for (let col = -1; col <= cols; col++) {
            // The starting X of this (Stretcher + Header) pair
            const groupX = (col * pairWidth) + rowOffset;

            // --- DRAW STRETCHER (The full brick) ---
            drawBrick(
                ctx,
                groupX, y,
                stretcherWidth, rowHeight,
                mortarGap, hatchColor, hatchLineColor, brickOutline,
                size // canvas size for bounds check
            );

            // --- DRAW HEADER (The half brick) ---
            // Placed immediately after the stretcher
            drawBrick(
                ctx,
                groupX + stretcherWidth, y,
                headerWidth, rowHeight,
                mortarGap, hatchColor, hatchLineColor, brickOutline,
                size
            );
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.repeat.set(1, 1);
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

/** * Helper to draw a single brick with hatch and outline 
 */
function drawBrick(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    gap: number, fill: string, line: string, outline: string, size: number
) {
    const bX = x + (gap / 2);
    const bY = y + (gap / 2);
    const bW = w - gap;
    const bH = h - gap;

    // Optimization: Skip if off-screen
    if (bX > size || bX + bW < 0) return;

    // 1. Solid Fill
    ctx.fillStyle = fill;
    ctx.fillRect(bX, bY, bW, bH);

    // 2. Hatch (Subtle for Red Rubber)
    ctx.save();
    ctx.beginPath();
    ctx.rect(bX, bY, bW, bH);
    ctx.clip();

    ctx.strokeStyle = line;
    ctx.lineWidth = 1.5; // Thinner lines for smoother brick

    const hatchSpacing = 12;
    for (let i = -bW; i < bW + bH; i += hatchSpacing) {
        ctx.beginPath();
        ctx.moveTo(bX + i, bY + bH);
        ctx.lineTo(bX + i + bH, bY);
        ctx.stroke();
    }
    ctx.restore();

    // 3. Outline
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2;
    ctx.strokeRect(bX, bY, bW, bH);
}