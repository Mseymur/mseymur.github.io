// Configuration variables
let canvasWidth = 1080;
let canvasHeight = 1080;
let fps = 30;
let smoothingFactor = 0.25; // FFT audio analysis smoothing factor

// Global variables
let mic;
let fft;
let bands = 256; // Must be a multiple of two
let spectrum = new Array(bands);
let sum = new Array(bands);

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
let extendingSphereLinesRadius;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  frameRate(fps);

  // Graphics-related variables
  unit = height / 100;
  strokeWeight(unit / 10.24);
  groundLineY = height * 3 / 4;
  center = createVector(width / 2, height * 3 / 4);

  // Set up microphone and FFT
  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT(smoothingFactor, bands);
  fft.setInput(mic);
}

function draw() {
  fft.analyze();
  spectrum = fft.logAverages(fft.getOctaveBands(bands));

  for (let i = 0; i < spectrum.length; i++) {
    sum[i] += (abs(spectrum[i]) - sum[i]) * smoothingFactor;
  }

  // Reset canvas
  background(0);
  noFill();

  drawAll(sum);
}

function drawStatic() {
  if (initialStatic) {
    extendingSphereLinesRadius = new Array(241);
    for (let angle = 0; angle <= 240; angle += 4) {
      extendingSphereLinesRadius[angle] = map(random(1), 0, 1, sphereRadius, sphereRadius * 7);
    }
    initialStatic = false;
  }

  // More extending lines
  for (let angle = 0; angle <= 240; angle += 4) {
    let x = round(cos(radians(angle + 150)) * sphereRadius + center.x);
    let y = round(sin(radians(angle + 150)) * sphereRadius + groundLineY - yOffset);
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
  sphereRadius = 15 * round(unit);
  yOffset = round(sin(radians(150)) * sphereRadius);

  drawStatic();

  // Additional graphics logic can go here
}

function getGroundY(groundX) {
  let angle = 1.1 * groundX / unit * 10.24;
  let groundY = sin(radians(angle + frameCount * 2)) * unit * 1.25 + groundLineY - unit * 1.25;
  return groundY;
}