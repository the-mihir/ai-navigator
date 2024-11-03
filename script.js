const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const ctx = overlay.getContext('2d');
let model;

// Function to display the recognized gesture
function displayGesture(gesture) {
    const gestureDisplay = document.getElementById('gestureDisplay');
    gestureDisplay.textContent = `Gesture: ${gesture}`;
}

// Function to start the camera and handle errors
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        await video.play();
        overlay.width = video.videoWidth;
        overlay.height = video.videoHeight;
    } catch (error) {
        console.error("Error accessing the camera:", error);
    }
}

// Start the camera
startCamera();

// Define hand connections using Mediapipe's hand landmark connections
const HAND_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],      // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],      // Index finger
    [0, 9], [9, 10], [10, 11], [11, 12], // Middle finger
    [0, 13], [13, 14], [14, 15], [15, 16], // Ring finger
    [0, 17], [17, 18], [18, 19], [19, 20]  // Pinky finger
];

// Function to detect hands and draw on the canvas
async function detectHands() {
    if (model && video.readyState === 4) {
        const predictions = await model.estimateHands(video);

        // Clear the canvas for each frame
        ctx.clearRect(0, 0, overlay.width, overlay.height);

        if (predictions.length > 0) {
            const hand = predictions[0];

            // Draw the skeleton of the hand
            drawHandSkeleton(hand);
            // Draw landmarks
            drawLandmarks(hand);
            // Recognize gesture and trigger action
            const gesture = recognizeGesture(hand);
            triggerAction(gesture);
        }
    }
    requestAnimationFrame(detectHands);
}

// Function to draw hand skeleton
function drawHandSkeleton(hand) {
    HAND_CONNECTIONS.forEach(([start, end]) => {
        const [x1, y1] = hand.landmarks[start];
        const [x2, y2] = hand.landmarks[end];

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "blue"; 
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

// Function to draw landmarks as circles
function drawLandmarks(hand) {
    hand.landmarks.forEach(point => {
        const [x, y] = point;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";  // Landmark color
        ctx.fill();
    });
}

// Function to recognize gestures
function recognizeGesture(hand) {
    const landmarks = hand.landmarks;
    
    // Detecting swipe right
    if (landmarks[8][0] > landmarks[6][0]) { // Check if the index finger is right of the middle finger
        console.log("Gesture recognized: Swipe Right");
        return 'swipeRight';
    } 
    // Detecting swipe left
    else if (landmarks[8][0] < landmarks[6][0]) { // Check if the index finger is left of the middle finger
        console.log("Gesture recognized: Swipe Left");
        return 'swipeLeft';
    }
    
    // No gesture detected
    return null;
}

let isGestureDetected = false; // Flag to prevent multiple detections

function recognizeGesture(hand) {
    if (isGestureDetected) return null; // If a gesture is recently detected, ignore

    const landmarks = hand.landmarks;

    // Detecting swipe right (scroll down)
    if (landmarks[8][0] > landmarks[6][0]) { // Check if the index finger is right of the middle finger
        console.log("Gesture recognized: Swipe Right (Scroll Down)");
        isGestureDetected = true; // Set the flag to prevent further detections
        setTimeout(() => { isGestureDetected = false; }, 3000); // Reset flag after 3 seconds
        return 'scrollDown'; // Return scroll down action for right swipe
    } 
    // Detecting swipe left (scroll up)
    else if (landmarks[8][0] < landmarks[6][0]) { // Check if the index finger is left of the middle finger
        console.log("Gesture recognized: Swipe Left (Scroll Up)");
        isGestureDetected = true; // Set the flag to prevent further detections
        setTimeout(() => { isGestureDetected = false; }, 3000); // Reset flag after 3 seconds
        return 'scrollUp'; // Return scroll up action for left swipe
    }

    // No gesture detected
    return null;
}




// Load the model and start detecting hands
(async function loadModel() {
    model = await handpose.load(); 
    detectHands();
})();
