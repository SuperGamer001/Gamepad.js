# Gamepad.js
This script allows controller compatibility to Web apps or Electron apps. Many different controllers have different button mappings, which can cause issues. This script makes it easier to "pair up" your controller to your Javascript games.

## Features

### Automatic Controller Detection
The script automatically detects what type of controller you're using based on the gamepad ID and applies the appropriate button mapping. Supported controllers include:
- Nintendo Switch Controllers (Joy-Con, Pro Controller)
- GameCube Controllers (including Mayflash adapters)
- Xbox Controllers (all versions with XInput)
- PlayStation Controllers (DualShock 3, DualShock 4, DualSense)
- Generic/Standard Gamepads

### Axis Mapping
Full axis detection and mapping for analog sticks with:
- Configurable deadzone (default: 0.2)
- Change detection to prevent excessive events
- Axis naming for each controller type

### Pressure-Sensitive Button Support
For controllers that support it (like GameCube L/R triggers), the script detects and reports the pressure value (0.0 to 1.0) alongside button press events.

### Optimized Event System
- State tracking prevents duplicate events
- Only fires events when button/axis states actually change
- Separate events for button presses and axis changes
- Custom events with detailed information:
  - `controllerConnected` - Fired when a controller connects
  - `controllerDisconnected` - Fired when a controller disconnects
  - `controllerInput` - Fired for button presses and axis changes

### Usage Example
```javascript
// Listen for controller connection
window.addEventListener('controllerConnected', (e) => {
    console.log('Controller connected:', e.detail.controllerType);
    console.log('Button mapping:', e.detail.mapping);
});

// Listen for controller input
window.addEventListener('controllerInput', (e) => {
    if (e.detail.type === 'button') {
        console.log(`Button ${e.detail.buttonIndex} ${e.detail.value ? 'pressed' : 'released'}`);
        if (e.detail.pressure !== null) {
            console.log(`Pressure: ${e.detail.pressure}`);
        }
    } else if (e.detail.type === 'axis') {
        console.log(`Axis ${e.detail.axisIndex}: ${e.detail.value}`);
    }
});
```

## Contribution
If your controller isn't on this list, please feel free to add it to the buttonMapping list in the file. To add a new controller:
1. Add patterns that match your controller's gamepad ID
2. Define the button mapping
3. Define the axis mapping
4. (Optional) Specify pressure-sensitive buttons

You can use the test page in `gamepadAPI/index.html` to see what your device reports for button and axis indices.

## Known Limitations

### Wii Remote (Wiimote) Support
Due to browser security restrictions, Wii Remotes cannot be connected directly to web browsers via Bluetooth. This is a browser limitation, not a limitation of this library. The Gamepad API only supports controllers that the operating system recognizes as standard gamepads. Apple's security settings further restrict Bluetooth connections to non-standard devices.

**Workarounds:**
- Use a third-party adapter that converts Wiimote input to standard gamepad input
- Use Electron apps with native Bluetooth access
- Use browser extensions with special permissions (not recommended for security reasons)
