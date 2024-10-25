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

        // Log for debugging
        console.log(`Row: ${row}, Function Code: ${functionCode}, Weight: ${weight}`);

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

    // Log categories for debugging
    console.log('Categories:', JSON.stringify(categories, null, 2));

    // Create HTML for displaying the data
    let html = '';
    Object.keys(categories).forEach(category => {
        const cat = categories[category];
        
        // Check if cat.weight is defined before using toFixed
        if (cat.weight !== undefined) {
            html += `<h3>${category}: ${cat.description} | Total Weight: ${cat.weight.toFixed(2)} lbs</h3>`;
        } else {
            console.warn(`Warning: cat.weight is undefined for ${category}`);
        }
        
        // If subcategories exist, display them
        if (cat.subcategories.length > 0) {
            html += `<h4>Subcategories:</h4><ul>`;
            cat.subcategories.forEach(sub => {
                // Ensure sub.weight is defined before using toFixed
                if (sub.weight !== undefined) {
                    html += `<li>${sub.functionCode} | ${sub.weight.toFixed(2)} lbs</li>`;
                } else {
                    console.warn(`Warning: sub.weight is undefined for ${sub.functionCode}`);
                }
            });
            html += `</ul>`;
            // Check if totalWeight is defined before using toFixed
            if (cat.totalWeight !== undefined) {
                html += `<strong>Total Weight of Section 1.1: ${cat.totalWeight.toFixed(2)} lbs</strong><br><br>`;
            } else {
                console.warn(`Warning: totalWeight is undefined for ${category}`);
            }
        }
    });
reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
        Tesseract.recognize(
            img,
            'eng',
            {
                logger: info => console.log(info) // Log progress
            }
        ).then(({ data: { text } }) => {
            console.log('Recognized Text:', text); // Log the recognized text
            displayExtractedData(text); // Call the function to process the text
        }).catch(err => {
            outputDiv.innerText = 'Error processing image: ' + err.message;
        });
    };
};


    document.getElementById('output').innerHTML = html;
}
