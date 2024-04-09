class Keyboard {
  constructor(state, isUserPlayer) {
    this.playerState = state;
    this.isUserPlayer = isUserPlayer;
    this.keyPressHooks = {
      w: false,
      a: false,
      s: false,
      d: false,
      //space bar
      " ": false,
    };
    this.lastAngle = 0;

    this.detectMouse().then((mouseExists) => {
      this.mouseExists = mouseExists;
      this.mouseAngle = mouseExists ? 0 : undefined;
      console.log("Mouse detected:", mouseExists);
      this.mouseDownHandler = this.mouseDownHandler.bind(this);
      this.mouseUpHandler = this.mouseUpHandler.bind(this);
      this.keyDownHandler = this.keyDownHandler.bind(this);
      this.keyUpHandler = this.keyUpHandler.bind(this);
      this.addEventListeners();
      console.log(this.joystick);
    });
  }

  hasMouse() {
    return this.mouseExists;
  }

  detectMouse(timeout = 5000) {
    return new Promise((resolve) => {
      const mouseDetected = () => {
        window.removeEventListener("mousemove", mouseDetected);
        window.removeEventListener("mousedown", mouseDetected);
        resolve(true);
      };

      window.addEventListener("mousemove", mouseDetected);
      window.addEventListener("mousedown", mouseDetected);

      setTimeout(() => {
        window.removeEventListener("mousemove", mouseDetected);
        window.removeEventListener("mousedown", mouseDetected);
        resolve(false);
      }, timeout);
    });
  }

  addEventListeners() {
    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
    console.log("Keyboard initialized");
    if (this.mouseExists) {
      window.addEventListener("mousedown", this.mouseDownHandler);
      window.addEventListener("mouseup", this.mouseUpHandler);
      console.log("Mouse initialized");
    }
  }

  removeEventListeners() {
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
    if (this.mouseExists) {
      window.removeEventListener("mousedown", this.mouseDownHandler);
      window.removeEventListener("mouseup", this.mouseUpHandler);
    }
  }

  mouseDownHandler(event) {
    if (!this.isUserPlayer || event.button !== 0) return;
    this.playerState.setState("ctr-fire", true);
  }

  mouseUpHandler(event) {
    if (!this.isUserPlayer || event.button !== 0) return;
    this.playerState.setState("ctr-fire", false);
  }

  keyDownHandler(event) {
    if (!this.isUserPlayer) return;
    const key = event.key.toLowerCase();
    if (this.keyPressHooks[key] !== undefined) {
      if (key === " ") {
        this.playerState.setState("ctr-fire", true);
        return;
      }

      this.playerState.setState("ctr-joystick", true);
      this.keyPressHooks[key] = true;
      this.updateAngle();
    }
  }

  keyUpHandler(event) {
    if (!this.isUserPlayer) return;

    const key = event.key.toLowerCase();
    if (this.keyPressHooks[key] !== undefined) {
      if (key === " ") {
        this.playerState.setState("ctr-fire", false);
        return;
      }
      this.keyPressHooks[key] = false;
      this.updateAngle();
    }

    // If no keys are pressed, stop the player movement
    if (!this.isAnyKeyPressed() && !this.mouseExists) {
      this.playerState.setState("ctr-joystick", false);
    }
  }
  kbAngle() {
    return this.lastAngle;
  }

  updateAngle() {
    let angle = this.lastAngle;
    if (
      this.keyPressHooks.w &&
      !this.keyPressHooks.a &&
      !this.keyPressHooks.d
    ) {
      angle = Math.PI;
    } else if (
      this.keyPressHooks.a &&
      !this.keyPressHooks.w &&
      !this.keyPressHooks.s
    ) {
      angle = Math.PI * 1.5;
    } else if (
      this.keyPressHooks.s &&
      !this.keyPressHooks.a &&
      !this.keyPressHooks.d
    ) {
      angle = Math.PI * 2;
    } else if (
      this.keyPressHooks.d &&
      !this.keyPressHooks.w &&
      !this.keyPressHooks.s
    ) {
      angle = Math.PI / 2;
    } else if (this.keyPressHooks.s && this.keyPressHooks.a) {
      angle = Math.PI * 1.75;
    } else if (this.keyPressHooks.w && this.keyPressHooks.a) {
      angle = Math.PI * 1.25;
    } else if (this.keyPressHooks.w && this.keyPressHooks.d) {
      angle = Math.PI * 0.75;
    } else if (this.keyPressHooks.s && this.keyPressHooks.d) {
      angle = Math.PI * 0.25;
    }
    this.lastAngle = angle;

    if (!this.mouseExists) this.playerState.setState("ctr-angle", angle);
  }

  isKeyPressed(key) {
    return this.keyPressHooks[key];
  }

  isAnyKeyPressed() {
    return Object.values(this.keyPressHooks).some((value) => value);
  }
}

export default Keyboard;
