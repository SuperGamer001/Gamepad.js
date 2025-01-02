// A button list of the current supported gamepads
const buttonMapping = {
    "GameCube": {
        A: 0,
        B: 1,
        X: 2,
        Y: 3,
        L: 4,
        R: 5,
        ZL: 6,
        ZR: 7,
        SELECT: 8,
        START: 9,
        THUMBSTICK_LEFT: 10,
        THUMBSTICK_RIGHT: 11,
        DPAD_UP: 12,
        DPAD_DOWN: 13,
        DPAD_LEFT: 14,
        DPAD_RIGHT: 15
    },
    "Switch": {
        A: 1,
        B: 2,
        X: 0,
        Y: 3,
        L: 4,
        R: 5,
        ZL: 7,
        ZR: undefined,
        SELECT: undefined,
        START: 9,
        THUMBSTICK_LEFT: undefined,
        THUMBSTICK_RIGHT: undefined,
        DPAD_UP: 12,
        DPAD_DOWN: 14,
        DPAD_LEFT: 15,
        DPAD_RIGHT: 13
    },
}

const connected_Gamepads = [];

// The function that is called when a button is pressed or knob is moved.
function controllerAction(controller, action, index) {
    var event = new CustomEvent("controllerButton", { detail: { controller: controller, action: action, index: index } });
    window.dispatchEvent(event);
}

// Updates the gamepad info
function updateGamepads(){
    const gamepads = navigator.getGamepads();
    // Loops through all gamepads.
    for(let i = 0; i < gamepads.length; i++) {
        var gamepad = gamepads[i];
        // If the gamepad exists, continue
        if (gamepad) {
            // Loops through all buttons
            const buttons = gamepad.buttons;
            for (let b = 0; b < buttons.length; b++) {
                const button = buttons[b];
                if (button.pressed == true) {
                    controllerAction(b,"button",i)
                }
            }

            // Loops through all axes
            const axes = gamepad.axes;
            for (let a = 0; a < axes.length; a++) {
                const axis = axes[a];
                if (axis <= -0.2 || axis >= 0.2) {
                    controllerAction(a,"axis",i)
                }
            }
        }
    }

    requestAnimationFrame(updateGamepads);
}

// Listens for gamepad connects and disconnects.
document.addEventListener("gamepadconnected", function(e) {
    console.log("Connected")
    connected_Gamepads[e.gamepad.index] = e.gamepad;
})

document.addEventListener("gamepaddisconnected", function(e) {
    console.log("Disconnected")
    connected_Gamepads[e.gamepad.index] = null;
      
    // Example usage:
    let arr = [1, 2, null, 4, null, null, null];
    while (arr.length > 0 && arr[arr.length - 1] === null) {
        arr.pop();
    }
    console.log(arr); // Output: [1, 2, null, 4]      
})

updateGamepads();
