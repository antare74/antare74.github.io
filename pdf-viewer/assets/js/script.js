// Constants
const selectionBox = document.getElementById('selection-box');
const pageSelection = document.getElementById('page-selection');
const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');
const canvas = document.getElementById('pdf-render');
const context = canvas.getContext('2d');

// Variables for selection
let isSelecting = false;
let startX, startY, endX, endY;
let pdfDocument;
let currentPage = 1;

// Event listener for PDF upload
document.getElementById('pdf-upload').addEventListener('change', function(event) {
    const files = event.target.files;
    if (files.length === 0) {
        return; // No files selected, do nothing
    }
    
    const file = files[0];
    clearPdfViewer();
    const fileReader = new FileReader();
    
    fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);
        renderPDF(typedarray);
    };

    fileReader.readAsArrayBuffer(file);
});

// Function to clear PDF viewer
function clearPdfViewer() {
    pdfDocument = null;
    pageSelection.innerHTML = '';
    context.clearRect(0, 0, canvas.width, canvas.height);
    currentPage = 1; // Set currentPage to 1 when clearing viewer
}

// Function to render PDF
function renderPDF(data) {
    pdfjsLib.getDocument(data).promise.then(function(pdf) {
        pdfDocument = pdf;
        renderPageSelect(pdf.numPages);

        // Render first page
        renderPage(currentPage);
    }).catch(function(reason) {
        console.error('Error: ' + reason);
    });
}

// Function to render page select dropdown
function renderPageSelect(numPages) {
    for (let i = 1; i <= numPages; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Page ${i}`;
        pageSelection.appendChild(option);
    }
    // Set the selected page in the dropdown
    pageSelection.value = currentPage;
}

// Event listener for page selection change
pageSelection.addEventListener('change', function(event) {
    const pageNumber = parseInt(event.target.value);
    currentPage = pageNumber;
    renderPage(pageNumber);
});

// Event listener for previous page button
prevButton.addEventListener('click', function() {
    if (currentPage > 1) {
        currentPage--;
        pageSelection.value = currentPage;
        renderPage(currentPage);
    }
});

// Event listener for next page button
nextButton.addEventListener('click', function() {
    if (currentPage < pdfDocument.numPages) {
        currentPage++;
        pageSelection.value = currentPage;
        renderPage(currentPage);
    }
});

// Function to render page
function renderPage(pageNumber) {
    pdfDocument.getPage(pageNumber).then(function(page) {
        // Render PDF page on canvas
        var scale = 1.5;
        var viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        page.render(renderContext);

        // Add event listeners for selection
        canvas.removeEventListener('mousedown', startSelection);
        canvas.removeEventListener('mousemove', trackSelection);
        canvas.removeEventListener('mouseup', endSelection);
        canvas.addEventListener('mousedown', startSelection);
        canvas.addEventListener('mousemove', trackSelection);
        canvas.addEventListener('mouseup', endSelection);
    });
}

// Function to start selection
function startSelection(event) {
    isSelecting = true;
    startX = event.offsetX;
    startY = event.offsetY;
}

// Function to track selection
function trackSelection(event) {
    if (isSelecting) {
        endX = event.offsetX;
        endY = event.offsetY;

        updateSelectionBox();
    }
}

// Function to end selection
function endSelection(event) {
    isSelecting = false;

    // Print the coordinates of the selection
    console.log(`Selection Coordinates: (${startX}, ${startY}) - (${endX}, ${endY})`);
}

// Function to update selection box
function updateSelectionBox() {
    let minX = Math.min(startX, endX);
    let minY = Math.min(startY, endY);
    let width = Math.abs(startX - endX);
    let height = Math.abs(startY - endY);

    selectionBox.style.left = minX + 'px';
    selectionBox.style.top = minY + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
}