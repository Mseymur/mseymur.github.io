let canvasWidth = 600;
let canvasHeight = 800;
let fps = 30;
let smoothingFactor = 0.25; // FFT audio analysis smoothing factor

// Global variables
let mic;
let fft;

let bands = 256; // Must be a multiple of two
let spectrum = new Array(bands);
let sum = new Array(bands).fill(0);

// Graphics
let unit;
let groundLineY;
let center;

// Additional Graphics Variables
let sphereRadius;
let spherePrevX;
let spherePrevY;
let yOffset;
let initialStatic = true;
let extendingSphereLinesRadius = [];

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  frameRate(fps);

  // Graphics related variables
  unit = height / 100;
  strokeWeight(unit / 10.24);
  groundLineY = height * 3 / 4;
  center = createVector(width / 2, height * 3 / 4);

  // Set up p5.sound microphone for MONO input
  mic = new p5.AudioIn();
  mic.start(); // Starts the microphone

  // Explicitly ensure mono input
  mic.connect(); // Ensures mic input is active
  fft = new p5.FFT(smoothingFactor, bands);
  fft.setInput(mic); // Connect FFT to the microphone input
}

function draw() {
  // FFT Analysis
  spectrum = fft.analyze();
  for (let i = 0; i < spectrum.length; i++) {
    // Smooth the FFT spectrum data
    sum[i] += (spectrum[i] - sum[i]) * smoothingFactor;
  }
  
  // Reset canvas
  background(0);
  drawAll(sum);
}

function drawStatic() {
  if (initialStatic) {
    for (let angle = 0; angle <= 240; angle += 4) {
      extendingSphereLinesRadius[angle] = map(random(1), 0, 1, sphereRadius, sphereRadius * 7);
    }
    initialStatic = false;
  }
  
  for (let angle = 0; angle <= 240; angle += 4) {
    let x = cos(radians(angle + 150)) * sphereRadius + center.x;
    let y = sin(radians(angle + 150)) * sphereRadius + groundLineY - yOffset;

    let xDestination = x;
    let yDestination = y;

    for (let i = sphereRadius; i <= extendingSphereLinesRadius[angle]; i++) {
      let x2 = cos(radians(angle + 150)) * i + center.x;
      let y2 = sin(radians(angle + 150)) * i + groundLineY - yOffset;

      if (y2 <= getGroundY(x2)) {
        xDestination = x2;
        yDestination = y2;
      }
    }

    stroke(255);
    if (y <= getGroundY(x)) {
      line(x, y, xDestination, yDestination);
    }
  }
}

function drawAll(sum) {
  sphereRadius = 15 * unit;
  spherePrevX = 0;
  spherePrevY = 0;
  yOffset = sin(radians(150)) * sphereRadius;

  drawStatic();

  let surrCount = 1;
  let direction = false;

  for (let x = 0; x < width * 1.5 && x > -width / 2; surrCount++) {
    let surrRadMin = sphereRadius + sphereRadius * 0.5 * surrCount;
    let surrRadMax = surrRadMin + surrRadMin * 0.125;
    let addon = frameCount * 1.5 * (direction ? 1.5 : 1);

    for (let angle = 0; angle <= 240; angle += 1.5) {
      let surroundingRadius = map(sin(radians(angle * 7 + addon)), -1, 1, surrRadMin, surrRadMax);
      let surrYOffset = sin(radians(150)) * surroundingRadius;

      let x1 = cos(radians(angle + 150)) * surroundingRadius + center.x;
      let y1 = sin(radians(angle + 150)) * surroundingRadius + getGroundY(x1) - surrYOffset;

      noStroke();
      fill(map(surroundingRadius, surrRadMin, surrRadMax, 100, 255));
      circle(x1, y1, 3 * unit / 10.24);
    }

    direction = !direction;
  }
}

function getGroundY(groundX) {
  let angle = 1.1 * groundX / unit * 10.24;
  return sin(radians(angle + frameCount * 2)) * unit * 1.25 + groundLineY - unit * 1.25;
}