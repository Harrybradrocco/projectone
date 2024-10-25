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
                // Call the function to process the text and display it in a table
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

    // Create a table
    let tableHTML = '<table><thead><tr><th>Section Number</th><th>Section Code</th><th>Function Code</th><th>Weight of Function</th><th>Weight of Section</th></tr></thead><tbody>';

    // Loop through the rows and parse each line according to your needs
    rows.forEach(row => {
        const columns = row.split(/\s+/); // Split by whitespace (adjust as needed)
        
        if (columns.length >= 5) { // Check if there are enough columns
            tableHTML += `<tr>
                <td>${columns[0]}</td>
                <td>${columns[1]}</td>
                <td>${columns[2]}</td>
                <td>${columns[3]}</td>
                <td>${columns[4]}</td>
            </tr>`;
        }
    });

    tableHTML += '</tbody></table>';
    document.getElementById('output').innerHTML = tableHTML;
}
