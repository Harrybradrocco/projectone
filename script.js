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
    const categories = {};

    // Parse the extracted text into a structured format
    rows.forEach((row, index) => {
        const columns = row.split(/\s+/); // Split by whitespace
        const weightIndex = columns.length - 1; // Last column is weight
        const weightStr = columns[weightIndex];
        const weight = parseFloat(weightStr.replace(/[^0-9.-]+/g, '')); // Parse weight, remove non-numeric characters

        const functionCode = columns.slice(0, weightIndex).join(' '); // Join all columns except the last as function code
        const sectionCode = columns[0]; // First column is section code

        // Check if weight is valid
        if (!isNaN(weight)) {
            // Check if it's a top-level category or a subcategory
            if (index < 5) { // Assume first 5 entries are top-level categories based on your example
                categories[`Category ${index + 1}`] = {
                    description: functionCode,
                    weight: weight,
                    subcategories: []
                };
            } else {
                // For subcategories, assume all remaining are under "Category 1.1"
                if (!categories["Category 1.1"]) {
                    categories["Category 1.1"] = { subcategories: [], totalWeight: 0 };
                }
                categories["Category 1.1"].subcategories.push({ functionCode, weight });
                categories["Category 1.1"].totalWeight += weight; // Sum weight for subcategories
            }
        }
    });

    // Create HTML for displaying the data
    let html = '';
    Object.keys(categories).forEach(category => {
        const cat = categories[category];
        html += `<h3>${category}: ${cat.description} | Total Weight: ${cat.weight.toFixed(2)} lbs</h3>`;
        
        // If subcategories exist, display them
        if (cat.subcategories.length > 0) {
            html += `<h4>Subcategories:</h4><ul>`;
            cat.subcategories.forEach(sub => {
                html += `<li>${sub.functionCode} | ${sub.weight.toFixed(2)} lbs</li>`;
            });
            html += `</ul>`;
            html += `<strong>Total Weight of Section 1.1: ${cat.totalWeight.toFixed(2)} lbs</strong><br><br>`;
        }
    });

    document.getElementById('output').innerHTML = html;
}
