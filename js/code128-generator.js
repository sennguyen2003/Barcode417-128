// js/code128-generator.js
function initializeCode128Generator(exportCanvasesToDirectory) {
    // This is a self-contained module for the Code128 generator.
    
    const fileInput = document.getElementById('a128-file-input');
    const saveAllBtn = document.getElementById('a128-save-all-btn');
    const statusLabel = document.getElementById('a128-status-label');
    const progressBar = document.getElementById('a128-progress-bar');
    const recordsTableBody = document.getElementById('a128-records-table-body');
    const barcodePreview = document.getElementById('a128-barcode-preview');
    let a128_barcode_data = [];
    let a128_barcode_images = {};

    fileInput.addEventListener('change', handleFileImport);
    saveAllBtn.addEventListener('click', saveAllBarcodes);
    
    function resetUI() {
        fileInput.disabled = false;
        fileInput.value = '';
        if (Object.keys(a128_barcode_images).length > 0) {
            saveAllBtn.disabled = false;
            statusLabel.textContent = `Completed! Ready to save ${Object.keys(a128_barcode_images).length} images.`;
        } else {
            saveAllBtn.disabled = true;
            statusLabel.textContent = 'Ready to import file.';
        }
    }

    async function handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        fileInput.disabled = true;
        saveAllBtn.disabled = true;
        recordsTableBody.innerHTML = '';
        a128_barcode_data = [];
        a128_barcode_images = {};
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "", header: ['Filename', 'Code128'], raw: false });
                if (jsonData[0] && jsonData[0].Filename === 'Filename' && jsonData[0].Code128 === 'Code128') {
                    jsonData.shift();
                }
                a128_barcode_data = jsonData.filter(row => row.Filename && row.Code128);
                if (a128_barcode_data.length === 0) {
                    alert("No valid data found in 'Filename' and 'Code128' columns.");
                    resetUI();
                    return;
                }
                await generateAllBarcodes();
            } catch (err) {
                console.error(err);
                alert("Error processing Excel file: " + err.message);
                resetUI();
            }
        };
        reader.readAsArrayBuffer(file);
    }
    
    async function generateAllBarcodes() {
        statusLabel.textContent = `Found ${a128_barcode_data.length} records. Generating...`;
        progressBar.max = a128_barcode_data.length;
        progressBar.value = 0;
        const showText = document.getElementById('a128-show-text-check').checked;
        const height = parseInt(document.getElementById('a128-height-input').value) || 120;
        for (let i = 0; i < a128_barcode_data.length; i++) {
            const record = a128_barcode_data[i];
            const tr = document.createElement('tr');
            tr.dataset.index = i;
            tr.innerHTML = `<td>${record.Filename}</td><td>${record.Code128}</td><td class="status">Generating...</td>`;
            recordsTableBody.appendChild(tr);
            tr.addEventListener('click', () => onRecordSelect(i));
            try {
                const canvas = document.createElement('canvas');
                await new Promise((resolve, reject) => {
                     try {
                        bwipjs.toCanvas(canvas, {
                            bcid: 'code128', text: record.Code128,
                            height: height / 10, includetext: showText, textxalign: 'center',
                        });
                        a128_barcode_images[i] = canvas;
                        tr.querySelector('.status').textContent = 'Success';
                        resolve();
                    } catch(bwipError) { reject(bwipError); }
                });
            } catch (err) {
                console.error(`Error generating barcode for "${record.Code128}":`, err);
                tr.querySelector('.status').textContent = 'Error';
                a128_barcode_images[i] = null;
            }
            progressBar.value = i + 1;
        }
        alert(`Finished generating ${a128_barcode_data.length} barcodes.`);
        resetUI();
    }

    function onRecordSelect(index) {
        Array.from(recordsTableBody.children).forEach(row => row.classList.remove('selected'));
        recordsTableBody.querySelector(`[data-index='${index}']`).classList.add('selected');
        const canvas = a128_barcode_images[index];
        if (canvas) {
            barcodePreview.innerHTML = '';
            const img = document.createElement('img');
            img.src = canvas.toDataURL();
            barcodePreview.appendChild(img);
        } else {
            barcodePreview.innerHTML = '<p>Error generating barcode for this record.</p>';
        }
    }
    
    function _makeBackgroundTransparent(canvas) {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        const ctx = newCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0);
        const imageData = ctx.getImageData(0, 0, newCanvas.width, newCanvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) {
                data[i+3] = 0;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        return newCanvas;
    }

    async function saveAllBarcodes() {
        if (Object.keys(a128_barcode_images).length === 0) {
            alert("No barcodes have been generated yet.");
            return;
        }
        
        const isTransparent = document.getElementById('a128-transparent-bg-check').checked;
        const canvasesToExport = [];
        const filenamesToExport = [];

        for (const index in a128_barcode_images) {
            let canvas = a128_barcode_images[index];
            if (canvas) {
                if (isTransparent) {
                    canvas = _makeBackgroundTransparent(canvas);
                }
                const record = a128_barcode_data[index];
                const sanitizedFilename = record.Filename.replace(/[\\/*?:"<>|]/g, "_");
                
                canvasesToExport.push(canvas);
                filenamesToExport.push(`${sanitizedFilename}.png`);
            }
        }
        await exportCanvasesToDirectory(canvasesToExport, filenamesToExport);
    }
}