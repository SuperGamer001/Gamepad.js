// A button list of the current supported gamepads
const buttonMapping = {
    "Switch": {
        name: "Switch",
        patterns: ["nintendo", "switch", "joy-con"],

        buttons: {
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
        axes: {
            LEFT_STICK_X: 0,
            LEFT_STICK_Y: 1,
            RIGHT_STICK_X: 2,
            RIGHT_STICK_Y: 3
        }
    },
    "GameCube": {
        name: "GameCube",
        patterns: ["gamecube", "mayflash"],
        
        buttons: {
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
        axes: {
            LEFT_STICK_X: 0,
            LEFT_STICK_Y: 1,
            RIGHT_STICK_X: 5,
            RIGHT_STICK_Y: 2
        },
        pressureButtons: [4, 5]
    },
    "Xbox": {
        name: "Xbox",
        patterns: ["xbox", "xinput"],

        buttons: {
            A: 0,
            B: 1,
            X: 2,
            Y: 3,
            LB: 4,
            RB: 5,
            LT: 6,
            RT: 7,
            SELECT: 8,
            START: 9,
            THUMBSTICK_LEFT: 10,
            THUMBSTICK_RIGHT: 11,
            DPAD_UP: 12,
            DPAD_DOWN: 13,
            DPAD_LEFT: 14,
            DPAD_RIGHT: 15
        },
        axes: {
            LEFT_STICK_X: 0,
            LEFT_STICK_Y: 1,
            RIGHT_STICK_X: 2,
            RIGHT_STICK_Y: 3
        }
    },
    "PlayStation": {
        name: "PlayStation",
        patterns: ["playstation", "dualshock", "dualsense", "ps3", "ps4", "ps5"],

        buttons: {
            CROSS: 0,
            CIRCLE: 1,
            SQUARE: 2,
            TRIANGLE: 3,
            L1: 4,
            R1: 5,
            L2: 6,
            R2: 7,
            SELECT: 8,
            START: 9,
            L3: 10,
            R3: 11,
            DPAD_UP: 12,
            DPAD_DOWN: 13,
            DPAD_LEFT: 14,
            DPAD_RIGHT: 15,
            PS: 16
        },
        axes: {
            LEFT_STICK_X: 0,
            LEFT_STICK_Y: 1,
            RIGHT_STICK_X: 2,
            RIGHT_STICK_Y: 3
        }
    },
    "Generic": {
        name: "Generic",
        patterns: ["standard", "gamepad"],

        buttons: {
            BUTTON_0: 0,
            BUTTON_1: 1,
            BUTTON_2: 2,
            BUTTON_3: 3,
            BUTTON_4: 4,
            BUTTON_5: 5,
            BUTTON_6: 6,
            BUTTON_7: 7,
            BUTTON_8: 8,
            BUTTON_9: 9,
            BUTTON_10: 10,
            BUTTON_11: 11,
            BUTTON_12: 12,
            BUTTON_13: 13,
            BUTTON_14: 14,
            BUTTON_15: 15
        },
        axes: {
            AXIS_0: 0,
            AXIS_1: 1,
            AXIS_2: 2,
            AXIS_3: 3
        }
    }
}

const connected_Gamepads = [];
const gamepadStates = [];

// Detect controller type from gamepad ID
function detectControllerType(gamepadId) {
    const lowerId = gamepadId.toLowerCase();
    
    for (const [key, mapping] of Object.entries(buttonMapping)) {
        if (mapping.patterns) {
            for (const pattern of mapping.patterns) {
                if (lowerId.includes(pattern)) {
                    return key;
                }
            }
        }
    }
    
    return "Generic";
}

// The function that is called when a button is pressed or knob is moved.
function controllerAction(type, buttonIndex, axisIndex, value, gamepadIndex, pressure = null) {
    const detail = {
        type: type,
        buttonIndex: buttonIndex,
        axisIndex: axisIndex,
        value: value,
        gamepadIndex: gamepadIndex
    };
    
    if (pressure !== null) {
        detail.pressure = pressure;
    }
    
    var event = new CustomEvent("controllerInput", { detail: detail });
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
            // Initialize state tracking for this gamepad if not exists
            if (!gamepadStates[i]) {
                gamepadStates[i] = {
                    buttons: [],
                    axes: []
                };
            }
            
            const state = gamepadStates[i];
            const controllerType = connected_Gamepads[i]?.controllerType || "Generic";
            const mapping = buttonMapping[controllerType];
            const pressureButtons = mapping.pressureButtons || [];
            
            // Loops through all buttons
            const buttons = gamepad.buttons;
            for (let b = 0; b < buttons.length; b++) {
                const button = buttons[b];
                const wasPressed = state.buttons[b] || false;
                const isPressed = button.pressed;
                
                // Only fire event when button state changes
                if (isPressed !== wasPressed) {
                    state.buttons[b] = isPressed;
                    
                    // Check if this is a pressure-sensitive button
                    const pressure = pressureButtons.includes(b) ? button.value : null;
                    
                    controllerAction("button", b, null, isPressed ? 1 : 0, i, pressure);
                }
            }

            // Loops through all axes
            const axes = gamepad.axes;
            for (let a = 0; a < axes.length; a++) {
                const axis = axes[a];
                const previousAxis = state.axes[a] || 0;
                
                // Apply deadzone and check for significant change
                const deadzone = 0.2;
                const currentValue = Math.abs(axis) < deadzone ? 0 : axis;
                const previousValue = Math.abs(previousAxis) < deadzone ? 0 : previousAxis;
                
                // Only fire event when axis value changes significantly
                if (Math.abs(currentValue - previousValue) > 0.05) {
                    state.axes[a] = axis;
                    controllerAction("axis", null, a, currentValue, i);
                }
            }
        }
    }

    requestAnimationFrame(updateGamepads);
}

// Listens for gamepad connects and disconnects.
document.addEventListener("gamepadconnected", function(e) {
    console.log("Connected: " + e.gamepad.id);
    
    // Detect controller type
    const controllerType = detectControllerType(e.gamepad.id);
    console.log("Detected controller type: " + controllerType);
    
    // Store gamepad with detected controller type
    connected_Gamepads[e.gamepad.index] = {
        gamepad: e.gamepad,
        controllerType: controllerType,
        mapping: buttonMapping[controllerType]
    };
    
    // Dispatch custom event with controller info
    var event = new CustomEvent("controllerConnected", { 
        detail: { 
            index: e.gamepad.index,
            id: e.gamepad.id,
            controllerType: controllerType,
            mapping: buttonMapping[controllerType]
        } 
    });
    window.dispatchEvent(event);
})

document.addEventListener("gamepaddisconnected", function(e) {
    console.log("Disconnected: " + e.gamepad.id);
    connected_Gamepads[e.gamepad.index] = null;
    gamepadStates[e.gamepad.index] = null;
    
    // Remove trailing nulls from connected_Gamepads array
    while (connected_Gamepads.length > 0 && connected_Gamepads[connected_Gamepads.length - 1] === null) {
        connected_Gamepads.pop();
    }
    
    // Remove trailing nulls from gamepadStates array
    while (gamepadStates.length > 0 && gamepadStates[gamepadStates.length - 1] === null) {
        gamepadStates.pop();
    }
    
    // Dispatch custom event
    var event = new CustomEvent("controllerDisconnected", { 
        detail: { 
            index: e.gamepad.index,
            id: e.gamepad.id
        } 
    });
    window.dispatchEvent(event);
})

updateGamepads();
