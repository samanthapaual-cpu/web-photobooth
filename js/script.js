const video = document.getElementById("video");
const captureBtn = document.getElementById("capture-btn");
const filterBtn = document.getElementById("filter-btn");
const frameBtn = document.getElementById("frame-btn");

const photosContainer = document.getElementById("photos");
const timerInput = document.getElementById("timer");

const photoCount = document.getElementById("photo-count");
const photoType = document.getElementById("photo-type");

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");


// ==============================
// FRAME
// ==============================

const frame = new Image();
frame.src = "assets/frames/Frame2-2.png";

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

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Apply filter
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

    // Draw frame
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

captureBtn.addEventListener("click", async () => {

    const count = Number(photoCount.value);
    const type = photoType.value;

    if (!count || count < 1) {
        return;
    }

    // Prevent multiple captures
    captureBtn.disabled = true;
    filterBtn.disabled = true;
    frameBtn.disabled = true;
    photoCount.disabled = true;
    photoType.disabled = true;

    // Remove previous photos
    photosContainer.innerHTML = "";

    try {

        // ==============================
        // SAME PHOTO
        // ==============================

        if (type === "same") {

            // Take only ONE actual photo
            const photo = await takePhoto(1, 1);

            // Duplicate the photo
            const photos = [];

            for (let i = 0; i < count; i++) {
                photos.push(photo);
            }

            // Create strip
            if (count === 1) {

                displaySinglePhoto(photo);

            } else {

                await createPhotoStrip(photos);

            }

        }


        // ==============================
        // DIFFERENT PHOTOS
        // ==============================

        else {

            const photos = [];

            for (let i = 0; i < count; i++) {

                const photo = await takePhoto(
                    i + 1,
                    count
                );

                photos.push(photo);

                // Small pause between shots
                if (i < count - 1) {
                    await wait(700);
                }

            }

            // One photo = normal photo
            if (count === 1) {

                displaySinglePhoto(photos[0]);

            }

            // Multiple photos = ONE STRIP
            else {

                await createPhotoStrip(photos);

            }

        }

    } catch (error) {

        console.error("Capture error:", error);

    }


    // Enable controls again
    captureBtn.disabled = false;
    filterBtn.disabled = false;
    frameBtn.disabled = false;
    photoCount.disabled = false;
    photoType.disabled = false;

    captureBtn.textContent = "Capture";

});


// ==============================
// TAKE PHOTO
// ==============================

async function takePhoto(current, total) {

    const timer = Number(timerInput.value);

    // Show which photo is being taken
    if (total > 1) {

        captureBtn.textContent =
            `Photo ${current} of ${total}`;

    }


    // ==============================
    // COUNTDOWN
    // ==============================

    if (timer > 0) {

        for (let i = timer; i > 0; i--) {

            captureBtn.textContent =
                `${i}`;

            await wait(1000);

        }

    }


    // ==============================
    // CAPTURE CURRENT CANVAS
    // ==============================

    captureBtn.textContent = "📸";

    await wait(200);

    const dataURL = canvas.toDataURL("image/png");

    return dataURL;
}


// ==============================
// CREATE PHOTO STRIP
// ==============================

async function createPhotoStrip(photoURLs) {

    const photoWidth = 640;
    const photoHeight = 480;

    const spacing = 20;
    const padding = 20;

    const stripCanvas = document.createElement("canvas");

    stripCanvas.width =
        photoWidth + (padding * 2);

    stripCanvas.height =
        (photoHeight * photoURLs.length) +
        (spacing * (photoURLs.length - 1)) +
        (padding * 2);

    const stripContext =
        stripCanvas.getContext("2d");


    // ==============================
    // STRIP BACKGROUND
    // ==============================

    stripContext.fillStyle = "#fffaf5";

    stripContext.fillRect(
        0,
        0,
        stripCanvas.width,
        stripCanvas.height
    );


    // ==============================
    // ADD EACH PHOTO
    // ==============================

    for (let i = 0; i < photoURLs.length; i++) {

        const image = new Image();

        image.src = photoURLs[i];

        await new Promise((resolve) => {

            image.onload = resolve;

        });


        const y =
            padding +
            i * (photoHeight + spacing);


        stripContext.drawImage(
            image,
            padding,
            y,
            photoWidth,
            photoHeight
        );

    }


    // ==============================
    // FINAL STRIP
    // ==============================

    const stripDataURL =
        stripCanvas.toDataURL("image/png");

    displayPhotoStrip(stripDataURL);
}


// ==============================
// DISPLAY SINGLE PHOTO
// ==============================

function displaySinglePhoto(dataURL) {

    const photoDiv =
        document.createElement("div");

    photoDiv.classList.add("photo");


    const img =
        document.createElement("img");

    img.src = dataURL;


    photoDiv.appendChild(img);


    // Download button
    const downloadBtn =
        document.createElement("button");

    downloadBtn.textContent =
        "Download";


    downloadBtn.addEventListener("click", () => {

        downloadPhoto(
            dataURL,
            "photo.png"
        );

    });


    photoDiv.appendChild(downloadBtn);

    photosContainer.appendChild(photoDiv);
}


// ==============================
// DISPLAY PHOTO STRIP
// ==============================

function displayPhotoStrip(dataURL) {

    const photoDiv =
        document.createElement("div");

    photoDiv.classList.add("photo");


    const img =
        document.createElement("img");

    img.src = dataURL;

    // Keep strip proportional
    img.style.width = "320px";
    img.style.height = "auto";


    photoDiv.appendChild(img);


    // Download button
    const downloadBtn =
        document.createElement("button");

    downloadBtn.textContent =
        "Download Strip";


    downloadBtn.addEventListener("click", () => {

        downloadPhoto(
            dataURL,
            "photo-strip.png"
        );

    });


    photoDiv.appendChild(downloadBtn);

    photosContainer.appendChild(photoDiv);
}


// ==============================
// DOWNLOAD PHOTO
// ==============================

function downloadPhoto(dataURL, filename) {

    const a =
        document.createElement("a");

    a.href = dataURL;
    a.download = filename;

    a.click();
}


// ==============================
// WAIT FUNCTION
// ==============================

function wait(milliseconds) {

    return new Promise((resolve) => {

        setTimeout(resolve, milliseconds);

    });

}