class InputManager {
  constructor() {
    this.keys = {};
    this.mobile = {
      joystick: {
        active: false,
        centerX: 0,
        centerY: 0,
        dx: 0,
        dy: 0
      }
    };

    this.setupKeyboardEvents();
    this.setupMobileControls();
  }

  setupKeyboardEvents() {
    document.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });
  }

  setupMobileControls() {
    const joystick = document.getElementById("joystick");
    const joystickKnob = document.getElementById("joystickKnob");

    if (!joystick || !joystickKnob) return;

    // Joystick touch events
    joystick.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const rect = joystick.getBoundingClientRect();
      this.mobile.joystick.centerX = rect.left + rect.width / 2;
      this.mobile.joystick.centerY = rect.top + rect.height / 2;
      this.mobile.joystick.active = true;
      this.handleJoystickMove(e.touches[0], joystickKnob);
    });
    
    joystick.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (this.mobile.joystick.active) {
        this.handleJoystickMove(e.touches[0], joystickKnob);
      }
    });
    
    joystick.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.mobile.joystick.active = false;
      this.mobile.joystick.dx = 0;
      this.mobile.joystick.dy = 0;
      joystickKnob.style.transform = "translate(-50%, -50%)";
    });

    // Prevent context menu on long press
    joystick.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  handleJoystickMove(touch, joystickKnob) {
    const dx = touch.clientX - this.mobile.joystick.centerX;
    const dy = touch.clientY - this.mobile.joystick.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 40;
    
    if (distance <= maxDistance) {
      this.mobile.joystick.dx = dx / maxDistance;
      this.mobile.joystick.dy = dy / maxDistance;
      joystickKnob.style.transform = `translate(${dx - 20}px, ${dy - 20}px)`;
    } else {
      const angle = Math.atan2(dy, dx);
      this.mobile.joystick.dx = Math.cos(angle);
      this.mobile.joystick.dy = Math.sin(angle);
      const limitedX = Math.cos(angle) * maxDistance;
      const limitedY = Math.sin(angle) * maxDistance;
      joystickKnob.style.transform = `translate(${limitedX - 20}px, ${limitedY - 20}px)`;
    }
  }

  // Check if any movement key is pressed
  isMoving() {
    return (
      this.keys["ArrowUp"] || this.keys["w"] ||
      this.keys["ArrowDown"] || this.keys["s"] ||
      this.keys["ArrowLeft"] || this.keys["a"] ||
      this.keys["ArrowRight"] || this.keys["d"] ||
      this.mobile.joystick.active
    );
  }

  // Get movement direction
  getMovementVector() {
    let dx = 0, dy = 0;
    
    // Keyboard input
    if (this.keys["ArrowUp"] || this.keys["w"]) dy -= 1;
    if (this.keys["ArrowDown"] || this.keys["s"]) dy += 1;
    if (this.keys["ArrowLeft"] || this.keys["a"]) dx -= 1;
    if (this.keys["ArrowRight"] || this.keys["d"]) dx += 1;
    
    // Mobile joystick input
    if (this.mobile.joystick.active) {
      dx += this.mobile.joystick.dx;
      dy += this.mobile.joystick.dy;
    }

    return { dx, dy };
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InputManager;
} 