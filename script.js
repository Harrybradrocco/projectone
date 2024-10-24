document.getElementById('processButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const outputDiv = document.getElementById('output');

    if (fileInput.files.length === 0) {
        outputDiv.innerText = 'Please upload an image.';
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
            Tesseract.recognize(
                img,
                'eng',
                {
                    logger: info => console.log(info) // Optional: log progress
                }
            ).then(({ data: { text } }) => {
                outputDiv.innerText = text;
            }).catch(err => {
                outputDiv.innerText = 'Error processing image: ' + err.message;
            });
        };
    };

    reader.readAsDataURL(file);
});
