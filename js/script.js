const video = document.getElementById("video");
const captureBtn = document.getElementById("capture-btn");
const photosContainer = document.getElementById("photos");
const timerInput = document.getElementById("timer");

navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((error) => {
        console.error("Camera access denied:", error);
    });


captureBtn.addEventListener("click", () => {

    let timer = Number(timerInput.value);

    if (timer > 0) {

        captureBtn.disabled = true;

        const countdown = setInterval(() => {

            captureBtn.textContent = `Capture (${timer})`;

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


function capturePhoto() {

    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );

    const dataURL = canvas.toDataURL("image/png");


    const photoDiv = document.createElement("div");

    photoDiv.classList.add("photo");


    const img = document.createElement("img");

    img.src = dataURL;

    photoDiv.appendChild(img);


    const downloadBtn = document.createElement("button");

    downloadBtn.textContent = "Download";


    downloadBtn.addEventListener("click", () => {

        const a = document.createElement("a");

        a.href = dataURL;
        a.download = "photo.png";

        a.click();

    });


    photoDiv.appendChild(downloadBtn);

    photosContainer.appendChild(photoDiv);

}