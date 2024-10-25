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
                // Call the function to process the text and display it in a structured format
                displayExtractedData(text);
            }).catch(err => {
                outputDiv.innerText = 'Error processing image: ' + err.message;
            });
        };
    };

    reader.readAsDataURL(file);
});

function displayExtractedData(text) {
    const rows = text.split('\n').map(row => row.trim()).filter(row => row !== '');
    const data = {};

    // Parse the extracted text into a structured format
    rows.forEach(row => {
        const columns = row.split(/\s+/); // Split by whitespace (adjust as needed)
        
        if (columns.length >= 3) { // Assuming first two are code and function, and third is weight
            const sectionCode = columns[0]; // e.g., "Casing"
            const functionCode = columns[1]; // e.g., "Function1"
            const weight = parseFloat(columns[2]); // e.g., "2.5"

            // Initialize section code if not already done
            if (!data[sectionCode]) {
                data[sectionCode] = [];
            }

            // Add function code and its weight to the section
            data[sectionCode].push({ functionCode, weight });
        }
    });

    // Create HTML for displaying the data
    let html = '';
    Object.keys(data).forEach(section => {
        html += `<h3>${section}</h3><ul>`;
        let sectionWeight = 0;

        data[section].forEach(func => {
            html += `<li>${func.functionCode} | ${func.weight}</li>`;
            sectionWeight += func.weight; // Sum weights for the section
        });

        html += `</ul><strong>Total Weight of Section: ${sectionWeight}</strong>`;
    });

    document.getElementById('output').innerHTML = html;
}
