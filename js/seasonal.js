/* ==========================================================================
       SEASON CONTROLLER
       To switch seasons, simply change ACTIVE_SEASON below:
       'SPRING' | 'SUMMER' | 'FALL' | 'WINTER' | 'RAIN'
       ========================================================================== */
    const ACTIVE_SEASON = 'FALL';

    const fxCanvas = document.getElementById('fxCanvas');
    const fxCtx = fxCanvas.getContext('2d');
    const seasonBtn = document.getElementById('seasonToggleBtn');

    function resizeFxCanvas() {
        if (!fxCanvas) return;
        fxCanvas.width = window.innerWidth;
        fxCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeFxCanvas);
    resizeFxCanvas();

    function toggleActiveSeason() {
        switch (ACTIVE_SEASON) {
            case 'SPRING': toggleBlossoms(); break;
            case 'SUMMER': toggleSummer(); break;
            case 'FALL':   toggleFallLeaves(); break;
            case 'WINTER': toggleSnow(); break;
            case 'RAIN':   cycleRainIntensity(); break;
        }
    }

    /* ==========================================================================
       SEASON 3: FALL / AUTUMN LEAVES SIMULATION (ACTIVE)
       Features:
       - 4 Leaf Types: Maple, Oak, Birch, Willow
       - Rich Palette: Scarlet, Amber, Ochre, Golden Harvest, Russet
       - Aerodynamics: Sinusoidal horizontal sway + 3D tumbling (pitch/roll) + wind gusts
       ========================================================================== */
    let isFallRunning = false;
    let fallAnimationId = null;
    let leaves = [];
    let leafWind = 0;
    let targetLeafWind = 0;
    let leafGustTimer = null;

    const FALL_PALETTE = [
        '#922B21', // Deep Crimson
        '#B03A2E', // Scarlet Red
        '#C0392B', // Maple Vermilion
        '#D35400', // Burnt Amber
        '#E67E22', // Autumn Orange
        '#F39C12', // Golden Harvest
        '#B7950B', // Rich Ochre
        '#7E5109'  // Rust Brown
    ];

    const LEAF_SHAPES = ['maple', 'oak', 'birch', 'willow'];

    class FallLeaf {
        constructor(isInitial = false) {
            this.reset(isInitial);
        }

        reset(isInitial = false) {
            this.shape = LEAF_SHAPES[Math.floor(Math.random() * LEAF_SHAPES.length)];
            this.color = FALL_PALETTE[Math.floor(Math.random() * FALL_PALETTE.length)];

            // Depth perception (0.4 = far background, 1.0 = foreground)
            this.depth = Math.random() * 0.6 + 0.4;
            this.size = (Math.random() * 11 + 14) * this.depth;

            this.x = Math.random() * (fxCanvas.width + 400) - 200;
            this.y = isInitial ? Math.random() * fxCanvas.height : -Math.random() * 100 - 30;

            // Realistic terminal velocity: ~1.0 to 2.2 px/frame
            this.vy = (Math.random() * 0.9 + 1.1) * this.depth;

            // Horizontal sway
            this.swaySpeed = Math.random() * 0.025 + 0.015;
            this.swayPhase = Math.random() * Math.PI * 2;
            this.swayAmp = Math.random() * 1.8 + 1.0;

            // 3D rotation & flutter
            this.angle = Math.random() * Math.PI * 2;
            this.angularSpeed = (Math.random() - 0.5) * 0.028;
            this.flipAngle = Math.random() * Math.PI * 2;
            this.flipSpeed = Math.random() * 0.035 + 0.018;

            this.alpha = this.depth * 0.35 + 0.65;
        }

        update() {
            this.swayPhase += this.swaySpeed;
            this.angle += this.angularSpeed;
            this.flipAngle += this.flipSpeed;

            // Aerodynamic drift: horizontal sway + wind gust
            const sway = Math.sin(this.swayPhase) * this.swayAmp;
            this.x += sway + (leafWind * this.depth);
            this.y += this.vy;

            // Reset when reaching bottom or out of bounds
            if (this.y > fxCanvas.height + 60 || this.x < -250 || this.x > fxCanvas.width + 250) {
                this.reset(false);
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            // 3D roll/flip compression
            const cosRoll = Math.cos(this.flipAngle);
            ctx.scale(1, Math.max(0.12, Math.abs(cosRoll)));

            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.strokeStyle = 'rgba(0,0,0,0.18)';
            ctx.lineWidth = 0.7;

            ctx.beginPath();
            const s = this.size;

            if (this.shape === 'maple') {
                // 5-lobed maple leaf
                ctx.moveTo(0, -s);
                ctx.bezierCurveTo(s * 0.25, -s * 0.6, s * 0.8, -s * 0.6, s * 0.8, -s * 0.3);
                ctx.bezierCurveTo(s * 0.5, -s * 0.1, s * 0.9, s * 0.2, s * 0.6, s * 0.5);
                ctx.bezierCurveTo(s * 0.3, s * 0.4, s * 0.1, s * 0.8, 0, s);
                ctx.bezierCurveTo(-s * 0.1, s * 0.8, -s * 0.3, s * 0.4, -s * 0.6, s * 0.5);
                ctx.bezierCurveTo(-s * 0.9, s * 0.2, -s * 0.5, -s * 0.1, -s * 0.8, -s * 0.3);
                ctx.bezierCurveTo(-s * 0.8, -s * 0.6, -s * 0.25, -s * 0.6, 0, -s);
            } else if (this.shape === 'oak') {
                // Lobed oak leaf
                ctx.moveTo(0, -s);
                ctx.bezierCurveTo(s * 0.4, -s * 0.8, s * 0.5, -s * 0.5, s * 0.2, -s * 0.3);
                ctx.bezierCurveTo(s * 0.6, -s * 0.2, s * 0.6, s * 0.2, s * 0.2, s * 0.4);
                ctx.bezierCurveTo(s * 0.4, s * 0.6, s * 0.2, s * 0.9, 0, s);
                ctx.bezierCurveTo(-s * 0.2, s * 0.9, -s * 0.4, s * 0.6, -s * 0.2, s * 0.4);
                ctx.bezierCurveTo(-s * 0.6, s * 0.2, -s * 0.6, -s * 0.2, -s * 0.2, -s * 0.3);
                ctx.bezierCurveTo(-s * 0.5, -s * 0.5, -s * 0.4, -s * 0.8, 0, -s);
            } else if (this.shape === 'birch') {
                // Teardrop birch leaf
                ctx.moveTo(0, -s);
                ctx.quadraticCurveTo(s * 0.7, -s * 0.3, s * 0.5, s * 0.4);
                ctx.quadraticCurveTo(s * 0.2, s * 0.8, 0, s);
                ctx.quadraticCurveTo(-s * 0.2, s * 0.8, -s * 0.5, s * 0.4);
                ctx.quadraticCurveTo(-s * 0.7, -s * 0.3, 0, -s);
            } else {
                // Slender willow leaf
                ctx.moveTo(0, -s * 1.25);
                ctx.quadraticCurveTo(s * 0.35, 0, 0, s * 1.25);
                ctx.quadraticCurveTo(-s * 0.35, 0, 0, -s * 1.25);
            }

            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Central vein highlight
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.moveTo(0, -s * 0.75);
            ctx.lineTo(0, s * 0.75);
            ctx.stroke();

            ctx.restore();
        }
    }

    function scheduleLeafGust() {
        if (!isFallRunning) return;
        const wait = Math.random() * 4500 + 3500;
        leafGustTimer = setTimeout(() => {
            if (!isFallRunning) return;
            targetLeafWind = (Math.random() - 0.45) * 2.5;
            scheduleLeafGust();
        }, wait);
    }

    function updateAndRenderLeaves() {
        if (!isFallRunning) return;
        fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

        leafWind += (targetLeafWind - leafWind) * 0.02;

        for (let i = 0; i < leaves.length; i++) {
            leaves[i].update();
            leaves[i].draw(fxCtx);
        }

        fallAnimationId = requestAnimationFrame(updateAndRenderLeaves);
    }

    function toggleFallLeaves() {
        isFallRunning = !isFallRunning;
        if (isFallRunning) {
            seasonBtn.classList.add('fall-active');
            seasonBtn.innerHTML = '<span>🍂</span> Pause Fall';
            fxCanvas.style.display = 'block';

            const COUNT = 35; // Readable and pleasant without clutter
            leaves = [];
            for (let i = 0; i < COUNT; i++) {
                leaves.push(new FallLeaf(true));
            }

            leafWind = 0;
            targetLeafWind = 0.6;
            scheduleLeafGust();
            fallAnimationId = requestAnimationFrame(updateAndRenderLeaves);
        } else {
            seasonBtn.classList.remove('fall-active');
            seasonBtn.innerHTML = '<span>🍁</span> Fall Foliage';
            fxCanvas.style.display = 'none';

            if (fallAnimationId) {
                cancelAnimationFrame(fallAnimationId);
                fallAnimationId = null;
            }
            clearTimeout(leafGustTimer);
            leaves = [];
            fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
        }
    }

    /* ==========================================================================
       DIMMED SEASONS (Ordered: Spring -> Summer -> Winter -> Rain)
       All preserved and ready to plug in when ACTIVE_SEASON is changed.
       ========================================================================== */

    /* --- SEASON 1: SPRING BLOSSOMS (DIMMED) --- */
    function toggleBlossoms() {
        console.log("Spring blossoms mode is currently dimmed.");
    }

    /* --- SEASON 2: SUMMER VIBES (DIMMED) --- */
    function toggleSummer() {
        console.log("Summer vibes mode is currently dimmed.");
    }

    /* --- SEASON 4: WINTER SNOW (DIMMED) --- */
    function toggleSnow() {
        console.log("Winter snow mode is currently dimmed.");
    }

    /* --- BONUS: RAIN MODE (DIMMED / PRESERVED) --- */
    const RAIN_REGIMES = [
        { label: 'Rain Mode', count: 0, icon: '🌧️' },
        { label: 'Light Drizzle', count: 45, vMin: 6, vMax: 11, lMin: 6, lMax: 12, wMin: 0.4, wMax: 0.8, icon: '🌦️', windScale: 2.2 },
        { label: 'Fast Drizzle', count: 110, vMin: 12, vMax: 18, lMin: 12, lMax: 22, wMin: 0.5, wMax: 1.0, icon: '🌧️', windScale: 3.5 },
        { label: 'Rain', count: 220, vMin: 17, vMax: 26, lMin: 20, lMax: 36, wMin: 0.6, wMax: 1.3, icon: '🌧️', windScale: 5.0 },
        { label: 'Downpour', count: 420, vMin: 25, vMax: 38, lMin: 32, lMax: 54, wMin: 0.8, wMax: 1.7, icon: '⛈️', windScale: 7.5 }
    ];
    let currentRainIndex = 0;
    function cycleRainIntensity() {
        console.log("Rain mode is currently dimmed. Set ACTIVE_SEASON = 'RAIN' to re-enable.");
    }
