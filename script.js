// DOM elements
const loadingScreen = document.getElementById('loadingScreen');
const loadingMessage = document.getElementById('loadingMessage');
const loadingSubMessage = document.getElementById('loadingSubMessage');
const webcamElement = document.getElementById('webcam');
const outputCanvas = document.getElementById('output');
const waveformCanvas = document.getElementById('waveform');
const startButton = document.getElementById('startButton');
const gridSvg = document.getElementById('gridSvg');
const handDataText = document.getElementById('handDataText');
const handDataPanel = document.getElementById('handData');
const showLandmarks = document.getElementById('showLandmarks');
const showConnectors = document.getElementById('showConnectors');
const showCoordinates = document.getElementById('showCoordinates');
const showAura = document.getElementById('showAura');
const filterResults = document.getElementById('filterResults');
const smoothingRange = document.getElementById('smoothingRange');
const toggleDebugPanel = document.getElementById('toggleDebugPanel');
const pitchZone = document.getElementById('pitchZone');
const volumeZone = document.getElementById('volumeZone');
const thereminReadings = document.getElementById('thereminReadings');
const currentNote = document.getElementById('currentNote');
const frequencyValue = document.getElementById('frequencyValue');
const volumeValue = document.getElementById('volumeValue');
const rotationValue = document.getElementById('rotationValue');
const coordinateContainer = document.getElementById('coordinates');
const waveformSelect = document.getElementById('waveformSelect');
const reverbRange = document.getElementById('reverbRange');
const filterRange = document.getElementById('filterRange');
const noteDisplay = document.getElementById('noteDisplay');
const frequencyDisplay = document.getElementById('frequencyDisplay');
const volumeDisplay = document.getElementById('volumeDisplay');
const handModeSelect = document.getElementById('handModeSelect');

// Canvas context
const canvasCtx = outputCanvas.getContext('2d');
let waveformContext;

// Tracking variables
let hands;
let camera;
let tracking = false;
let debugPanelVisible = false;
let handLandmarks = {
    left: [],
    right: []
};
let filteredLandmarks = {
    left: [],
    right: []
};
let smoothingFactor = 0.5;
let previousPalmRotation = {
    left: 0,
    right: 0
};
let rotationSmoothing = {
    left: [],
    right: []
};
let maxRotationSamples = 5;
let coordinateDisplays = [];
let handAuras = {
    left: null,
    right: null
};
let lastFrameTime = 0;
let frameCount = 0;
let fpsInterval = 0;
let fps = 0;

// Theremin variables
const notes = [
    { name: 'C2', freq: 65.41 },
    { name: 'D2', freq: 73.42 },
    { name: 'E2', freq: 82.41 },
    { name: 'F2', freq: 87.31 },
    { name: 'G2', freq: 98.00 },
    { name: 'A2', freq: 110.00 },
    { name: 'B2', freq: 123.47 },
    { name: 'C3', freq: 130.81 },
    { name: 'D3', freq: 146.83 },
    { name: 'E3', freq: 164.81 },
    { name: 'F3', freq: 174.61 },
    { name: 'G3', freq: 196.00 },
    { name: 'A3', freq: 220.00 },
    { name: 'B3', freq: 246.94 },
    { name: 'C4', freq: 261.63 },
    { name: 'D4', freq: 293.66 },
    { name: 'E4', freq: 329.63 },
    { name: 'F4', freq: 349.23 },
    { name: 'G4', freq: 392.00 },
    { name: 'A4', freq: 440.00 },
    { name: 'B4', freq: 493.88 },
    { name: 'C5', freq: 523.25 },
    { name: 'D5', freq: 587.33 },
    { name: 'E5', freq: 659.25 },
    { name: 'F5', freq: 698.46 },
    { name: 'G5', freq: 783.99 },
    { name: 'A5', freq: 880.00 },
    { name: 'B5', freq: 987.77 },
    { name: 'C6', freq: 1046.50 }
];
let thereminValues = {
    left: {
        frequency: 0,
        volume: 0,
        rotation: 0
    },
    right: {
        frequency: 0,
        volume: 0,
        rotation: 0
    }
};

// Audio variables
let synth = null;
let audioInitialized = false;
let animationFrameId = null;
let analyser = null;
let dataArray = null;

// Hand mode configuration
let handMode = 'dual'; // 'dual', 'left-only', 'right-only'

// Hand roles - which hand controls what
const HAND_ROLES = {
    LEFT_HAND: 'pitch',   // Left hand controls pitch
    RIGHT_HAND: 'volume'  // Right hand controls volume
};

// MediaPipe Hand landmark indices
const WRIST = 0;
const THUMB_CMC = 1;  // Thumb metacarpal
const THUMB_MCP = 2;  // Thumb metacarpophalangeal joint
const THUMB_IP = 3;   // Thumb interphalangeal joint
const THUMB_TIP = 4;  // Thumb tip
const INDEX_MCP = 5;  // Index finger metacarpophalangeal joint
const INDEX_PIP = 6;  // Index finger proximal interphalangeal joint
const INDEX_DIP = 7;  // Index finger distal interphalangeal joint
const INDEX_TIP = 8;  // Index finger tip
const MIDDLE_MCP = 9; // Middle finger metacarpophalangeal joint
const MIDDLE_PIP = 10; // Middle finger proximal interphalangeal joint
const MIDDLE_DIP = 11; // Middle finger distal interphalangeal joint
const MIDDLE_TIP = 12; // Middle finger tip
const RING_MCP = 13;  // Ring finger metacarpophalangeal joint
const RING_PIP = 14;  // Ring finger proximal interphalangeal joint
const RING_DIP = 15;  // Ring finger distal interphalangeal joint
const RING_TIP = 16;  // Ring finger tip
const PINKY_MCP = 17; // Pinky finger metacarpophalangeal joint
const PINKY_PIP = 18; // Pinky finger proximal interphalangeal joint
const PINKY_DIP = 19; // Pinky finger distal interphalangeal joint
const PINKY_TIP = 20; // Pinky finger tip

// MediaPipe Hand Connectors
const HAND_CONNECTIONS = [
    [WRIST, THUMB_CMC],
    [THUMB_CMC, THUMB_MCP],
    [THUMB_MCP, THUMB_IP],
    [THUMB_IP, THUMB_TIP],
    [WRIST, INDEX_MCP],
    [INDEX_MCP, INDEX_PIP],
    [INDEX_PIP, INDEX_DIP],
    [INDEX_DIP, INDEX_TIP],
    [WRIST, MIDDLE_MCP],
    [MIDDLE_MCP, MIDDLE_PIP],
    [MIDDLE_PIP, MIDDLE_DIP],
    [MIDDLE_DIP, MIDDLE_TIP],
    [WRIST, RING_MCP],
    [RING_MCP, RING_PIP],
    [RING_PIP, RING_DIP],
    [RING_DIP, RING_TIP],
    [WRIST, PINKY_MCP],
    [PINKY_MCP, PINKY_PIP],
    [PINKY_PIP, PINKY_DIP],
    [PINKY_DIP, PINKY_TIP],
    [THUMB_MCP, INDEX_MCP],
    [INDEX_MCP, MIDDLE_MCP],
    [MIDDLE_MCP, RING_MCP],
    [RING_MCP, PINKY_MCP]
];

// Landmark Colors based on finger
const LANDMARK_COLORS = {
    [WRIST]: 'rgba(255, 0, 128, 0.7)',
    [THUMB_CMC]: 'rgba(255, 0, 0, 0.5)',
    [THUMB_MCP]: 'rgba(255, 0, 0, 0.5)',
    [THUMB_IP]: 'rgba(255, 0, 0, 0.5)',
    [THUMB_TIP]: 'rgba(255, 0, 0, 0.7)',
    [INDEX_MCP]: 'rgba(255, 165, 0, 0.5)',
    [INDEX_PIP]: 'rgba(255, 165, 0, 0.5)',
    [INDEX_DIP]: 'rgba(255, 165, 0, 0.5)',
    [INDEX_TIP]: 'rgba(255, 165, 0, 0.7)',
    [MIDDLE_MCP]: 'rgba(255, 255, 0, 0.5)',
    [MIDDLE_PIP]: 'rgba(255, 255, 0, 0.5)',
    [MIDDLE_DIP]: 'rgba(255, 255, 0, 0.5)',
    [MIDDLE_TIP]: 'rgba(255, 255, 0, 0.7)',
    [RING_MCP]: 'rgba(0, 255, 0, 0.5)',
    [RING_PIP]: 'rgba(0, 255, 0, 0.5)',
    [RING_DIP]: 'rgba(0, 255, 0, 0.5)',
    [RING_TIP]: 'rgba(0, 255, 0, 0.7)',
    [PINKY_MCP]: 'rgba(0, 128, 255, 0.5)',
    [PINKY_PIP]: 'rgba(0, 128, 255, 0.5)',
    [PINKY_DIP]: 'rgba(0, 128, 255, 0.5)',
    [PINKY_TIP]: 'rgba(0, 128, 255, 0.7)'
};

// Hand-specific colors for visualization
const HAND_SPECIFIC_COLORS = {
    left: {
        outline: 'rgba(0, 255, 255, 0.7)',
        aura: {
            primary: 'hsla(180, 100%, 50%, 0.7)',
            secondary: 'transparent'
        },
        zone: 'rgba(0, 255, 255, 0.5)'
    },
    right: {
        outline: 'rgba(255, 0, 255, 0.7)',
        aura: {
            primary: 'hsla(300, 100%, 50%, 0.7)',
            secondary: 'transparent'
        },
        zone: 'rgba(255, 0, 255, 0.5)'
    }
};

// Landmark sizes
const LANDMARK_SIZES = {
    [WRIST]: 20,
    [THUMB_TIP]: 15,
    [INDEX_TIP]: 15,
    [MIDDLE_TIP]: 15,
    [RING_TIP]: 15,
    [PINKY_TIP]: 15
};

// Landmark names
const LANDMARK_NAMES = [
    'Wrist',
    'Thumb CMC',
    'Thumb MCP',
    'Thumb IP',
    'Thumb Tip',
    'Index MCP',
    'Index PIP',
    'Index DIP',
    'Index Tip',
    'Middle MCP',
    'Middle PIP',
    'Middle DIP',
    'Middle Tip',
    'Ring MCP',
    'Ring PIP',
    'Ring DIP',
    'Ring Tip',
    'Pinky MCP',
    'Pinky PIP',
    'Pinky DIP',
    'Pinky Tip'
];

// Setup webcam
async function setupWebcam() {
    loadingMessage.textContent = 'ACTIVATING VISUAL SENSORS';
    loadingSubMessage.textContent = 'Please allow camera access';

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: false
        });

        webcamElement.srcObject = stream;

        return new Promise((resolve) => {
            webcamElement.onloadedmetadata = () => {
                webcamElement.play();
                resolve();
            };
        });
    } catch (error) {
        console.error('Error accessing webcam:', error);
        loadingMessage.textContent = 'ERROR';
        loadingSubMessage.textContent = 'Could not access webcam. Please ensure you have a webcam connected and have granted permission.';
        throw error;
    }
}

// Initialize MediaPipe Hands
function initMediaPipeHands() {
    loadingMessage.textContent = 'CALIBRATING HAND DETECTION';
    loadingSubMessage.textContent = 'Loading MediaPipe Hands...';

    return new Promise((resolve) => {
        hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        hands.setOptions({
            maxNumHands: 2, // Set maximum number of hands to 2
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults(handleResults);

        loadingSubMessage.textContent = 'Setting up camera...';

        // Setup the camera
        camera = new Camera(webcamElement, {
            onFrame: async () => {
                await hands.send({ image: webcamElement });
            },
            width: 1280,
            height: 720
        });

        resolve(true);
    });
}

// Initialize audio with Tone.js
async function initAudio() {
    loadingMessage.textContent = 'CALIBRATING AUDIO ENGINE';
    loadingSubMessage.textContent = 'Initializing Tone.js...';

    try {
        // Start audio context
        await Tone.start();

        // Create a synth and connect it to a filter with reverb
        synth = new Tone.Synth({
            oscillator: {
                type: waveformSelect.value
            },
            envelope: {
                attack: 0.05,
                decay: 0.2,
                sustain: 0.8,
                release: 1.5
            }
        });

        // Create filter node
        const filter = new Tone.Filter({
            type: "lowpass",
            frequency: parseFloat(filterRange.value),
            rolloff: -12
        });

        // Create reverb
        const reverb = new Tone.Reverb({
            decay: 4,
            wet: parseFloat(reverbRange.value)
        });

        // Wait for reverb to generate impulse
        await reverb.generate();

        // Create analyzer
        analyser = new Tone.Analyser("waveform", 1024);

        // Connect the nodes
        synth.connect(filter);
        filter.connect(reverb);
        reverb.connect(analyser);
        analyser.toDestination();

        // Initialize synth with silent volume
        synth.volume.value = -Infinity;

        // Set flag to indicate audio is ready
        audioInitialized = true;

        // Setup waveform display
        waveformContext = waveformCanvas.getContext("2d");
        waveformCanvas.width = waveformCanvas.offsetWidth;
        waveformCanvas.height = waveformCanvas.offsetHeight;

        // Start drawing waveform
        drawWaveform();

        // Update filter when range changes
        filterRange.addEventListener('input', () => {
            filter.frequency.value = parseFloat(filterRange.value);
        });

        // Update reverb when range changes
        reverbRange.addEventListener('input', () => {
            reverb.wet.value = parseFloat(reverbRange.value);
        });

        // Update oscillator type when select changes
        waveformSelect.addEventListener('change', () => {
            synth.oscillator.type = waveformSelect.value;
        });

        return true;
    } catch (error) {
        console.error('Error initializing audio:', error);
        loadingMessage.textContent = 'ERROR';
        loadingSubMessage.textContent = 'Could not initialize audio. Please try again.';
        return false;
    }
}

// Draw waveform visualization
function drawWaveform() {
    if (!audioInitialized || !analyser) return;

    animationFrameId = requestAnimationFrame(drawWaveform);

    // Get waveform data
    const waveform = analyser.getValue();
    const width = waveformCanvas.width;
    const height = waveformCanvas.height;

    // Clear previous drawing
    waveformContext.clearRect(0, 0, width, height);

    // Draw the new waveform
    waveformContext.lineWidth = 2;
    waveformContext.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    waveformContext.beginPath();

    const sliceWidth = width / waveform.length;
    let x = 0;

    for (let i = 0; i < waveform.length; i++) {
        const v = waveform[i];
        const y = (v + 1) / 2 * height;

        if (i === 0) {
            waveformContext.moveTo(x, y);
        } else {
            waveformContext.lineTo(x, y);
        }

        x += sliceWidth;
    }

    waveformContext.stroke();
}

// Generate grid lines for the SVG overlay
function generateGrid() {
    // Create radial lines from center
    const centerX = 50;
    const centerY = 50;
    const numLines = 36;

    for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2;
        const x2 = centerX + Math.cos(angle) * 100;
        const y2 = centerY + Math.sin(angle) * 100;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', centerX);
        line.setAttribute('y1', centerY);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'white');
        line.setAttribute('stroke-width', '0.1');
        line.setAttribute('stroke-opacity', '0.5');

        gridSvg.appendChild(line);
    }
}

// Toggle theremin on/off
function toggleTheremin() {
    tracking = !tracking;

    if (tracking) {
        startButton.textContent = 'TERMINATE THEREMIN';
        startButton.classList.add('bg-white/20');
        thereminReadings.classList.remove('hidden');
        updateControlZones();

        // Start the camera
        camera.start();

        // Start audio if not already started
        if (audioInitialized && synth) {
            // Trigger note but with volume at 0
            synth.triggerAttack(440);
        }

        // Start FPS counter
        startFpsCounter();
    } else {
        startButton.textContent = 'INITIATE THEREMIN';
        startButton.classList.remove('bg-white/20');
        thereminReadings.classList.add('hidden');

        // Stop the camera
        camera.stop();

        // Stop audio
        if (audioInitialized && synth) {
            synth.triggerRelease();
        }

        // Clear visuals
        clearCoordinateDisplays();
        clearHandAuras();

        // Reset theremin values
        thereminValues = {
            left: { frequency: 0, volume: 0, rotation: 0 },
            right: { frequency: 0, volume: 0, rotation: 0 }
        };

        // Update display
        handDataText.textContent = "Tracking paused...";
        updateThereminDisplay();

        // Stop FPS counter
        stopFpsCounter();
    }
}

// Toggle debug panel visibility
function toggleDebugPanelVisibility() {
    debugPanelVisible = !debugPanelVisible;

    if (debugPanelVisible) {
        handDataPanel.classList.remove('hidden');
        toggleDebugPanel.textContent = 'HIDE DEBUG PANEL';
    } else {
        handDataPanel.classList.add('hidden');
        toggleDebugPanel.textContent = 'SHOW DEBUG PANEL';
    }
}

// Start FPS counter
function startFpsCounter() {
    lastFrameTime = performance.now();
    frameCount = 0;
    fpsInterval = setInterval(updateFps, 1000);

    // Create FPS counter element if it doesn't exist
    if (!document.getElementById('fpsCounter')) {
        const fpsCounter = document.createElement('div');
        fpsCounter.id = 'fpsCounter';
        fpsCounter.className = 'fps-counter';
        fpsCounter.textContent = 'FPS: -';
        document.body.appendChild(fpsCounter);
    }
}

// Update FPS counter
function updateFps() {
    const fpsCounter = document.getElementById('fpsCounter');
    if (fpsCounter) {
        fpsCounter.textContent = `FPS: ${fps}`;
    }
}

// Stop FPS counter
function stopFpsCounter() {
    clearInterval(fpsInterval);
    const fpsCounter = document.getElementById('fpsCounter');
    if (fpsCounter) {
        fpsCounter.remove();
    }
}

// Update control zones for theremin
function updateControlZones() {
    if (showAura.checked) {
        // Clear existing zones
        document.querySelectorAll('.control-zone').forEach(zone => {
            zone.classList.add('hidden');
        });

        document.querySelectorAll('.rotation-guide').forEach(el => el.remove());
        document.querySelectorAll('.rotation-marker').forEach(el => el.remove());

        // Set up zones based on current hand mode
        if (handMode === 'dual' || handMode === 'left-only') {
            // Left hand pitch zone (left side of screen)
            pitchZone.style.left = '5%';
            pitchZone.style.top = '10%';
            pitchZone.style.width = '40%';
            pitchZone.style.height = '80%';
            pitchZone.style.borderColor = HAND_SPECIFIC_COLORS.left.zone;
            pitchZone.classList.remove('hidden');

            // Create rotation guide for left hand
            const leftCenterX = window.innerWidth * 0.25;
            const leftCenterY = window.innerHeight * 0.5;
            const radius = 100;
            createRotationGuide(leftCenterX, leftCenterY, radius, 'left');
        }

        if (handMode === 'dual' || handMode === 'right-only') {
            // Right hand volume zone (right side of screen)
            volumeZone.style.left = '55%';
            volumeZone.style.top = '10%';
            volumeZone.style.width = '40%';
            volumeZone.style.height = '80%';
            volumeZone.style.borderColor = HAND_SPECIFIC_COLORS.right.zone;
            volumeZone.classList.remove('hidden');

            // Create rotation guide for right hand
            const rightCenterX = window.innerWidth * 0.75;
            const rightCenterY = window.innerHeight * 0.5;
            const radius = 100;
            createRotationGuide(rightCenterX, rightCenterY, radius, 'right');
        }
    } else {
        // Hide all zones
        document.querySelectorAll('.control-zone').forEach(zone => {
            zone.classList.add('hidden');
        });

        // Remove any rotation guides
        document.querySelectorAll('.rotation-guide').forEach(el => el.remove());
        document.querySelectorAll('.rotation-marker').forEach(el => el.remove());
    }
}

// Create a visual guide for rotation
function createRotationGuide(centerX, centerY, radius, handType) {
    // Create circular guide for rotation
    const guide = document.createElement('div');
    guide.className = `rotation-guide ${handType}-guide`;
    guide.style.width = `${radius * 2}px`;
    guide.style.height = `${radius * 2}px`;
    guide.style.left = `${centerX - radius}px`;
    guide.style.top = `${centerY - radius}px`;
    guide.style.borderColor = HAND_SPECIFIC_COLORS[handType].zone;

    // Add a marker for 0 degrees
    const zeroDeg = document.createElement('div');
    zeroDeg.className = `rotation-marker ${handType}-marker-zero`;
    zeroDeg.style.left = `${centerX + radius - 5}px`;
    zeroDeg.style.top = `${centerY - 5}px`;
    zeroDeg.style.backgroundColor = HAND_SPECIFIC_COLORS[handType].outline;

    // Add a marker for 270 degrees (max volume position)
    const fullVolDeg = document.createElement('div');
    fullVolDeg.className = `rotation-marker ${handType}-marker-max`;
    fullVolDeg.style.left = `${centerX - 5}px`;
    fullVolDeg.style.top = `${centerY - radius - 5}px`;
    fullVolDeg.style.backgroundColor = HAND_SPECIFIC_COLORS[handType].outline;

    document.body.appendChild(guide);
    document.body.appendChild(zeroDeg);
    document.body.appendChild(fullVolDeg);
}

// Clear coordinate displays
function clearCoordinateDisplays() {
    // Remove all existing coordinate displays efficiently
    if (coordinateContainer) {
        coordinateContainer.innerHTML = '';
    }
    // Reset array
    coordinateDisplays = [];
}

// Clear hand auras
function clearHandAuras() {
    // Remove existing auras
    for (const hand of ['left', 'right']) {
        if (handAuras[hand] && handAuras[hand].parentNode) {
            handAuras[hand].parentNode.removeChild(handAuras[hand]);
            handAuras[hand] = null;
        }
    }
}

// Get closest musical note for a frequency
function getClosestNote(frequency) {
    if (!frequency) return { name: '-', freq: 0 };

    let closestNote = notes[0];
    let smallestDifference = Math.abs(frequency - notes[0].freq);

    for (let i = 1; i < notes.length; i++) {
        const difference = Math.abs(frequency - notes[i].freq);
        if (difference < smallestDifference) {
            smallestDifference = difference;
            closestNote = notes[i];
        }
    }

    return closestNote;
}

// Calculate palm rotation angle (in degrees)
function calculatePalmRotation(landmarks, handType) {
    if (!landmarks || landmarks.length < 21) return 0;

    // We'll use the wrist to index mcp vector as a reference
    const wrist = landmarks[WRIST];
    const indexMcp = landmarks[INDEX_MCP];

    // And wrist to pinky mcp for cross product
    const pinkyMcp = landmarks[PINKY_MCP];

    // Calculate vectors
    const wristToIndexVector = [
        indexMcp.x - wrist.x,
        indexMcp.y - wrist.y
    ];

    const wristToPinkyVector = [
        pinkyMcp.x - wrist.x,
        pinkyMcp.y - wrist.y
    ];

    // Use the cross product to determine if the palm is facing up or down
    const crossProduct =
        wristToIndexVector[0] * wristToPinkyVector[1] -
        wristToIndexVector[1] * wristToPinkyVector[0];

    // Calculate the angle between the wrist-index vector and the positive x-axis
    let angle = Math.atan2(wristToIndexVector[1], wristToIndexVector[0]) * (180 / Math.PI);

    // Normalize to 0-360 degrees
    angle = (angle + 360) % 360;

    // Adjust based on hand orientation (flipped if cross product is negative)
    if (crossProduct < 0) {
        angle = (angle + 180) % 360;
    }

    // Smooth the rotation value
    angle = smoothRotation(angle, handType);

    return angle;
}

// Smooth rotation values to prevent jitter
function smoothRotation(newAngle, handType) {
    if (!rotationSmoothing[handType]) {
        rotationSmoothing[handType] = [];
    }

    if (rotationSmoothing[handType].length > 0) {
        // Handle angle wrapping (e.g., going from 359° to 0°)
        const lastAngle = rotationSmoothing[handType][rotationSmoothing[handType].length - 1];
        if (Math.abs(newAngle - lastAngle) > 180) {
            if (newAngle > lastAngle) {
                newAngle -= 360;
            } else {
                newAngle += 360;
            }
        }
    }

    // Add to smoothing buffer
    rotationSmoothing[handType].push(newAngle);

    // Trim buffer to max samples
    if (rotationSmoothing[handType].length > maxRotationSamples) {
        rotationSmoothing[handType].shift();
    }

    // Calculate average
    const sum = rotationSmoothing[handType].reduce((acc, val) => acc + val, 0);
    let avgAngle = sum / rotationSmoothing[handType].length;

    // Normalize back to 0-360
    avgAngle = (avgAngle + 360) % 360;

    return avgAngle;
}

// Apply smoothing to landmark positions
function smoothLandmarks(newLandmarks, handType) {
    if (!filterResults.checked || !filteredLandmarks[handType] || !filteredLandmarks[handType].length) {
        return JSON.parse(JSON.stringify(newLandmarks));
    }

    const factor = parseFloat(smoothingRange.value);
    const smoothed = [];

    for (let i = 0; i < newLandmarks.length; i++) {
        const newPoint = newLandmarks[i];
        const oldPoint = filteredLandmarks[handType][i];

        const smoothedPoint = {
            x: oldPoint.x * factor + newPoint.x * (1 - factor),
            y: oldPoint.y * factor + newPoint.y * (1 - factor),
            z: oldPoint.z * factor + newPoint.z * (1 - factor)
        };

        smoothed.push(smoothedPoint);
    }

    return smoothed;
}

// Calculate theremin values based on hand positions and rotations
function calculateThereminValues(handData) {
    // Reset values if no hands detected
    if (!handData || Object.keys(handData).length === 0) {
        thereminValues = {
            left: { frequency: 0, volume: 0, rotation: 0 },
            right: { frequency: 0, volume: 0, rotation: 0 }
        };

        // Update audio with zeros
        updateAudio(440, 0);
        updateThereminDisplay();
        return;
    }

    let effectiveFrequency = 0;
    let effectiveVolume = 0;

    // Process left hand (pitch control) if present
    if (handData.left && handData.left.length > 0 && (handMode === 'dual' || handMode === 'left-only')) {
        const leftHand = handData.left;
        const palm = leftHand[WRIST];

        // Calculate normalized position (left side of screen)
        const normalizedX = palm.x * 2.5 - 0.25; // Scale to make the left half of screen the full range
        const normalizedY = 1 - palm.y;  // Invert Y for intuitive control

        // Apply boundaries
        const boundedX = Math.max(0, Math.min(1, normalizedX));

        // Calculate frequency using X position
        const minFreq = 65.41; // C2
        const maxFreq = 1046.50; // C6
        const frequency = minFreq * Math.pow(maxFreq / minFreq, boundedX);

        // Calculate rotation for modulation
        const rotation = calculatePalmRotation(leftHand, 'left');

        // Store the values for left hand
        thereminValues.left.frequency = frequency;
        thereminValues.left.rotation = rotation;

        // Only use Y position if in left-hand-only mode
        if (handMode === 'left-only') {
            // Y position controls volume in left-hand-only mode
            thereminValues.left.volume = normalizedY * 100;
            effectiveVolume = thereminValues.left.volume;
        }

        // Set effective frequency from left hand
        effectiveFrequency = frequency;
    } else {
        // No left hand detected
        thereminValues.left = { frequency: 0, volume: 0, rotation: 0 };
    }

    // Process right hand (volume control) if present
    if (handData.right && handData.right.length > 0 && (handMode === 'dual' || handMode === 'right-only')) {
        const rightHand = handData.right;
        const palm = rightHand[WRIST];

        // Calculate normalized position (right side of screen)
        const normalizedX = (palm.x - 0.5) * 2; // Scale so 0.5-1.0 becomes 0-1
        const normalizedY = 1 - palm.y;  // Invert Y for intuitive control

        // Apply boundaries
        const boundedX = Math.max(0, Math.min(1, normalizedX));

        // Calculate rotation for additional volume control
        const rotation = calculatePalmRotation(rightHand, 'right');

        // Map rotation to volume (0° = off, 270° = 100%)
        let volume = 0;
        if (rotation <= 270) {
            // Direct mapping within the 270 degree range
            volume = (rotation / 270) * 100;
        } else {
            // Handle the case where rotation is between 270 and 360 degrees
            volume = ((360 - rotation) / 90) * 100;
            volume = Math.max(0, volume);
        }

        // Also factor in Y position for primary volume control
        // (higher hand = higher volume, opposite of the Y coordinates)
        volume = volume * normalizedY;

        // Store the values for right hand
        thereminValues.right.volume = volume;
        thereminValues.right.rotation = rotation;

        // If in right-hand-only mode, the X position controls frequency
        if (handMode === 'right-only') {
            const frequency = minFreq * Math.pow(maxFreq / minFreq, boundedX);
            thereminValues.right.frequency = frequency;
            effectiveFrequency = frequency;
        }

        // Set effective volume from right hand
        effectiveVolume = volume;
    } else {
        // No right hand detected
        thereminValues.right = { frequency: 0, volume: 0, rotation: 0 };
    }

    // Apply to audio synthesizer
    updateAudio(effectiveFrequency, effectiveVolume);

    // Update display
    updateThereminDisplay();

    // Create auras if enabled
    if (showAura.checked) {
        for (const hand of ['left', 'right']) {
            if (handData[hand] && handData[hand].length > 0) {
                const palm = handData[hand][WRIST];
                const palmScreenX = palm.x * outputCanvas.width;
                const palmScreenY = palm.y * outputCanvas.height;

                // Use appropriate values based on hand
                const frequency = thereminValues[hand].frequency;
                const volume = thereminValues[hand].volume;

                createHandAura(palmScreenX, palmScreenY, frequency, volume, hand);
            } else if (handAuras[hand]) {
                // Remove aura if hand not detected
                if (handAuras[hand].parentNode) {
                    handAuras[hand].parentNode.removeChild(handAuras[hand]);
                }
                handAuras[hand] = null;
            }
        }
    }
}

// Update audio synth with frequency and volume
function updateAudio(frequency, volume) {
    if (!audioInitialized || !synth) return;

    // Update frequency with slight smoothing
    if (frequency > 0) {
        synth.frequency.rampTo(frequency, 0.1);
    }

    // Update volume
    // Convert percentage to decibels: -Infinity (silent) to 0dB (full volume)
    const volumeDB = volume <= 0 ? -Infinity : Tone.gainToDb(volume / 100);
    synth.volume.rampTo(volumeDB, 0.1);
}

// Create a glowing aura around the hand based on pitch/volume
function createHandAura(x, y, frequency, volume, handType) {
    // Remove existing aura if any
    if (handAuras[handType] && handAuras[handType].parentNode) {
        handAuras[handType].parentNode.removeChild(handAuras[handType]);
    }

    // Don't create aura if disabled or no audio
    if (!showAura.checked || volume < 1) {
        handAuras[handType] = null;
        return;
    }

    const normalizedFreq = (frequency - 65.41) / (1046.50 - 65.41); // Normalize to 0-1

    // Base hue on hand type and frequency
    let hue;
    if (handType === 'left') {
        // Left hand (pitch control): frequency affects hue from cyan (180) to blue (240)
        hue = 180 + (normalizedFreq * 60);
    } else {
        // Right hand (volume control): frequency affects hue from magenta (300) to red (360)
        hue = 300 + (normalizedFreq * 60);
    }

    // Size based on a combination of frequency and volume
    const size = 100 + (normalizedFreq * 50) + (volume * 0.5);

    // Opacity based on volume
    const opacity = 0.1 + (volume / 100 * 0.7);

    const aura = document.createElement('div');
    aura.className = 'hand-aura ' + handType + '-hand-aura';
    aura.style.width = `${size}px`;
    aura.style.height = `${size}px`;
    aura.style.background = `radial-gradient(circle, hsla(${hue}, 100%, 70%, ${opacity}) 0%, transparent 70%)`;
    aura.style.left = `${x - size / 2}px`;
    aura.style.top = `${y - size / 2}px`;
    aura.style.borderColor = HAND_SPECIFIC_COLORS[handType].outline;

    document.body.appendChild(aura);
    handAuras[handType] = aura;
}

// Update theremin display values
function updateThereminDisplay() {
    // Determine which values to display based on hand mode
    let displayFrequency, displayVolume, displayRotation, displayNote;

    if (handMode === 'dual') {
        // In dual mode, left hand controls pitch, right hand controls volume
        displayFrequency = thereminValues.left.frequency;
        displayVolume = thereminValues.right.volume;
        displayRotation = `L:${thereminValues.left.rotation.toFixed(1)}° R:${thereminValues.right.rotation.toFixed(1)}°`;
    } else if (handMode === 'left-only') {
        // In left-only mode, left hand controls everything
        displayFrequency = thereminValues.left.frequency;
        displayVolume = thereminValues.left.volume;
        displayRotation = thereminValues.left.rotation.toFixed(1) + '°';
    } else {
        // In right-only mode, right hand controls everything
        displayFrequency = thereminValues.right.frequency;
        displayVolume = thereminValues.right.volume;
        displayRotation = thereminValues.right.rotation.toFixed(1) + '°';
    }

    // Get closest note name
    const note = getClosestNote(displayFrequency);
    displayNote = note.name;

    // Update readings in the side panel
    currentNote.textContent = displayNote;
    frequencyValue.textContent = displayFrequency.toFixed(2);
    volumeValue.textContent = Math.round(displayVolume);
    rotationValue.textContent = displayRotation;

    // Update main display panel
    noteDisplay.textContent = displayNote;
    frequencyDisplay.textContent = displayFrequency.toFixed(2);
    volumeDisplay.textContent = Math.round(displayVolume);
}

// Create a coordinate display label
function createCoordinateLabel(x, y, text, handType) {
    const label = document.createElement('div');
    label.className = `coordinate-display ${handType}-hand-coordinate`;
    label.textContent = text;

    // Set color based on hand type
    label.style.borderLeft = `3px solid ${HAND_SPECIFIC_COLORS[handType].outline}`;

    // Position slightly offset from the point for better readability
    label.style.left = `${x + 8}px`;
    label.style.top = `${y + 8}px`;

    // Append to the dedicated container
    if (coordinateContainer) {
        coordinateContainer.appendChild(label);
    }
    coordinateDisplays.push(label);

    return label;
}

// Handle MediaPipe hand tracking results
function handleResults(results) {
    // Calculate FPS
    const now = performance.now();
    const delta = now - lastFrameTime;
    frameCount++;

    if (delta >= 1000) {
        fps = Math.round((frameCount * 1000) / delta);
        frameCount = 0;
        lastFrameTime = now;
    }

    // Clear the canvas
    canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    canvasCtx.save();

    // Update canvas size to match video
    if (outputCanvas.width !== webcamElement.videoWidth ||
        outputCanvas.height !== webcamElement.videoHeight) {
        outputCanvas.width = webcamElement.videoWidth;
        outputCanvas.height = webcamElement.videoHeight;
    }

    // Clear coordinate displays
    clearCoordinateDisplays();

    // Process hands if tracking is active
    if (tracking && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // Sort hands by handedness (left/right)
        const sortedHands = {};

        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const landmarks = results.multiHandLandmarks[i];
            const handedness = results.multiHandedness[i].label.toLowerCase();

            // Store by handedness
            sortedHands[handedness] = landmarks;
            handLandmarks[handedness] = landmarks;

            // Apply smoothing
            filteredLandmarks[handedness] = smoothLandmarks(landmarks, handedness);
        }

        // Calculate theremin values from the detected hands
        calculateThereminValues(filteredLandmarks);

        // Update debug display
        updateHandDataDisplay(filteredLandmarks);

        // Draw hands with different colors based on handedness
        for (const handType in filteredLandmarks) {
            const landmarks = filteredLandmarks[handType];

            // Draw landmarks if enabled
            if (showLandmarks.checked && landmarks) {
                for (let i = 0; i < landmarks.length; i++) {
                    const landmark = landmarks[i];

                    // Draw landmark point on canvas
                    const x = landmark.x * outputCanvas.width;
                    const y = landmark.y * outputCanvas.height;

                    // Set color and size based on landmark
                    const baseColor = LANDMARK_COLORS[i] || 'rgba(255, 255, 255, 0.5)';
                    const size = LANDMARK_SIZES[i] || 8;

                    // Adjust color based on hand type
                    let color = baseColor;
                    if (i === WRIST) {
                        // Highlight wrist with hand-specific color
                        color = HAND_SPECIFIC_COLORS[handType].outline;
                    }

                    canvasCtx.fillStyle = color;
                    canvasCtx.beginPath();
                    canvasCtx.arc(x, y, size / 2, 0, 2 * Math.PI);
                    canvasCtx.fill();

                    // Add coordinate labels for important points if enabled
                    if (showCoordinates.checked) {
                        const coordText = `${handType.toUpperCase()} ${LANDMARK_NAMES[i]}: (${Math.round(x)}, ${Math.round(y)})`;
                        createCoordinateLabel(x, y, coordText, handType);
                    }
                }
            }

            // Draw connections between landmarks if enabled
            if (showConnectors.checked && landmarks) {
                // Set drawing style based on hand type
                canvasCtx.strokeStyle = HAND_SPECIFIC_COLORS[handType].outline;
                canvasCtx.lineWidth = 2;

                // Draw connections
                for (const connection of HAND_CONNECTIONS) {
                    const [index1, index2] = connection;
                    const start = landmarks[index1];
                    const end = landmarks[index2];

                    canvasCtx.beginPath();
                    canvasCtx.moveTo(start.x * outputCanvas.width, start.y * outputCanvas.height);
                    canvasCtx.lineTo(end.x * outputCanvas.width, end.y * outputCanvas.height);
                    canvasCtx.stroke();
                }
            }
        }
    } else if (tracking) {
        // No hands detected
        handDataText.textContent = "No hands detected";

        // Reset theremin values
        thereminValues = {
            left: { frequency: 0, volume: 0, rotation: 0 },
            right: { frequency: 0, volume: 0, rotation: 0 }
        };

        updateThereminDisplay();

        // Update audio to silence
        updateAudio(440, 0);  // Frequency doesn't matter at zero volume

        // Remove auras
        clearHandAuras();
    }

    canvasCtx.restore();
}

// Update the hand data display
function updateHandDataDisplay(handData) {
    if (!handData || Object.keys(handData).length === 0) {
        handDataText.textContent = "No hands detected";
        return;
    }

    let dataText = `Detected Hands: ${Object.keys(handData).length}\n\n`;

    // Add information for each hand
    for (const handType in handData) {
        const landmarks = handData[handType];
        if (!landmarks || landmarks.length === 0) continue;

        const palm = landmarks[WRIST];
        const rotation = calculatePalmRotation(landmarks, handType);

        dataText += `${handType.toUpperCase()} HAND:\n`;
        dataText += `Palm: x=${Math.round(palm.x * outputCanvas.width)}, `;
        dataText += `y=${Math.round(palm.y * outputCanvas.height)}, z=${palm.z.toFixed(2)}\n`;
        dataText += `Rotation: ${rotation.toFixed(1)}°\n`;

        // Add theremin values
        const values = thereminValues[handType];
        if (values) {
            if (values.frequency > 0) {
                dataText += `Note: ${getClosestNote(values.frequency).name}\n`;
                dataText += `Frequency: ${values.frequency.toFixed(2)} Hz\n`;
            }
            if (values.volume > 0) {
                dataText += `Volume: ${Math.round(values.volume)}%\n`;
            }
        }

        // Add fingertip positions
        dataText += "Fingertips:\n";
        for (const tipIdx of [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP]) {
            const landmark = landmarks[tipIdx];
            const name = LANDMARK_NAMES[tipIdx];
            const x = Math.round(landmark.x * outputCanvas.width);
            const y = Math.round(landmark.y * outputCanvas.height);
            dataText += `  ${name}: x=${x}, y=${y}, z=${landmark.z.toFixed(2)}\n`;
        }

        dataText += "\n";
    }

    // Add mapping information
    dataText += "CONTROL MAPPING:\n";
    if (handMode === 'dual') {
        dataText += "Left Hand: Pitch Control\n";
        dataText += "Right Hand: Volume Control\n";
    } else if (handMode === 'left-only') {
        dataText += "Left Hand: Pitch & Volume Control\n";
    } else {
        dataText += "Right Hand: Pitch & Volume Control\n";
    }

    handDataText.textContent = dataText;
}

// Set up event listeners
function setupEventListeners() {
    // Start/stop tracking button
    startButton.addEventListener('click', async () => {
        // Initialize audio on first click
        if (!audioInitialized) {
            await initAudio();
        }
        toggleTheremin();
    });

    // Toggle debug panel button
    toggleDebugPanel.addEventListener('click', toggleDebugPanelVisibility);

    // Show/hide visualization elements
    showLandmarks.addEventListener('change', () => {
        // Redraw will happen on next frame
    });

    showConnectors.addEventListener('change', () => {
        // Redraw will happen on next frame
    });

    showCoordinates.addEventListener('change', () => {
        if (!showCoordinates.checked) {
            clearCoordinateDisplays();
        }
    });

    showAura.addEventListener('change', () => {
        if (!showAura.checked) {
            clearHandAuras();
        }
        updateControlZones();
    });

    // Smoothing range changes
    smoothingRange.addEventListener('input', () => {
        // Update max rotation samples based on smoothing value
        maxRotationSamples = Math.floor(1 + parseFloat(smoothingRange.value) * 10);
    });

    // Hand mode selector
    if (handModeSelect) {
        handModeSelect.addEventListener('change', () => {
            handMode = handModeSelect.value;
            updateControlZones();
        });
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        if (outputCanvas) {
            outputCanvas.width = webcamElement.videoWidth;
            outputCanvas.height = webcamElement.videoHeight;
        }

        if (waveformCanvas) {
            waveformCanvas.width = waveformCanvas.offsetWidth;
            waveformCanvas.height = waveformCanvas.offsetHeight;
        }

        updateControlZones();
    });
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // 'T' key for toggling tracking
    if (event.key === 't' || event.key === 'T') {
        toggleTheremin();
    }

    // 'D' key for toggling debug panel
    if (event.key === 'd' || event.key === 'D') {
        toggleDebugPanelVisibility();
    }

    // '1', '2', '3' keys for changing hand mode
    if (event.key === '1') {
        handMode = 'dual';
        if (handModeSelect) handModeSelect.value = handMode;
        updateControlZones();
    } else if (event.key === '2') {
        handMode = 'left-only';
        if (handModeSelect) handModeSelect.value = handMode;
        updateControlZones();
    } else if (event.key === '3') {
        handMode = 'right-only';
        if (handModeSelect) handModeSelect.value = handMode;
        updateControlZones();
    }
});

// Initialize app
async function init() {
    try {
        // Generate grid
        generateGrid();

        // Setup webcam
        await setupWebcam();

        // Initialize MediaPipe Hands
        await initMediaPipeHands();

        // Set up event listeners
        setupEventListeners();

        // Hide loading screen
        loadingScreen.style.display = 'none';

        // Update control zones
        updateControlZones();

        // Setup output canvas
        outputCanvas.width = webcamElement.videoWidth;
        outputCanvas.height = webcamElement.videoHeight;

        // Prepare waveform canvas
        waveformCanvas.width = waveformCanvas.offsetWidth;
        waveformCanvas.height = waveformCanvas.offsetHeight;

    } catch (error) {
        console.error('Initialization error:', error);
        loadingMessage.textContent = 'ERROR';
        loadingSubMessage.textContent = 'Could not initialize. Please refresh the page and try again.';
    }
}

// Cleanup function for when the page is unloaded
function cleanup() {
    if (synth) {
        synth.dispose();
    }

    if (Tone.Transport) {
        Tone.Transport.stop();
    }

    if (Tone.context) {
        Tone.context.close();
    }

    if (camera) {
        camera.stop();
    }

    if (hands) {
        hands.close();
    }

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    window.removeEventListener('resize', handleResize);
}

// Add event listener for page unload
window.addEventListener('beforeunload', cleanup);

// Start initialization
init();