var five = require("johnny-five");
var board = new five.Board();
var speed = 0.1;


var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();

board.on("ready", function () {
  var wheels = {
    left: new five.Servo({ pin: 9, type: 'continuous' }),
    right: new five.Servo({ pin: 10, type: 'continuous' }),
    stop: function () {
      wheels.left.center();
      wheels.right.center();
    },
    forward: function () {
      wheels.left.ccw(speed);
      wheels.right.cw(speed);
      console.log("goForward");
    },
    pivotLeft: function () {
      wheels.left.center();
      wheels.right.cw(speed);
      console.log("turnLeft");
    },
    pivotRight: function () {
      wheels.left.ccw(speed);
      wheels.right.center();
      console.log("turnRight");
    }
  };

  var eyes = new five.IR.Reflect.Array({
    emitter: 13,
    pins: ["A0", "A1", "A2", "A3", "A4", "A5"]
  });

  var calibrating = true;
  var running = false;

  wheels.stop();

  // Start calibration
  // All sensors need to see the extremes so they can understand what a line is,
  // so move the eyes over the materials that represent lines and not lines during calibration.
  eyes.calibrateUntil(function () { return !calibrating; });
  console.log("Press the spacebar to end calibration and start running...");

  stdin.on("keypress", function(chunk, key) {
    if (!key || key.name !== 'space') return;

    calibrating = false;
    running = !running;

    if (!running) {
      wheels.stop();
      console.log("Stopped running. Press the spacebar to start again...")
    }
  });

  eyes.on("line", function(err, line) {
    if(!running) return;


    if (line < 1000) {
      wheels.pivotLeft(line);
    } else if (line > 4000) {
      wheels.pivotRight(line);
    } else {
      wheels.forward(line);
    }
    console.log(line);
  });

  eyes.enable();
});
