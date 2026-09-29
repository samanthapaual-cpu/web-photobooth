const video = document.getElementById("video");
const captureBtn = document.getElementById("capture-btn");
const filterBtn = document.getElementById("filter-btn");
const frameBtn = document.getElementById("frame-btn");

const photosContainer = document.getElementById("photos");
const timerInput = document.getElementById("timer");

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");


// ==============================
// FRAME
// ==============================

const frame = new Image();
frame.src = "assets/frames/Frame1.png";
let frameEnabled = true;


// ==============================
// FILTERS
// ==============================

const filters = [
    {
        name: "None",
        value: "none"
    },
    {
        name: "B&W",
        value: "grayscale(100%)"
    },
    {
        name: "Vintage",
        value: "sepia(100%)"
    },
    {
        name: "Bright",
        value: "brightness(120%)"
    }
];

let filterIndex = 0;
let currentFilter = filters[filterIndex].value;

// ==============================
// CAMERA
// ==============================

navigator.mediaDevices.getUserMedia({
    video: true
})
.then((stream) => {
    video.srcObject = stream;
})
.catch((error) => {
    console.error("Camera access denied:", error);
});


// ==============================
// CAMERA READY
// ==============================

video.addEventListener("loadedmetadata", () => {
    canvas.width = 640;
    canvas.height = 480;

    drawPreview();

});


// ==============================
// LIVE PREVIEW
// ==============================

function drawPreview() {
    // Clear canvas
    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Apply filter to camera
    context.filter = currentFilter;

    // Draw camera
    context.drawImage(
        video,
        0,
        0,
        640,
        480
    );

    // Remove filter
    context.filter = "none";

    // Draw frame only if enabled
    if (
        frameEnabled &&
        frame.complete &&
        frame.naturalWidth > 0
    ) {

        context.drawImage(
            frame,
            0,
            0,
            640,
            480
        );

    }

    // Continue live preview
    requestAnimationFrame(drawPreview);

}

// ==============================
// FILTER BUTTON
// ==============================

filterBtn.addEventListener("click", () => {
    filterIndex++;
    if (filterIndex >= filters.length) {
        filterIndex = 0;

    }

    currentFilter = filters[filterIndex].value;
    filterBtn.textContent =
        `Filter: ${filters[filterIndex].name}`;

});


// ==============================
// FRAME BUTTON
// ==============================

frameBtn.addEventListener("click", () => {
    frameEnabled = !frameEnabled;

    if (frameEnabled) {
        frameBtn.textContent = "Frame: On";
    } else {
        frameBtn.textContent = "Frame: Off";
    }
});

// ==============================
// CAPTURE BUTTON
// ==============================

captureBtn.addEventListener("click", () => {
    let timer = Number(timerInput.value);

    if (timer > 0) {
        captureBtn.disabled = true;

        const countdown = setInterval(() => {
            captureBtn.textContent =
                `Capture (${timer})`;
            timer--;

            if (timer < 0) {
                clearInterval(countdown);
                captureBtn.textContent = "Capture";
                captureBtn.disabled = false;
                capturePhoto();
            }
        }, 1000);

    } else {
        capturePhoto();
    }
});

// ==============================
// CAPTURE PHOTO
// ==============================

function capturePhoto() {
    const dataURL = canvas.toDataURL("image/png");
    // Create photo container
    const photoDiv = document.createElement("div");
    photoDiv.classList.add("photo");

    // Create captured image
    const img = document.createElement("img");
    img.src = dataURL;

    photoDiv.appendChild(img);

    // Download button
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Download";
    downloadBtn.addEventListener("click", () => {
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = "photo.png";
        a.click();
    });

    photoDiv.appendChild(downloadBtn);
    // Add photo
    photosContainer.appendChild(photoDiv);
}