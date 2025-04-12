// DOM elements
const loadingScreen = document.getElementById('loadingScreen');
const loadingMessage = document.getElementById('loadingMessage');
const loadingSubMessage = document.getElementById('loadingSubMessage');
const webcamElement = document.getElementById('webcam');
const outputCanvas = document.getElementById('output');
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


// Canvas context
const canvasCtx = outputCanvas.getContext('2d');

// Tracking variables
let hands;
let camera;
let tracking = false;
let debugPanelVisible = true;
let handLandmarks = [];
let filteredLandmarks = [];
let smoothingFactor = 0.5;
let previousPalmRotation = 0;
let rotationSmoothing = [];
let maxRotationSamples = 5;
let coordinateDisplays = [];
let handAura = null;
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
let currentFrequency = 0;
let currentVolume = 0;
let currentRotation = 0;

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
                width: { ideal: 640 },
                height: { ideal: 480 },
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
            maxNumHands: 1,
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
            width: 640,
            height: 480
        });

        resolve(true);
    });
}

// Generate grid lines
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

// Toggle hand tracking
function toggleTracking() {
    tracking = !tracking;

    if (tracking) {
        startButton.textContent = 'STOP TRACKING';
        startButton.classList.add('bg-white/20');
        thereminReadings.classList.remove('hidden');
        updateControlZones();

        // Start the camera
        camera.start();

        // Start FPS counter
        startFpsCounter();
    } else {
        startButton.textContent = 'INITIATE TRACKING';
        startButton.classList.remove('bg-white/20');
        thereminReadings.classList.add('hidden');

        // Stop the camera
        camera.stop();

        // Clear visuals
        clearCoordinateDisplays();
        if (handAura) {
            document.body.removeChild(handAura);
            handAura = null;
        }

        // Reset theremin values
        currentFrequency = 0;
        currentVolume = 0;

        // Update display
        handDataText.textContent = "Tracking paused...";
        updateThereminDisplay();

        // Stop FPS counter
        stopFpsCounter();
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

// Toggle debug panel visibility
function toggleDebugPanelVisibility() {
    debugPanelVisible = !debugPanelVisible;

    if (debugPanelVisible) {
        handDataPanel.classList.remove('hidden');
        toggleDebugPanel.textContent = 'TOGGLE FULL DEBUG';
    } else {
        handDataPanel.classList.add('hidden');
        toggleDebugPanel.textContent = 'SHOW FULL DEBUG';
    }
}

// Update control zones for theremin
function updateControlZones() {
    if (showAura.checked) {
        // Set up pitch zone (X-Y position of palm)
        pitchZone.style.left = '10%';
        pitchZone.style.top = '10%';
        pitchZone.style.width = '80%';
        pitchZone.style.height = '80%';
        pitchZone.classList.remove('hidden');

        // Set up volume zone (visualize as a circular rotation area)
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const radius = 100;

        volumeZone.style.width = `${radius * 2}px`;
        volumeZone.style.height = `${radius * 2}px`;
        volumeZone.style.borderRadius = '50%';
        volumeZone.style.left = `${centerX - radius}px`;
        volumeZone.style.top = `${centerY - radius}px`;
        volumeZone.classList.remove('hidden');

        // Create rotation guide
        createRotationGuide(centerX, centerY, radius);
    } else {
        pitchZone.classList.add('hidden');
        volumeZone.classList.add('hidden');

        // Remove any existing rotation guides
        document.querySelectorAll('.rotation-guide').forEach(el => el.remove());
        document.querySelectorAll('.rotation-marker').forEach(el => el.remove());
    }
}

// Create a visual guide for rotation
function createRotationGuide(centerX, centerY, radius) {
    // Remove any existing guides
    document.querySelectorAll('.rotation-guide').forEach(el => el.remove());
    document.querySelectorAll('.rotation-marker').forEach(el => el.remove());

    // Create circular guide for rotation
    const guide = document.createElement('div');
    guide.className = 'rotation-guide';
    guide.style.width = `${radius * 2}px`;
    guide.style.height = `${radius * 2}px`;
    guide.style.left = `${centerX - radius}px`;
    guide.style.top = `${centerY - radius}px`;

    // Add a marker for 0 degrees
    const zeroDeg = document.createElement('div');
    zeroDeg.className = 'rotation-marker';
    zeroDeg.style.left = `${centerX + radius - 5}px`;
    zeroDeg.style.top = `${centerY - 5}px`;

    // Add a marker for 270 degrees
    const fullVolDeg = document.createElement('div');
    fullVolDeg.className = 'rotation-marker';
    fullVolDeg.style.backgroundColor = 'rgba(0, 255, 255, 0.8)';
    fullVolDeg.style.left = `${centerX - 5}px`;
    fullVolDeg.style.top = `${centerY - radius - 5}px`;

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
    // Reset array (optional, depends if you use it elsewhere)
    coordinateDisplays = [];
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
function calculatePalmRotation(landmarks) {
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
    angle = smoothRotation(angle);

    return angle;
}

// Smooth rotation values to prevent jitter
function smoothRotation(newAngle) {
    if (rotationSmoothing.length > 0) {
        // Handle angle wrapping (e.g., going from 359° to 0°)
        const lastAngle = rotationSmoothing[rotationSmoothing.length - 1];
        if (Math.abs(newAngle - lastAngle) > 180) {
            if (newAngle > lastAngle) {
                newAngle -= 360;
            } else {
                newAngle += 360;
            }
        }
    }

    // Add to smoothing buffer
    rotationSmoothing.push(newAngle);

    // Trim buffer to max samples
    if (rotationSmoothing.length > maxRotationSamples) {
        rotationSmoothing.shift();
    }

    // Calculate average
    const sum = rotationSmoothing.reduce((acc, val) => acc + val, 0);
    let avgAngle = sum / rotationSmoothing.length;

    // Normalize back to 0-360
    avgAngle = (avgAngle + 360) % 360;

    return avgAngle;
}

// Apply smoothing to landmark positions
function smoothLandmarks(newLandmarks) {
    if (!filterResults.checked || !filteredLandmarks.length) {
        return JSON.parse(JSON.stringify(newLandmarks));
    }

    const factor = parseFloat(smoothingRange.value);
    const smoothed = [];

    for (let i = 0; i < newLandmarks.length; i++) {
        const newPoint = newLandmarks[i];
        const oldPoint = filteredLandmarks[i];

        const smoothedPoint = {
            x: oldPoint.x * factor + newPoint.x * (1 - factor),
            y: oldPoint.y * factor + newPoint.y * (1 - factor),
            z: oldPoint.z * factor + newPoint.z * (1 - factor)
        };

        smoothed.push(smoothedPoint);
    }

    return smoothed;
}

// Calculate theremin values based on palm position and rotation
function calculateThereminValues(landmarks) {
    if (!landmarks || landmarks.length === 0) {
        currentFrequency = 0;
        currentVolume = 0;
        currentRotation = 0;
        return;
    }

    // Get palm position (based on wrist)
    const palm = landmarks[WRIST];

    // Get window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate normalized position (bottom left = 0,0)
    const normalizedX = palm.x / windowWidth;
    const normalizedY = 1 - (palm.y / windowHeight);

    // Calculate frequency using 2D position (bottom left to top right increases frequency)
    const minFreq = 65.41; // C2
    const maxFreq = 1046.50; // C6
    const positionFactor = (normalizedX + normalizedY) / 2; // Average of x and y positions
    const frequency = minFreq * Math.pow(maxFreq / minFreq, positionFactor);

    // Calculate palm rotation
    const rotation = calculatePalmRotation(landmarks);

    // Map rotation to volume (0° = off, 270° = 100%)
    let volume = 0;
    if (rotation <= 270) {
        // Direct mapping within the 270 degree range
        volume = (rotation / 270) * 100;
    } else {
        // Handle the case where rotation is between 270 and 360 degrees
        // Map this range back down to approach 0
        volume = ((360 - rotation) / 90) * 100;
        volume = Math.max(0, volume);
    }

    // Store the values
    currentFrequency = frequency;
    currentVolume = volume;
    currentRotation = rotation;

    // Update display
    updateThereminDisplay();
}

// Create a glowing aura around the hand based on pitch/volume
function createHandAura(x, y, frequency, volume) {
    // Remove existing aura if any
    if (handAura && handAura.parentNode) {
        handAura.parentNode.removeChild(handAura);
    }

    // Don't create aura if disabled or no audio
    if (!showAura.checked || volume < 1) {
        handAura = null;
        return;
    }

    const normalizedFreq = (frequency - 65.41) / (1046.50 - 65.41); // Normalize to 0-1

    // Calculate hue based on frequency (rainbow effect)
    const hue = Math.floor(normalizedFreq * 360);

    // Size based on a combination of frequency and volume
    const size = 100 + (normalizedFreq * 50) + (volume * 0.5);

    // Opacity based on volume
    const opacity = 0.1 + (volume / 100 * 0.7);

    const aura = document.createElement('div');
    aura.className = 'hand-aura';
    aura.style.width = `${size}px`;
    aura.style.height = `${size}px`;
    aura.style.background = `radial-gradient(circle, hsla(${hue}, 100%, 70%, ${opacity}) 0%, transparent 70%)`;
    aura.style.left = `${x - size / 2}px`;
    aura.style.top = `${y - size / 2}px`;

    document.body.appendChild(aura);
    handAura = aura;
}

// Update theremin display values
function updateThereminDisplay() {
    // Get closest note
    const note = getClosestNote(currentFrequency);

    // Update display
    currentNote.textContent = note.name;
    frequencyValue.textContent = currentFrequency.toFixed(2);
    volumeValue.textContent = Math.round(currentVolume);
    rotationValue.textContent = currentRotation.toFixed(1);
}

// Create a coordinate display label
function createCoordinateLabel(x, y, text) {
    const label = document.createElement('div');
    label.className = 'coordinate-display';
    label.textContent = text;
    // Position slightly offset from the point for better readability
    label.style.left = `${x + 8}px`;
    label.style.top = `${y + 8}px`;

    // Append to the dedicated container, NOT the body
    if (coordinateContainer) {
        coordinateContainer.appendChild(label);
    }
    coordinateDisplays.push(label); // Still add to array if needed

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

    // Process hand if tracking is active
    if (tracking && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // Get the first hand
        const landmarks = results.multiHandLandmarks[0];
        handLandmarks = landmarks;

        // Apply smoothing if enabled
        filteredLandmarks = smoothLandmarks(landmarks);

        // Calculate theremin values
        calculateThereminValues(filteredLandmarks);

        // Update hand data display
        updateHandDataDisplay(filteredLandmarks);

        // Create aura for the hand if enabled
        if (showAura.checked) {
            const palm = filteredLandmarks[WRIST];
            const palmScreenX = palm.x * outputCanvas.width;
            const palmScreenY = palm.y * outputCanvas.height;
            createHandAura(palmScreenX, palmScreenY, currentFrequency, currentVolume);
        }

        // Draw landmarks if enabled
        if (showLandmarks.checked) {
            for (let i = 0; i < filteredLandmarks.length; i++) {
                const landmark = filteredLandmarks[i];

                // Draw landmark point on canvas
                const x = landmark.x * outputCanvas.width;
                const y = landmark.y * outputCanvas.height;

                // Set color and size based on landmark
                const color = LANDMARK_COLORS[i] || 'rgba(255, 255, 255, 0.5)';
                const size = LANDMARK_SIZES[i] || 8;

                canvasCtx.fillStyle = color;
                canvasCtx.beginPath();
                canvasCtx.arc(x, y, size / 2, 0, 2 * Math.PI);
                canvasCtx.fill();

                // Add coordinate labels for important points
                if (showCoordinates.checked) {
                    const coordText = `${LANDMARK_NAMES[i]}: (${Math.round(x)}, ${Math.round(y)})`;
                    createCoordinateLabel(x, y, coordText);
                }
            }
        }

        // Draw connections between landmarks if enabled
        if (showConnectors.checked) {
            // Set drawing style
            canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            canvasCtx.lineWidth = 2;

            // Draw connections
            for (const connection of HAND_CONNECTIONS) {
                const [index1, index2] = connection;
                const start = filteredLandmarks[index1];
                const end = filteredLandmarks[index2];

                canvasCtx.beginPath();
                canvasCtx.moveTo(start.x * outputCanvas.width, start.y * outputCanvas.height);
                canvasCtx.lineTo(end.x * outputCanvas.width, end.y * outputCanvas.height);
                canvasCtx.stroke();
            }
        }
    } else if (tracking) {
        // No hand detected
        handDataText.textContent = "No hand detected";

        // Reset theremin values
        currentFrequency = 0;
        currentVolume = 0;
        currentRotation = 0;
        updateThereminDisplay();

        // Remove aura
        if (handAura && handAura.parentNode) {
            handAura.parentNode.removeChild(handAura);
            handAura = null;
        }
    }

    canvasCtx.restore();
}

// Update the hand data display
function updateHandDataDisplay(landmarks) {
    if (!landmarks || landmarks.length === 0) {
        handDataText.textContent = "No hand detected";
        return;
    }

    const palm = landmarks[WRIST];
    const rotation = calculatePalmRotation(landmarks);
    let dataText = `Palm: x=${Math.round(palm.x * outputCanvas.width)}, `;
    dataText += `y=${Math.round(palm.y * outputCanvas.height)}, z=${palm.z.toFixed(2)}\n`;
    dataText += `Palm Rotation: ${rotation.toFixed(1)}°\n\n`;

    // Add theremin values
    dataText += `Current Note: ${getClosestNote(currentFrequency).name}\n`;
    dataText += `Frequency: ${currentFrequency.toFixed(2)} Hz\n`;
    dataText += `Volume: ${Math.round(currentVolume)}%\n\n`;

    // Add fingertip positions
    dataText += "Fingertips:\n";
    for (const tipIdx of [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP]) {
        const landmark = landmarks[tipIdx];
        const name = LANDMARK_NAMES[tipIdx];
        const x = Math.round(landmark.x * outputCanvas.width);
        const y = Math.round(landmark.y * outputCanvas.height);
        dataText += `${name}: x=${x}, y=${y}, z=${landmark.z.toFixed(2)}\n`;
    }

    handDataText.textContent = dataText;
}

// Set up event listeners
function setupEventListeners() {
    // Start/stop tracking button
    startButton.addEventListener('click', toggleTracking);

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
        if (!showAura.checked && handAura) {
            document.body.removeChild(handAura);
            handAura = null;
        }
        updateControlZones();
    });

    // Smoothing range changes
    smoothingRange.addEventListener('input', () => {
        // Update max rotation samples based on smoothing value
        maxRotationSamples = Math.floor(1 + parseFloat(smoothingRange.value) * 10);
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (outputCanvas) {
            outputCanvas.width = webcamElement.videoWidth;
            outputCanvas.height = webcamElement.videoHeight;
        }
        updateControlZones();
    });
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // 'T' key for toggling tracking
    if (event.key === 't' || event.key === 'T') {
        toggleTracking();
    }

    // 'D' key for toggling debug panel
    if (event.key === 'd' || event.key === 'D') {
        toggleDebugPanel();
    }
});

// Initialize app
async function init() {
    try {
        // Generate grid
        // generateGrid();

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

    } catch (error) {
        console.error('Initialization error:', error);
        loadingMessage.textContent = 'ERROR';
        loadingSubMessage.textContent = 'Could not initialize. Please refresh the page and try again.';
    }
}

// Start initialization
init();