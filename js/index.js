const $ = document.querySelector.bind(document)

/** @type {HTMLDivElement} canvasBox */
const canvasBox = $('.canvas__box')

/** @type {HTMLButtonElement} proccessCanvas */
const proccessCanvas = $('#proccessCanvas')

/** @type {HTMLCanvasElement} canvas */
const canvas = $('canvas')

const createCaptureInput = () => {
    let input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*')
    input.setAttribute('capture', '')
    return input;
}

const drawImage = imageFile => {
    const img = new Image();
    const url = window.URL ? window.URL : window.webkitURL;
    img.src = url.createObjectURL(imageFile);

    img.onload = (e) => {
        url.revokeObjectURL(e.src);

        let width;
        let height;
        let binaryReader = new FileReader();

        binaryReader.onloadend = (d) => {
            let exif, transform = "none";
            exif = EXIF.readFromBinaryFile(d.target.result);

            if (exif.Orientation === 8) {
                width = img.height;
                height = img.width;
                transform = "left";
            } else if (exif.Orientation === 6) {
                width = img.height;
                height = img.width;
                transform = "right";
            } else if (exif.Orientation === 1) {
                width = img.width;
                height = img.height;
            } else if (exif.Orientation === 3) {
                width = img.width;
                height = img.height;
                transform = "flip";
            } else {
                width = img.width;
                height = img.height;
            }

            let MAX_WIDTH = innerWidth;
            let MAX_HEIGHT = innerHeight;
            if (width / MAX_WIDTH > height / MAX_HEIGHT) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx = canvas.getContext("2d");

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (transform === 'left') {
                ctx.setTransform(0, -1, 1, 0, 0, height);
                ctx.drawImage(img, 0, 0, height, width);
            } else if (transform === 'right') {
                ctx.setTransform(0, 1, -1, 0, width, 0);
                ctx.drawImage(img, 0, 0, height, width);
            } else if (transform === 'flip') {
                ctx.setTransform(1, 0, 0, -1, 0, height);
                ctx.drawImage(img, 0, 0, width, height);
            } else {
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.drawImage(img, 0, 0, width, height);
            }

            ctx.setTransform(1, 0, 0, 1, 0, 0);
        };

        binaryReader.readAsArrayBuffer(imageFile);
    }
}

const downloadImage = (data) => {
    let a = document.createElement('a')
    a.setAttribute('href', data)
    a.setAttribute('download', Date.now())
    a.click()
}

const processImage = () => {
    ctx = canvas.getContext("2d");
    let pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let r, g, b, i;
    for (let py = 0; py < pixels.height; py += 1) {
        for (let px = 0; px < pixels.width; px += 1) {
            i = (py * pixels.width + px) * 4;
            r = pixels.data[i];
            g = pixels.data[i + 1];
            b = pixels.data[i + 2];
            if (g > 100 && g > r * 1.35 && g > b * 1.6) pixels.data[i + 3] = 0;
        }
    }
    ctx.putImageData(pixels, 0, 0);
    let data = canvas.toDataURL('image/png');
    downloadImage(data)
}

const capture = createCaptureInput()
capture.addEventListener('change', (e) => {
    e.preventDefault()
    if (e.target.files.length === 0) return;

    let imageFile = e.target.files[0];
    drawImage(imageFile)
})

canvasBox.addEventListener('click', () => capture.click(), false)
proccessCanvas.addEventListener('click', processImage, false)