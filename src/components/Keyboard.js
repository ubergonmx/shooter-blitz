class Keyboard {
  constructor(state, isUserPlayer) {
    this.playerState = state;
    this.isUserPlayer = isUserPlayer;
    this.keyPressHooks = {
      w: false,
      a: false,
      s: false,
      d: false,
    };

    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.keyUpHandler = this.keyUpHandler.bind(this);

    this.addEventListeners();
    console.log("Keyboard initialized");
  }

  addEventListeners() {
    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
  }

  removeEventListeners() {
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
  }

  keyDownHandler(event) {
    if (!this.isUserPlayer) return;
    this.playerState.setState("ctr-joystick", true);
    const key = event.key.toLowerCase();
    if (this.keyPressHooks[key] !== undefined) {
      this.keyPressHooks[key] = true;
      this.updateAngle();
    }
  }

  keyUpHandler(event) {
    if (!this.isUserPlayer) return;

    const key = event.key.toLowerCase();
    if (this.keyPressHooks[key] !== undefined) {
      this.keyPressHooks[key] = false;
      this.updateAngle();
    }
  }

  angle() {
    return this.playerState.getState("ctr-angle");
  }

  updateAngle() {
    let angle = 0;
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
    this.playerState.setState("ctr-angle", angle);
  }

  isKeyPressed(key) {
    return this.keyPressHooks[key];
  }

  isAnyKeyPressed() {
    return Object.values(this.keyPressHooks).some((value) => value);
  }
}

export default Keyboard;
