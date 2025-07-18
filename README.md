# 🌟 Wraith Run

A Journey-inspired atmospheric escape game where you must navigate through ancient corridors while avoiding the relentless pursuit of wraiths.

## 🎮 How to Play

- **Objective**: Navigate from the entrance (blue) to the exit (orange) while avoiding wraiths
- **Movement**: Use WASD or arrow keys (desktop) or touch joystick (mobile)
- **Energy System**: Moving drains energy, rest in safe rooms (green) to recharge
- **Safe Rooms**: Wraiths cannot enter these golden sanctuaries
- **Escape**: Reach the exit to win!

## 🚀 Getting Started

1. **Clone or download** this repository
2. **Open `index.html`** in a modern web browser
3. **Start playing** immediately - no build process required!

## 📁 Project Structure

```
WraithRun/
├── index.html                 # Main game entry point
├── css/
│   ├── main.css              # Core game styles
│   └── mobile.css            # Mobile touch controls
├── js/
│   ├── main.js               # Game initialization & loop
│   ├── player.js             # Player mechanics
│   ├── wraith.js             # Wraith AI system
│   ├── map.js                # Map generation & collision
│   ├── camera.js             # Camera system
│   ├── input.js              # Input handling
│   ├── ui.js                 # User interface
│   └── utils.js              # Utility functions
├── assets/                   # Game assets (future use)
│   ├── images/
│   ├── sounds/
│   └── config/
├── README.md
└── WRAITH_RUN_ENHANCEMENT_PLAN.md
```

## 🎯 Features

### ✅ Current Features
- **Modular Architecture**: Clean, maintainable code structure
- **Cross-Platform**: Works on desktop and mobile devices
- **Touch Controls**: Mobile-optimized joystick interface
- **Procedural Maps**: Randomly generated corridor layouts
- **Energy System**: Strategic resource management
- **Camera System**: Smooth following camera with bounds
- **Performance Optimized**: Efficient rendering and collision detection

### 🚧 Planned Enhancements
See `WRAITH_RUN_ENHANCEMENT_PLAN.md` for detailed roadmap including:
- Journey-inspired visual overhaul
- Advanced procedural map generation
- Intelligent wraith AI with multiple behaviors
- Atmospheric lighting and particle effects
- Audio system and sound design

## 🎮 Controls

### Desktop
- **Movement**: `W A S D` or Arrow Keys
- **Zoom**: Mouse wheel, `+/-` keys
- **View Full Map**: `M` (zoom to fit entire map)
- **Reset Zoom**: `0` (back to default zoom)
- **Debug Mode**: `F1` (shows FPS, coordinates, etc.)
- **Restart**: `Ctrl + R`
- **New Map**: `G` (generate new map layout instantly)

### Mobile
- **Movement**: Touch joystick (bottom center)
- **Responsive Design**: Automatically adapts to screen size

## 🛠️ Technical Details

- **Pure JavaScript**: No frameworks or dependencies
- **HTML5 Canvas**: Hardware-accelerated 2D rendering
- **Modular Design**: Easy to extend and maintain
- **Mobile-First**: Touch controls and responsive design
- **Performance**: 60fps target with efficient culling

## 🎨 Visual Design

The current version features a clean, minimalist aesthetic that serves as the foundation for the planned Journey-inspired visual overhaul. The color palette uses:
- **Cyan/Blue**: Player and entrance
- **Orange**: Exit
- **Green**: Safe rooms
- **Gray/Black**: Walls and corridors
- **Red/Black**: Wraiths

## 🔧 Development

### Adding New Features
1. Create new modules in the `js/` directory
2. Add CSS in the `css/` directory
3. Reference new files in `index.html`
4. Follow the existing class-based architecture

### Debug Mode
Press `F1` to toggle debug information showing:
- Player coordinates
- Energy levels
- FPS counter
- Wraith count

## 📱 Browser Compatibility

- **Chrome/Chromium**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Optimized for touch

## 🎯 Future Vision

This modular foundation sets the stage for transforming Wraith Run into a premium atmospheric experience. See the enhancement plan for details on upcoming features that will elevate the game to AAA quality standards.

---

*Escape the darkness, find the light.* 🌟 