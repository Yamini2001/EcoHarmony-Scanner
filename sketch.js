let video;
let detector;
let biodegradableLabels = ['paper', 'wood', 'biodegradable-packaging', 'stacks of biodegradable', 'apple', 'mango', 'tomato', 'chair'];
let nonBiodegradableLabels = ['stacks of plastic', 'cell_phone', 'plastic bottles', 'cup'];
let detectedItems = [];

let biodegradableAlarmSound;
let nonBiodegradableAlarmSound;

function preload() {
  biodegradableAlarmSound = loadSound('sound/Biodegradable products.mp3', soundLoaded); // Replace with your biodegradable alarm sound file
  nonBiodegradableAlarmSound = loadSound('sound/Non Biodegradable products.mp3', soundLoaded); // Replace with your non-biodegradable alarm sound file
}

function soundLoaded(sound) {
  sound.setVolume(0.5);
}

function setup() {
  createCanvas(680, 450); // Adjust the canvas size as needed

  // Create a video capture from webcam
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Add event listener for loadeddata event
  video.elt.addEventListener('loadeddata', function () {
    // Load the COCO-SSD model
    detector = ml5.objectDetector('cocossd', detectObjects);
  });
}

function detectObjects() {
  detector.detect(video, gotResult);
}

function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }

  detectedItems = [];

  for (let i = 0; i < results.length; i++) {
    const object = results[i];

    // Check if the detected object is biodegradable
    if (isBiodegradableItem(object.label)) {
      object.biodegradable = true;
      if (!biodegradableAlarmSound.isPlaying()) {
        biodegradableAlarmSound.play();
      }
    } else {
      object.biodegradable = false;
      if (!nonBiodegradableAlarmSound.isPlaying()) {
        nonBiodegradableAlarmSound.play();
      }
    }

    detectedItems.push(object);
  }

  // Display additional information for specific non-biodegradable and biodegradable items
  for (let i = 0; i < detectedItems.length; i++) {
    const object = detectedItems[i];
    if (!object.biodegradable) {
      if (object.label === 'stacks of plastic') {
        displayHarmfulEffects(object.x, object.y + object.height + 16, 'Non-Biodegradable');
      }
    } else {
      if (object.label === 'stacks of biodegradable') {
        displayUsefulBenefits(object.x, object.y + object.height + 16, 'Biodegradable');
      }
    }
  }

  detectObjects();
}

function isBiodegradableItem(label) {
  if (nonBiodegradableLabels.includes(label)) {
    return false; // Return false for non-biodegradable items
  }
  return biodegradableLabels.includes(label);
}

function displayHarmfulEffects(x, y, type) {
  fill(255, 0, 0); // Red fill color for non-biodegradable items
  textSize(12);
  text(`${type} - Harmful Effects: Stacks of plastic pose a significant threat to the environment. They contribute to pollution, endanger wildlife, and take hundreds of years to degrade.`, x, y);
}

function displayUsefulBenefits(x, y, type) {
  fill(0, 255, 0); // Green fill color for biodegradable items
  textSize(12);
  text(`${type} - Useful Benefits: Stacks of biodegradable materials are eco-friendly and can decompose naturally without causing harm to the environment. They contribute to reducing waste and promoting sustainability.`, x, y);
}

function draw() {
  image(video, 0, 0, width, height);

  for (let i = 0; i < detectedItems.length; i++) {
    const object = detectedItems[i];

    // Draw bounding box around the object
    strokeWeight(2);
    if (object.biodegradable) {
      stroke(0, 255, 0); // Green stroke color for biodegradable items
      fill(0, 255, 0, 100); // Green fill color with transparency
    } else {
      if (object.label !== 'person') {
        stroke(255, 0, 0); // Red stroke color for non-biodegradable items
        fill(255, 0, 0, 100); // Red fill color with transparency
      } else {
        noFill(); // Do not fill the bounding box for a person
      }
    }
    rect(object.x, object.y, object.width, object.height);

    // Display the label of the detected object
    if (object.label !== 'person') {
      noStroke();
      fill(255);
      textSize(16);
      text(object.label, object.x + 5, object.y + 16);
    }
  }
}
