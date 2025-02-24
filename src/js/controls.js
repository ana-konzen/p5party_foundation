export class Controls {
  #keyBindings = {};
  // keyName: actionName

  #actions = {};
  // actionName:
  // {
  //   down: boolean,
  //   pressed: boolean,
  //   released: boolean,
  //   count: number,
  // };

  #keyState = {};
  // keyName: boolean

  constructor() {
    window.addEventListener("keydown", this.#handleKeyDown.bind(this));
    window.addEventListener("keyup", this.#handleKeyUp.bind(this));
  }

  /**
   * Binds a specific key to an action. Each key can only be bound to one action.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
   *
   * @param {string} key - The key to bind (e.g., "a", "ArrowLeft", " ").
   * @param {string} action - The action name (e.g., "fire", "left").
   */
  bind(key, action) {
    if (typeof key !== "string" || typeof action !== "string") {
      throw new TypeError("Key and action must be strings.");
    }

    // Assign the key to the action
    this.#keyBindings[key] = action;

    // Initialize the action state if it doesn't exist
    if (!this.#actions[action]) {
      this.#actions[action] = {
        down: false,
        pressed: false,
        released: false,
        count: 0,
      };

      // Define a getter for the action to access its state
      Object.defineProperty(this, action, {
        // Return a copy to prevent external mutations
        get: () => ({ ...this.#actions[action] }),
        enumerable: true,
      });
    }
  }

  /**
   * Unbinds a specific key from its action.
   * @param {string} key - The key to unbind.
   */
  unbind(key) {
    const action = this.#keyBindings[key];
    if (action) {
      delete this.#keyBindings[key];
      delete this.#keyState[key];

      // Clean up the action if no keys are bound to it
      const isActionBound = Object.values(this.#keyBindings).includes(action);
      if (!isActionBound) {
        delete this.#actions[action];
        delete this[action];
      }
    }
  }

  /**
   * Handles the keydown event.
   * @param {KeyboardEvent} e
   */
  #handleKeyDown(e) {
    const key = e.key;

    // Prevent default behavior for bound keys
    if (this.#keyBindings.hasOwnProperty(key)) {
      e.preventDefault();
    }

    // Ignore repeated keydown events
    if (e.repeat) return;

    // Ignore unbound keys
    const action = this.#keyBindings[key];
    if (!action) return;

    // If the key is not already pressed
    if (!this.#keyState[key]) {
      this.#keyState[key] = true; // Mark the key as pressed

      const actionState = this.#actions[action];
      actionState.count += 1;

      // If this is the first key press for the action, update its state
      if (actionState.count === 1) {
        actionState.down = true;
        actionState.pressed = true;
      }
    }
  }

  /**
   * Handles the keyup event.
   * @param {KeyboardEvent} e
   */
  #handleKeyUp(e) {
    const key = e.key;

    // Prevent default behavior for bound keys
    if (this.#keyBindings.hasOwnProperty(key)) {
      e.preventDefault();
    }

    // Ignore repeated keyup events
    if (e.repeat) return;

    // Ignore unbound keys
    const action = this.#keyBindings[key];
    if (!action) return;

    // If the key was previously pressed
    if (this.#keyState[key]) {
      this.#keyState[key] = false; // Mark the key as released

      const actionState = this.#actions[action];
      actionState.count -= 1;

      // If no more keys are pressed for the action, update its state
      if (actionState.count === 0) {
        actionState.down = false;
        actionState.released = true;
      }
    }
  }

  /**
   * Resets the 'pressed' and 'released' states for all actions.
   * This should be called once per game loop tick, after processing actions.
   */
  tick() {
    for (const action in this.#actions) {
      if (this.#actions.hasOwnProperty(action)) {
        this.#actions[action].pressed = false;
        this.#actions[action].released = false;
      }
    }
  }

  /**
   * call to clean up listeners if this instance is no longer needed
   */
  cleanup() {
    window.removeEventListener("keydown", this.#handleKeyDown);
    window.removeEventListener("keyup", this.#handleKeyUp);
  }
}
