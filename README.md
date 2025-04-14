# ÆTHERWAVES

[![ÆTHERWAVES](https://aether.layogtima.com/screenshot.png?burssst)](https://www.youtube.com/watch?v=5AtV0r8mlt4&feature=youtu.be)

**Make eerie, ethereal music with your bare hands through this no-touch instrument. Perfect for aspiring electronic musicians, sci-fi enthusiasts, and anyone who's ever wanted to look like they're casting spells while making music!**

## ✨ What is ÆTHERWAVES?

ÆTHERWAVES is a browser-based virtual theremin that uses hand tracking to let you create music by moving your hands in the air. Unlike traditional theremin instruments that use physical antennas, ÆTHERWAVES uses your webcam and machine learning to track your hand movements, allowing you to control pitch, volume, and timbre with gestures.

Think of it as the digital lovechild of a theremin and a Kinect, wrapped in a [MONO aesthetic](https://mono.layogtima.com/).

## 🚀 Getting Started

1. Visit [https://aether.layogtima.com/](https://aether.layogtima.com/) in a web-standard compliant browser (e.g. Safari does NOT work for the moment :()
2. Allow camera access when prompted
3. Click "INITIATE THEREMIN" to begin
4. Position your hands in view of the camera:
   - Left hand (cyan aura): Controls pitch
   - Right hand (magenta aura): Controls volume
5. Move your hands to create sounds:
   - Moving left hand horizontally changes pitch
   - Moving right hand vertically changes volume
   - Rotating your palm adds modulation

## 💻 System Requirements

- Modern web browser with WebGL support (Chrome, Firefox and Edge recommended)
- Webcam
- Decent lighting for optimal hand tracking
- Recommended: Computer with dedicated GPU for smoother performance

## 🎮 Controls

### Hand Gestures

- **Pitch Control**: Move your left hand horizontally (left = low pitch, right = high pitch)
- **Volume Control**: Move your right hand vertically (down = low volume, up = high volume)
- **Palm Rotation**: Adds additional modulation to sound

### UI Controls

- **Waveform Select**: Choose between sine, triangle, sawtooth, and square waves
- **Reverb**: Adjust the amount of reverb effect
- **Filter**: Control the cutoff frequency of the lowpass filter
- **Visualization Options**: Toggle various visual elements:
  - Show Landmarks: Display hand tracking points
  - Show Connectors: Display lines connecting hand landmarks
  - Show Coordinates: Display position information
  - Show Audio Aura: Display glowing auras around hands
- **Hand Tracking**: Enable/disable smoothing for more stable tracking

### Keyboard Shortcuts

- **T**: Toggle theremin on/off
- **D**: Toggle debug panel

## 🔮 Features

- **Hands-free Music Creation**: Control sound parameters using only hand movements
- **Dual Hand Control**: Left hand controls pitch, right hand controls volume
- **Visual Feedback**: See your hands tracked with color-coded landmarks
- **Audio Visualization**: Real-time waveform display
- **Customizable Sound**: Choose from different waveforms (sine, triangle, sawtooth and square)
- **Audio Effects**: Adjustable reverb and filter settings
- **Detailed Hand Tracking**: MediaPipe-powered hand landmark detection
- **Audio Auras**: Visual representation of the sounds you're creating
- **Debug Mode**: For those who want to see what's happening under the hood

## 🛠️ Technical Stack

- **Frontend**: HTML, CSS, JavaScript (over CDN, no build tooling needed!)
- **Hand Tracking**: [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html)
- **Audio Synthesis**: [Tone.js](https://tonejs.github.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## 🔍 Debug Features

Toggle the debug panel to see:

- Hand position coordinates
- Detected landmark positions
- Current frequency and volume values
- Palm rotation angle
- FPS counter

## 🎵 Music Theory Notes

ÆTHERWAVES is tuned to a chromatic scale from C2 (65.41 Hz) to C6 (1046.50 Hz). The pitch mapping is exponential rather than linear, which makes it more musically intuitive.

## 🧙‍♀️ Tips for IDEAL Performance

1. **Lighting**: Ensure your hands are well-lit for better tracking
2. **Contrast**: Perform against a plain background for best results
3. **Distance**: Position yourself about 2-3 feet from the camera
4. **Practice**: Start with slow, deliberate movements
5. **Explore**: Try different hand positions and rotations
6. **Record**: Capture your performance with screen recording software

## 🔄 Planned Features

- [ ] Multiple theremin modes
- [ ] Additional audio effects
- [ ] Scale/mode selection
- [ ] Recording and export functionality
- [ ] Touch device support
- [ ] Multiple user collaboration

## 👾 Known Issues

- Safari is not supported yet
- Hand tracking may be less reliable in poor lighting conditions
- Performance may vary based on system capabilities
- Mobile support is limited

## 🤝 Credits and Contributing

Created by Amartha, Claude 3.7 Sonnet and Amit [amit@absurd.industries]

ÆTHERWAVES is an open creative project under GPL v3. Feel free to fork, modify, and enhance it. Pull requests welcome!

Made with 💜 in Bengaluru, India.

---

_Wave your hands in the air like you're summoning digital spirits_
