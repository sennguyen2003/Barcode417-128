// js/pdf417-generator.js
function initializePdf417Generator(exportCanvasesToDirectory) {
    const accordionContainer = document.getElementById('a417-accordion-container');
    const controlsContainer = document.getElementById('a417-controls');
    const recordsTableBody = document.getElementById('a417-records-table-body');
    const barcodePreview = document.getElementById('a417-barcode-preview');
    const formattedDataText = document.getElementById('a417-formatted-data');
    const rawDataText = document.getElementById('a417-raw-data');
    
    const a417_fields = {};
    let a417_all_records = [];
    let a417_barcode_images = {};

    const fieldDefinitions = {
        "Header Information": { icon: "fa-solid fa-file-invoice", fields: [
            {label: "Issuer Identification Number (IIN):", name: "iin", value: "636000"},
            {label: "AAMVA Version Number:", name: "aamva_version", value: "10"},
            {label: "Jurisdiction Version Number:", name: "jurisdiction_version", value: "00"},
            {label: "Number of Subfiles:", name: "subfile_count", value: "01"},
            {label: "DL Subfile Length:", name: "dl_subfile_length", value: "", placeholder: "Auto-calculated"},
            {label: "Jurisdiction Subfile Length:", name: "jurisdiction_subfile_length", value: "0000"}
        ]},
        "Identification Information": { icon: "fa-solid fa-user", fields: [
            {label: "Family Name (DCS):", name: "family_name"}, 
            {label: "First Name (DAC):", name: "first_name"},
            {label: "Middle Name(s) (DAD):", name: "middle_name"}, 
            {label: "Name Suffix (DCU):", name: "name_suffix"},
            {label: "Date of Birth (DBB):", name: "dob", placeholder: "MMDDYYYY"},
            {label: "Document Expiration Date (DBA):", name: "expiry_date", placeholder: "MMDDYYYY"},
            {label: "Document Issue Date (DBD):", name: "issue_date", placeholder: "MMDDYYYY"},
            {label: "Customer ID Number (DAQ):", name: "customer_id"}, 
            {label: "Document Discriminator (DCF):", name: "document_discriminator"},
            {label: "Country Identification (DCG):", name: "country", value: "USA"},
            {label: "Family Name Truncation (DDE):", name: "family_name_trunc", type: 'combobox', options: [" ","N", "T", "U"]},
            {label: "First Name Truncation (DDF):", name: "first_name_trunc", type: 'combobox', options: [" ","N", "T", "U"]},
            {label: "Middle Name Truncation (DDG):", name: "middle_name_trunc", type: 'combobox', options: [" ","N", "T", "U"]}
        ]},
        "Address Information": { icon: "fa-solid fa-location-dot", fields: [
            {label: "Street 1 (DAG):", name: "street1"}, 
            {label: "Street 2 (DAH):", name: "street2"},
            {label: "City (DAI):", name: "city"}, 
            {label: "Jurisdiction Code (DAJ):", name: "state", value: "CA"},
            {label: "Postal Code (DAK):", name: "postal_code"}
        ]},
        "Physical Description": { icon: "fa-solid fa-person", fields: [
            {label: "Sex (DBC):", name: "sex", type: 'combobox', options: [["1", "1-Male"], ["2", "2-Female"], ["9", "9-Unknown"]]},
            {label: "Eye Color (DAY):", name: "eye_color", type: 'combobox', options: ["BLK", "BLU", "BRO","BNR", "GRY", "GRN", "HAZ", "MAR", "PNK"]},
            {label: "Height (DAU):", name: "height", placeholder: "e.g., '068 in'"},
            {label: "Hair Color (DAZ):", name: "hair_color", type: 'combobox', options: ["BLK", "BRO", "BLN", "RED", "WHI", "GRY", "SDY", "BAL"]},
            {label: "Race/Ethnicity (DCL):", name: "race", type: 'combobox', options: [" ","AI", "AP", "BK", "H", "O", "U", "W"]},
            {label: "Weight - Pounds (DAW):", name: "weight_pounds"}, 
            {label: "Weight - Kilograms (DAX):", name: "weight_kg"},
            {label: "Weight Range (DCE):", name: "weight_range", type: 'combobox', options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
        ]},
        "Document Details": { icon: "fa-solid fa-stamp", fields: [
            {label: "Jurisdiction Vehicle Class (DCA):", name: "vehicle_class"},
            {label: "Jurisdiction Restrictions (DCB):", name: "restrictions"},
            {label: "Jurisdiction Endorsements (DCD):", name: "endorsements"},
            {label: "Standard Vehicle Classification (DCM):", name: "std_vehicle_class"},
            {label: "Standard Restriction Code (DCO):", name: "std_restriction"},
            {label: "Standard Endorsement Code (DCN):", name: "std_endorsement"},
            {label: "Compliance Type (DDA):", name: "compliance_type", type: 'combobox', options: [" ","F", "N"]},
            {label: "Card Revision Date (DDB):", name: "card_revision_date", placeholder: "MMDDYYYY"},
            {label: "Limited Duration Indicator (DDD):", name: "limited_duration", type: 'combobox', options: ["0", "1"]},
            {label: "HAZMAT Endorsement Expiry (DDC):", name: "hazmat_expiry", placeholder: "MMDDYYYY"},
            {label: "Under 18 Until (DDH):", name: "under_18", placeholder: "MMDDYYYY"},
            {label: "Under 19 Until (DDI):", name: "under_19", placeholder: "MMDDYYYY"},
            {label: "Under 21 Until (DDJ):", name: "under_21", placeholder: "MMDDYYYY"},
            {label: "Organ Donor Indicator (DDK):", name: "organ_donor", type: 'combobox', options: ["0", "1"]},
            {label: "Veteran Indicator (DDL):", name: "veteran", type: 'combobox', options: ["0", "1"]}
        ]},
        "Jurisdiction-Specific Fields": { icon: "fa-solid fa-flag-usa", fields: [
            {label: "Place of Birth (DCI):", name: "place_of_birth"},
            {label: "Audit Information (DCJ):", name: "audit_info"},
            {label: "Inventory Control (DCK):", name: "inventory_control"}
        ]},
        "Optional Fields": { icon: "fa-solid fa-plus-square", fields: [
            {label: "Alias Family Name (DBN):", name: "alias_family"},
            {label: "Alias Given Name (DBG):", name: "alias_given"},
            {label: "Alias Suffix Name (DBS):", name: "alias_suffix"}
        ]}
    };

    function buildFormAndControls() {
        // --- Build Accordion ---
        let accordionHtml = '';
        for (const category in fieldDefinitions) {
            const categoryInfo = fieldDefinitions[category];
            accordionHtml += `<div class="accordion-item">
                <button class="accordion-header"><i class="${categoryInfo.icon}"></i> ${category}</button>
                <div class="accordion-content">
                    <div class="grid-3-col">`;
            
            categoryInfo.fields.forEach(field => {
                const elementId = field.label.match(/\((.*?)\)/)?.[1] || '';
                accordionHtml += `<label for="a417-${field.name}">${field.label}</label>`;

                if (field.type === 'combobox') {
                    const datalistId = `datalist-${field.name}`;
                    accordionHtml += `<input list="${datalistId}" id="a417-${field.name}" value="${field.value || ''}" placeholder="${field.placeholder || ''}" autocomplete="off">`;
                    accordionHtml += `<datalist id="${datalistId}">`;
                    field.options.forEach(opt => {
                        if (Array.isArray(opt)) {
                            accordionHtml += `<option value="${opt[0]}">${opt[1] || ''}</option>`;
                        } else {
                            accordionHtml += `<option value="${opt}"></option>`;
                        }
                    });
                    accordionHtml += `</datalist>`;
                } else { 
                    accordionHtml += `<input type="text" id="a417-${field.name}" 
                                   value="${field.value || ''}" 
                                   placeholder="${field.placeholder || ''}">`;
                }
                 accordionHtml += `<span>${elementId}</span>`;
            });
            accordionHtml += `</div></div></div>`;
        }
        accordionContainer.innerHTML = accordionHtml;

        // --- Build Controls ---
        const states = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"];
        let stateOptions = states.map(s => `<option value="${s}"></option>`).join('');
        
        controlsContainer.innerHTML = `
            <div class="state-selector-group">
                <label for="a417-state-selector-for-random">State:</label>
                <input list="a417-states-datalist" id="a417-state-selector-for-random" placeholder="e.g., CA" value="CA">
                <datalist id="a417-states-datalist">${stateOptions}</datalist>
            </div>
            <button id="a417-random-btn"><i class="fa-solid fa-dice"></i> Generate Random</button>
            <label for="a417-excel-input" class="file-input-label"><i class="fa-solid fa-file-excel"></i> Import Excel</label>
            <input type="file" id="a417-excel-input" accept=".xlsx, .xls">
            <button id="a417-generate-current-btn"><i class="fa-solid fa-gears"></i> Generate Current Barcode</button>
        `;

        // --- Add Event Listeners for Accordion and Controls ---
        addAccordionListeners();
        for (const category in fieldDefinitions) {
             fieldDefinitions[category].fields.forEach(field => {
                a417_fields[field.name] = document.getElementById(`a417-${field.name}`);
             });
        }
        
        document.getElementById('a417-random-btn').addEventListener('click', generateRandomData);
        document.getElementById('a417-excel-input').addEventListener('change', importFromExcel);
        document.getElementById('a417-generate-current-btn').addEventListener('click', generateBarcodeForCurrentData);
        document.getElementById('a417-export-all-btn').addEventListener('click', exportAllImages);

        // --- Add Event Listeners for Output Tabs ---
        addTabListeners();
    }

    function addAccordionListeners() {
        const headers = document.querySelectorAll('.accordion-header');
        headers.forEach((header, index) => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                header.classList.toggle('active');
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                    content.classList.remove('active');
                } else {
                    // Set a large enough max-height to accommodate content
                    content.style.maxHeight = content.scrollHeight + 40 + "px"; 
                    content.classList.add('active');
                }
            });
             // Open the first two accordions by default
            if(index < 2) {
                header.click();
            }
        });
    }

    function addTabListeners() {
        const tabLinks = document.querySelectorAll('.output-tabs .tab-link');
        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const tabId = link.getAttribute('data-tab');

                // Deactivate all
                document.querySelectorAll('.output-tabs .tab-link').forEach(l => l.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Activate clicked
                link.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    // ... (All other functions from pdf417-generator.js remain the same) ...
    // e.g., showInputDataAlert, getNumberOfDaysFromBeginnigOfYear, all state-specific functions,
    // generateRandomData, importFromExcel, calculateDlSubfileLength, etc.
    // PASTE ALL THE REMAINING JS FUNCTIONS FROM THE PREVIOUS FILE HERE
    // Starting from showInputDataAlert() and ending with exportAllImages().
    // For brevity, I'm not re-pasting them here, but you MUST do it.

    function showInputDataAlert(message) {
        console.warn("Input Data Alert:", message);
        alert("Lỗi tính toán: " + message);
    }

    function getNumberOfDaysFromBeginnigOfYear(date) {
        if(!date || date.length !== 8) return "000";
        const mdays_leap = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const mdays = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const day = parseInt(date.slice(2, 4));
        const month = parseInt(date.slice(0, 2));
        const year = parseInt(date.slice(-4));
        let total_days = day;
        const daysArray = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? mdays_leap : mdays;
        for (let i = 1; i < month; i++) {
            total_days += daysArray[i];
        }
        return ("00" + total_days).slice(-3);
    }
    function randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }
    function getFormattedDate_MMDDYYYY(date) {
        let year = date.getFullYear();
        let month = (1 + date.getMonth()).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        return month + day + year;
    }
    function getRandomDateByYear(minYear, maxYear) {
        const minDate = new Date(minYear, 0, 1);
        const maxDate = new Date(maxYear, 11, 31);
        return randomDate(minDate, maxDate);
    }

    function getRandomDigit() { return "0123456789"[Math.floor(Math.random() * 10)]; }
    function getRandomNumericString(len) {
        let s = "";
        for (let i = 0; i < len; i++) s += getRandomDigit();
        return s;
    }
    function getRandomLetter() { return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; }
    function getRandomLetterAndDigit() {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    function getRandomStringOfChars(len, chars) {
        let s = "";
        for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
        return s;
    }
    function getRandomLastName() {
        const lastnames = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson"];
        return lastnames[Math.floor(Math.random() * lastnames.length)];
    }
    function getRandomFirstName(sex) {
        const m_names = ["James","Robert","John","Michael","David","William","Richard","Joseph","Thomas","Charles"];
        const f_names = ["Mary","Patricia","Jennifer","Linda","Elizabeth","Barbara","Susan","Jessica","Sarah","Karen"];
        return (sex == "2") ? (f_names[Math.floor(Math.random() * f_names.length)]) : (m_names[Math.floor(Math.random() * m_names.length)]);
    }
    function getRandomMiddleName() { return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random()*26)]; }
    
    function generic_calculate_documentNumber() { a417_fields.customer_id.value = getRandomLetter() + getRandomNumericString(8); }
    function generic_calculate_ICN() { a417_fields.inventory_control.value = getRandomNumericString(12); }
    function generic_calculate_DD() { a417_fields.document_discriminator.value = getRandomLetterAndDigit() + getRandomLetterAndDigit() + getRandomNumericString(10); }

    function AL_calculate_ICN() {
        const docNum = a417_fields.customer_id.value || getRandomNumericString(7);
        if (!a417_fields.customer_id.value) a417_fields.customer_id.value = docNum;
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("AL ICN Error: Incorrect issue date (MMDDYYYY)!"); return; }
        a417_fields.inventory_control.value = `${docNum}${getRandomNumericString(5)}${issueDate.slice(-2)}${getNumberOfDaysFromBeginnigOfYear(issueDate)}01`;
    }

    function AK_calculate_documentNumber() { a417_fields.customer_id.value = getRandomNumericString(7); }
    function AK_calculate_DD() {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("AK DD Error: Incorrect issue date (MMDDYYYY)!"); return; }
        const formattedDate = issueDate.slice(-2) + issueDate.slice(0, 2) + issueDate.slice(2, 4);
        a417_fields.document_discriminator.value = `${getRandomNumericString(7)} ${getRandomNumericString(3)}${formattedDate}${getRandomLetter()}${getRandomLetter()}${getRandomLetter()}${Math.random() > 0.5 ? "-1" : "-0"}`;
    }

    function AZ_calculate_documentNumber() { a417_fields.customer_id.value = getRandomLetter() + getRandomNumericString(8); }
    function AZ_calculate_DD() { a417_fields.document_discriminator.value = "DD" + getRandomLetter() + getRandomNumericString(10); }

    function AR_calculate_documentNumber() { a417_fields.customer_id.value = getRandomNumericString(9); }
    function AR_calculate_DD() { a417_fields.document_discriminator.value = `${getRandomNumericString(9)} ${getRandomNumericString(4)}`; }
    
    function CA_calculate_documentNumber() { a417_fields.customer_id.value = getRandomLetter() + getRandomNumericString(7); }
    function CA_calculate_ICN() { a417_fields.inventory_control.value = a417_fields.issue_date.value.slice(-2) + getNumberOfDaysFromBeginnigOfYear(a417_fields.issue_date.value) + a417_fields.customer_id.value + "0401"; }
    function CA_calculate_DD() {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("CA DD Error: Incorrect issue date!"); return; }
        const fullIssueDate = `${issueDate.slice(0, 2)}/${issueDate.slice(2, 4)}/${issueDate.slice(-4)}`;
        a417_fields.document_discriminator.value = `${fullIssueDate}${getRandomNumericString(5)}/A${getRandomLetter()}FD/${a417_fields.expiry_date.value.slice(-2)}`;
    }

    function CO_calculate_DD() {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("CO DD Error: Incorrect issue date!"); return; }
        const formattedDate = issueDate.slice(0, 4) + issueDate.slice(-2);
        a417_fields.document_discriminator.value = `CODL_0_${formattedDate}_${getRandomNumericString(5)}`;
    }

    function CT_calculate_DD() {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("CT DD Error: Incorrect issue date!"); return; }
        const formattedDate = issueDate.slice(-2) + issueDate.slice(0, 4);
        a417_fields.document_discriminator.value = `${formattedDate}${getRandomNumericString(6)}01MV${getRandomLetter()}${getRandomLetter()}`;
    }

    function DE_calculate_DD() {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("DE DD Error: Incorrect issue date!"); return; }
        const formattedDate = issueDate.slice(-2) + issueDate.slice(0, 4);
        a417_fields.document_discriminator.value = `L${formattedDate}${getRandomNumericString(6)}${getRandomLetter()}`;
    }

    function FL_calculate_documentNumber() { a417_fields.customer_id.value = getRandomLetter() + getRandomNumericString(12); }
    function FL_calculate_ICN() { a417_fields.inventory_control.value = "0100" + getRandomNumericString(12); }
    function FL_calculate_DD() {
        const issueDate = a417_fields.issue_date.value;
        if(!issueDate || issueDate.length !== 8) return;
        a417_fields.document_discriminator.value = getRandomLetter() + getRandomNumericString(2) + issueDate.slice(-2) + issueDate.slice(0, 2) + issueDate.slice(2, 4) + getRandomNumericString(4);
    }

    function ID_calculate_DD() { a417_fields.document_discriminator.value = getRandomNumericString(15); }
    
    function IL_calculate_documentNumber() {
        const familyName = a417_fields.family_name.value;
        if (!familyName) { showInputDataAlert("IL DocNumber Error: Last name required!"); return; }
        a417_fields.customer_id.value = familyName[0].toUpperCase() + getRandomNumericString(11);
    }
    function IL_calculate_ICN() {
        const docNum = a417_fields.customer_id.value;
        if (docNum.length !== 12) { showInputDataAlert("IL ICN Error: Doc number must be 12 chars!"); return; }
        a417_fields.inventory_control.value = `${docNum}IL${getRandomLetter()}${getRandomLetterAndDigit()}${getRandomLetter()}${getRandomLetter()}01`;
    }
    function IL_calculate_DD() {
        const issueDate = a417_fields.issue_date.value;
        if(!issueDate || issueDate.length !== 8) return;
        a417_fields.document_discriminator.value = `${issueDate.slice(-4)}${issueDate.slice(0,2)}${issueDate.slice(2,4)}${getRandomNumericString(3)}${getRandomLetter()}${getRandomLetter()}${getRandomNumericString(4)}`;
    }

    function IN_calculate_DD() {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("IN DD Error: Incorrect issue date!"); return; }
        const formattedDate = issueDate.slice(0, 4) + issueDate.slice(-2);
        const officeCode = getRandomNumericString(3);
        a417_fields.document_discriminator.value = `${formattedDate}${officeCode}00${getRandomNumericString(3)}`;
    }

    function KY_calculate_DD() {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("KY DD Error: Incorrect issue date!"); return; }
        const formattedDate = `${issueDate.slice(-4)}${issueDate.slice(0, 4)}`;
        a417_fields.document_discriminator.value = `${formattedDate}${getRandomNumericString(8)}01111`;
    }

    function ME_calculate_DD() { a417_fields.document_discriminator.value = '0'.repeat(17) + getRandomNumericString(8); }

    function MA_calculate_DD() {
        const issueDate = a417_fields.issue_date.value;
        let revisionDate = a417_fields.card_revision_date.value;
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("MA DD Error: Incorrect issue date!"); return; }
        if (!revisionDate) {
            const randomRevDate = getRandomDateByYear(2020, 2022);
            revisionDate = getFormattedDate_MMDDYYYY(randomRevDate);
            a417_fields.card_revision_date.value = revisionDate;
        }
        a417_fields.document_discriminator.value = issueDate + revisionDate;
    }

    function MI_calculate_DD() { a417_fields.document_discriminator.value = getRandomNumericString(13); }

    function MN_calculate_DD() { a417_fields.document_discriminator.value = '0'.repeat(7) + getRandomNumericString(7); }

    function MO_calculate_DD() {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("MO DD Error: Incorrect issue date!"); return; }
        const issueYear = issueDate.slice(-2);
        a417_fields.document_discriminator.value = `${issueYear}${getRandomNumericString(14)}00${getRandomNumericString(2)}`;
    }

    function MT_calculate_DD() {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("MT DD Error: Incorrect issue date!"); return; }
        const formattedDate = `${issueDate.slice(-4)}${issueDate.slice(0, 4)}`;
        a417_fields.document_discriminator.value = formattedDate + getRandomNumericString(12);
    }

    function NV_calculate_DD() { a417_fields.document_discriminator.value = '0001' + getRandomNumericString(17); }

    function NH_calculate_DD() { a417_fields.document_discriminator.value = '0' + getRandomNumericString(7); }

    function NJ_calculate_DD() {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("NJ DD Error: Incorrect issue date!"); return; }
        const option = getRandomLetter();
        const issueYear = issueDate.slice(-4);
        const days = getNumberOfDaysFromBeginnigOfYear(issueDate);
        a417_fields.document_discriminator.value = `${option}${issueYear}${days}0000${getRandomNumericString(4)}`;
    }

    function NY_calculate_DD() { a417_fields.document_discriminator.value = getRandomStringOfChars(10, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"); }
    
    function NC_calculate_DD() { a417_fields.document_discriminator.value = '001' + getRandomNumericString(7); }

    function OH_calculate_DD() { a417_fields.document_discriminator.value = '0' + getRandomNumericString(8); }

    function OK_calculate_DD() {
        const docNum = a417_fields.customer_id.value || getRandomNumericString(9);
        if(!a417_fields.customer_id.value) a417_fields.customer_id.value = docNum;
        const dob = a417_fields.dob.value;
        const issueDate = a417_fields.issue_date.value;
        if (!dob || dob.length !== 8) { showInputDataAlert("OK DD Error: Incorrect date of birth!"); return; }
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("OK DD Error: Incorrect issue date!"); return; }
        const dobFormatted = dob.slice(0, 4) + dob.slice(-2);
        const issueFormatted = issueDate.slice(0, 4) + issueDate.slice(-2);
        a417_fields.document_discriminator.value = `${docNum}${dobFormatted}${issueFormatted}${getRandomLetter()}`;
    }

    function RI_calculate_DD() { a417_fields.document_discriminator.value = getRandomNumericString(7); }

    function TN_calculate_DD() {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("TN DD Error: Incorrect issue date!"); return; }
        const formattedDate = issueDate.slice(-2) + issueDate.slice(0, 4);
        a417_fields.document_discriminator.value = `${getRandomNumericString(2)}0${formattedDate}${getRandomNumericString(7)}`;
    }
    
    function TX_calculate_documentNumber() { a417_fields.customer_id.value = getRandomNumericString(8); }
    function TX_calculate_ICN() { a417_fields.inventory_control.value = "10000" + getRandomNumericString(6); }
    function TX_calculate_DD() { a417_fields.document_discriminator.value = getRandomNumericString(20); }

    function UT_calculate_DD() { a417_fields.document_discriminator.value = getRandomNumericString(8); }

    function VA_calculate_DD() { a417_fields.document_discriminator.value = 'O' + getRandomNumericString(8); }
    
    function WA_calculate_DD() {
        const docNum = a417_fields.customer_id.value || (getRandomLetter() + getRandomLetter() + getRandomLetter() + getRandomLetterAndDigit() + getRandomLetterAndDigit() + getRandomLetterAndDigit() + getRandomLetter() + getRandomLetter() + getRandomLetterAndDigit() + getRandomLetterAndDigit() + getRandomLetterAndDigit());
        if (!a417_fields.customer_id.value) a417_fields.customer_id.value = docNum;
        let auditInfo = a417_fields.audit_info.value;
        if (!auditInfo) { auditInfo = getRandomLetter() + getRandomNumericString(9); a417_fields.audit_info.value = auditInfo; }
        a417_fields.document_discriminator.value = docNum + auditInfo;
    }

    function WI_calculate_DD() {
        const familyName = a417_fields.family_name.value;
        const issueDate = a417_fields.issue_date.value;
        if (!familyName) { showInputDataAlert("WI DD Error: Family name is required!"); return; }
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("WI DD Error: Incorrect issue date!"); return; }
        const formattedDate = issueDate.slice(-4) + issueDate.slice(0, 4);
        a417_fields.document_discriminator.value = `OT${familyName.charAt(0).toUpperCase()}${formattedDate}${getRandomNumericString(8)}`;
    }

    function WV_calculate_DD() {
        const dob = a417_fields.dob.value;
        const familyName = a417_fields.family_name.value;
        const firstName = a417_fields.first_name.value;
        const expiryDate = a417_fields.expiry_date.value;
        if (!dob || dob.length !== 8) { showInputDataAlert("WV DD Error: Incorrect date of birth!"); return; }
        if (!familyName) { showInputDataAlert("WV DD Error: Family name is required!"); return; }
        if (!firstName) { showInputDataAlert("WV DD Error: First name is required!"); return; }
        if (!expiryDate || expiryDate.length !== 8) { showInputDataAlert("WV DD Error: Incorrect expiry date!"); return; }
        const dobFormatted = dob.slice(0, 4) + dob.slice(-2);
        const expiryFormatted = expiryDate.slice(-2) + expiryDate.slice(2, 4);
        a417_fields.document_discriminator.value = `${dobFormatted}${familyName.charAt(0).toUpperCase()}${firstName.charAt(0).toUpperCase()}${expiryFormatted}`;
    }

    function WY_calculate_DD_and_ICN() {
        const value = '10000' + getRandomNumericString(5);
        a417_fields.document_discriminator.value = value;
        a417_fields.inventory_control.value = value;
    }

    function generateRandomData() {
        const stateSelector = document.getElementById('a417-state-selector-for-random');
        const selectedState = stateSelector.value.toUpperCase().trim();
        if (!selectedState) {
            alert("Vui lòng nhập hoặc chọn một tiểu bang trước.");
            stateSelector.focus();
            return;
        }
        a417_fields.state.value = selectedState;

        a417_fields.sex.value = Math.random() > 0.5 ? "1" : "2";
        a417_fields.family_name.value = getRandomLastName();
        a417_fields.first_name.value = getRandomFirstName(a417_fields.sex.value);
        a417_fields.middle_name.value = getRandomMiddleName();
        
        const cityData = {
            AK: { cities: ["Anchorage", "Fairbanks", "Juneau"], zips: [99501, 99701, 99801]},
            AL: { cities: ["Birmingham", "Montgomery", "Huntsville"], zips: [35203, 36104, 35801]},
            AR: { cities: ["Little Rock", "Fort Smith", "Fayetteville"], zips: [72201, 72901, 72701]},
            AZ: { cities: ["Phoenix", "Tucson", "Mesa"], zips: [85001, 85701, 85201]},
            CA: { cities: ["Los Angeles", "San Diego", "San Jose"], zips: [90001, 92101, 95101]},
            CO: { cities: ["Denver", "Colorado Springs", "Aurora"], zips: [80202, 80903, 80010]},
            CT: { cities: ["Bridgeport", "New Haven", "Hartford"], zips: [6604, 6510, 6103]},
            DE: { cities: ["Wilmington", "Dover", "Newark"], zips: [19801, 19901, 19711]},
            FL: { cities: ["Jacksonville", "Miami", "Tampa"], zips: [32202, 33101, 33602]},
            ID: { cities: ["Boise", "Meridian", "Nampa"], zips: [83702, 83642, 83651]},
            IL: { cities: ["Chicago", "Aurora", "Joliet"], zips: [60601, 60502, 60431]},
            IN: { cities: ["Indianapolis", "Fort Wayne", "Evansville"], zips: [46204, 46802, 47708]},
            KY: { cities: ["Louisville", "Lexington", "Bowling Green"], zips: [40202, 40507, 42101]},
            MA: { cities: ["Boston", "Worcester", "Springfield"], zips: [2108, 1602, 1103]},
            ME: { cities: ["Portland", "Lewiston", "Bangor"], zips: [4101, 4240, 4401]},
            MI: { cities: ["Detroit", "Grand Rapids", "Warren"], zips: [48201, 49503, 48089]},
            MN: { cities: ["Minneapolis", "Saint Paul", "Rochester"], zips: [55401, 55101, 55901]},
            MO: { cities: ["Kansas City", "Saint Louis", "Springfield"], zips: [64105, 63101, 65801]},
            MT: { cities: ["Billings", "Missoula", "Great Falls"], zips: [59101, 59801, 59401]},
            NC: { cities: ["Charlotte", "Raleigh", "Greensboro"], zips: [28202, 27601, 27401]},
            NH: { cities: ["Manchester", "Nashua", "Concord"], zips: [3101, 3060, 3301]},
            NJ: { cities: ["Newark", "Jersey City", "Paterson"], zips: [7102, 7302, 7501]},
            NV: { cities: ["Las Vegas", "Henderson", "Reno"], zips: [89101, 89002, 89501]},
            NY: { cities: ["New York", "Buffalo", "Rochester"], zips: [10001, 14201, 14602]},
            OH: { cities: ["Columbus", "Cleveland", "Cincinnati"], zips: [43215, 44101, 45202]},
            OK: { cities: ["Oklahoma City", "Tulsa", "Norman"], zips: [73102, 74103, 73019]},
            RI: { cities: ["Providence", "Warwick", "Cranston"], zips: [2903, 2886, 2920]},
            TN: { cities: ["Nashville", "Memphis", "Knoxville"], zips: [37201, 38103, 37901]},
            TX: { cities: ["Houston", "San Antonio", "Dallas"], zips: [77002, 78205, 75201]},
            UT: { cities: ["Salt Lake City", "West Valley City", "Provo"], zips: [84101, 84119, 84601]},
            VA: { cities: ["Virginia Beach", "Norfolk", "Chesapeake"], zips: [23450, 23501, 23320]},
            WA: { cities: ["Seattle", "Spokane", "Tacoma"], zips: [98101, 99201, 98402]},
            WI: { cities: ["Milwaukee", "Madison", "Green Bay"], zips: [53202, 53703, 54301]},
            WV: { cities: ["Charleston", "Huntington", "Morgantown"], zips: [25301, 25701, 26501]},
            WY: { cities: ["Cheyenne", "Casper", "Laramie"], zips: [82001, 82601, 82070]}
        };
        const currentCityData = cityData[selectedState] || { cities: ["Anytown"], zips: [12345]};
        const randomIndex = Math.floor(Math.random() * currentCityData.cities.length);
        a417_fields.city.value = currentCityData.cities[randomIndex];
        a417_fields.postal_code.value = String(currentCityData.zips[randomIndex] + Math.floor(Math.random() * 50)).padStart(5,'0');
        a417_fields.street1.value = `${Math.floor(Math.random() * 9000) + 100} ${["Main St", "Oak Ave", "Pine Rd"][Math.floor(Math.random()*3)]}`;

        const today = new Date();
        const birthDate = getRandomDateByYear(1960, 2002);
        const issueDate = getRandomDateByYear(2020, today.getFullYear());
        const expiryYears = (selectedState === 'AZ') ? 12 : 8;
        const expiryDate = new Date(issueDate.getFullYear() + expiryYears, issueDate.getMonth(), issueDate.getDate());
        a417_fields.dob.value = getFormattedDate_MMDDYYYY(birthDate);
        a417_fields.issue_date.value = getFormattedDate_MMDDYYYY(issueDate);
        a417_fields.expiry_date.value = getFormattedDate_MMDDYYYY(expiryDate);
        a417_fields.height.value = `0${(Math.floor(Math.random() * 16) + 60)}`;
        a417_fields.weight_pounds.value = (Math.floor(Math.random() * 100) + 120).toString();
        
        const stateGenerators = {
            'AK': [AK_calculate_documentNumber, generic_calculate_ICN, AK_calculate_DD],
            'AL': [generic_calculate_documentNumber, AL_calculate_ICN, generic_calculate_DD],
            'AR': [AR_calculate_documentNumber, generic_calculate_ICN, AR_calculate_DD],
            'AZ': [AZ_calculate_documentNumber, generic_calculate_ICN, AZ_calculate_DD],
            'CA': [CA_calculate_documentNumber, CA_calculate_ICN, CA_calculate_DD],
            'CO': [generic_calculate_documentNumber, generic_calculate_ICN, CO_calculate_DD],
            'CT': [generic_calculate_documentNumber, generic_calculate_ICN, CT_calculate_DD],
            'DE': [generic_calculate_documentNumber, generic_calculate_ICN, DE_calculate_DD],
            'FL': [FL_calculate_documentNumber, FL_calculate_ICN, FL_calculate_DD],
            'ID': [generic_calculate_documentNumber, generic_calculate_ICN, ID_calculate_DD],
            'IL': [IL_calculate_documentNumber, IL_calculate_ICN, IL_calculate_DD],
            'IN': [generic_calculate_documentNumber, generic_calculate_ICN, IN_calculate_DD],
            'KY': [generic_calculate_documentNumber, generic_calculate_ICN, KY_calculate_DD],
            'MA': [generic_calculate_documentNumber, generic_calculate_ICN, MA_calculate_DD],
            'ME': [generic_calculate_documentNumber, generic_calculate_ICN, ME_calculate_DD],
            'MI': [generic_calculate_documentNumber, generic_calculate_ICN, MI_calculate_DD],
            'MN': [generic_calculate_documentNumber, generic_calculate_ICN, MN_calculate_DD],
            'MO': [generic_calculate_documentNumber, generic_calculate_ICN, MO_calculate_DD],
            'MT': [generic_calculate_documentNumber, generic_calculate_ICN, MT_calculate_DD],
            'NC': [generic_calculate_documentNumber, generic_calculate_ICN, NC_calculate_DD],
            'NH': [generic_calculate_documentNumber, generic_calculate_ICN, NH_calculate_DD],
            'NJ': [generic_calculate_documentNumber, generic_calculate_ICN, NJ_calculate_DD],
            'NV': [generic_calculate_documentNumber, generic_calculate_ICN, NV_calculate_DD],
            'NY': [generic_calculate_documentNumber, generic_calculate_ICN, NY_calculate_DD],
            'OH': [generic_calculate_documentNumber, generic_calculate_ICN, OH_calculate_DD],
            'OK': [generic_calculate_documentNumber, generic_calculate_ICN, OK_calculate_DD],
            'RI': [generic_calculate_documentNumber, generic_calculate_ICN, RI_calculate_DD],
            'TN': [generic_calculate_documentNumber, generic_calculate_ICN, TN_calculate_DD],
            'TX': [TX_calculate_documentNumber, TX_calculate_ICN, TX_calculate_DD],
            'UT': [generic_calculate_documentNumber, generic_calculate_ICN, UT_calculate_DD],
            'VA': [generic_calculate_documentNumber, generic_calculate_ICN, VA_calculate_DD],
            'WA': [generic_calculate_documentNumber, generic_calculate_ICN, WA_calculate_DD],
            'WI': [generic_calculate_documentNumber, generic_calculate_ICN, WI_calculate_DD],
            'WV': [generic_calculate_documentNumber, generic_calculate_ICN, WV_calculate_DD],
            'WY': [generic_calculate_documentNumber, WY_calculate_DD_and_ICN, WY_calculate_DD_and_ICN]
        };

        const generators = stateGenerators[selectedState] || [generic_calculate_documentNumber, generic_calculate_ICN, generic_calculate_DD];
        generators.forEach(func => func());
        
        alert(`Đã tạo dữ liệu ngẫu nhiên cho tiểu bang: ${selectedState}`);
    }

    function getCurrentData() {
        const data = {};
        for(const name in a417_fields) { data[name] = a417_fields[name].value; }
        return data;
    }

    function importFromExcel(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                if (jsonData.length === 0) { alert("No data found in Excel file."); return; }
                a417_all_records = [];
                a417_barcode_images = {};
                const excelMapping = {
                    'Last Name': 'family_name', 'First Name': 'first_name', 'Middle Name': 'middle_name',
                    'Date of Birth': 'dob', 'Expiration Date': 'expiry_date', 'Issue Date': 'issue_date',
                    'ID Number': 'customer_id', 'Address 1': 'street1', 'City': 'city', 'State': 'state',
                    'Postal Code': 'postal_code', 'Sex': 'sex', 'Eye Color': 'eye_color', 'Height': 'height',
                    'Hair Color': 'hair_color', 'Weight (lbs)': 'weight_pounds', 'Country': 'country',
                    'Document Discriminator': 'document_discriminator', 'Card Revision Date': 'card_revision_date',
                    'Inventory control': 'inventory_control', 'Vehicle Class': 'vehicle_class',
                    'Filename': 'filename'
                };
                jsonData.forEach(row => {
                    let recordData = getCurrentData();
                     for (const excelHeader in excelMapping) {
                        if (row[excelHeader] !== undefined) {
                            const fieldName = excelMapping[excelHeader];
                            let value = String(row[excelHeader]).trim();
                            if (['Date of Birth', 'Expiration Date', 'Issue Date'].includes(excelHeader) && value) {
                                const dt = new Date(value);
                                if (!isNaN(dt)) {
                                    value = (dt.getMonth()+1).toString().padStart(2,'0') + dt.getDate().toString().padStart(2,'0') + dt.getFullYear();
                                }
                            } else if(fieldName === 'sex') {
                                const val_lower = value.toLowerCase();
                                if (['male', 'm', '1', 'nam'].includes(val_lower)) value = "1";
                                else if (['female', 'f', '2', 'nữ'].includes(val_lower)) value = "2";
                                else value = "9";
                            }
                            recordData[fieldName] = value;
                        }
                    }
                    a417_all_records.push(recordData);
                });
                generateAndDisplayAllBarcodes();
                alert(`Successfully imported and generated ${a417_all_records.length} barcodes!`);
            } catch (err) {
                console.error(err);
                alert("Error processing Excel file: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }
    
    function calculateDlSubfileLength(record_data) {
        const field_to_id = {'customer_id': 'DAQ','family_name_trunc': 'DDE','first_name': 'DAC','first_name_trunc': 'DDF','middle_name': 'DAD','middle_name_trunc': 'DDG','name_suffix': 'DCU','dob': 'DBB','expiry_date': 'DBA','issue_date': 'DBD','family_name': 'DCS','document_discriminator': 'DCF','country': 'DCG','street1': 'DAG','street2': 'DAH','city': 'DAI','state': 'DAJ','postal_code': 'DAK','sex': 'DBC','eye_color': 'DAY','height': 'DAU','hair_color': 'DAZ','race': 'DCL','weight_pounds': 'DAW','weight_kg': 'DAX','weight_range': 'DCE','vehicle_class': 'DCA','restrictions': 'DCB','endorsements': 'DCD','std_vehicle_class': 'DCM','std_restriction': 'DCO','std_endorsement': 'DCN','vehicle_class_desc': 'DCP','restriction_desc': 'DCR','endorsement_desc': 'DCQ','compliance_type': 'DDA','card_revision_date': 'DDB','limited_duration': 'DDD','hazmat_expiry': 'DDC','under_18': 'DDH','under_19': 'DDI','under_21': 'DDJ','organ_donor': 'DDK','veteran': 'DDL','alias_family': 'DBN','alias_given': 'DBG','alias_suffix': 'DBS','place_of_birth': 'DCI','audit_info': 'DCJ','inventory_control': 'DCK'};
        let total_length = 1; 
        for (const field_name in field_to_id) {
            const value = record_data[field_name] || '';
            if (value) total_length += field_to_id[field_name].length + String(value).length + 1;
        }
        return total_length;     
    }
    
    function generateAamvaDataString(record_data) {
         const dl_length = String(record_data.dl_subfile_length || '0').padStart(4, '0');
         let data = `@\n\u001e\u000dANSI ${record_data.iin || ''.padEnd(6)}`+
                    `${(record_data.aamva_version || '').padStart(2, '0')}`+
                    `${(record_data.jurisdiction_version || '').padStart(2, '0')}`+
                    `${(record_data.subfile_count || '').padStart(2, '0')}`+
                    `DL0042${dl_length}DL`;
        const data_elements = [
            ['DAQ', 'customer_id'],['DCS', 'family_name'], ['DAC', 'first_name'], ['DAD', 'middle_name'], ['DBD', 'issue_date'],
            ['DBB', 'dob'], ['DBA', 'expiry_date'], ['DBC', 'sex'], ['DAY', 'eye_color'], ['DAU', 'height'],
            ['DAG', 'street1'], ['DAI', 'city'], ['DAJ', 'state'], ['DAK', 'postal_code'], ['DCF', 'document_discriminator'],
            ['DCG', 'country'], ['DDE', 'family_name_trunc'], ['DDF', 'first_name_trunc'], ['DDG', 'middle_name_trunc'],
            ['DCA', 'vehicle_class'],['DCB', 'restrictions'],['DCD', 'endorsements'],['DDB', 'card_revision_date'],
            ['DDK', 'organ_donor'],['DCK', 'inventory_control']
        ];
        for (const [element_id, field_name] of data_elements) {
            const value = String(record_data[field_name] || '');
            if (value) data += `${element_id}${value}\n`;
        }
        data += "\u000d";
        return data;
    }

    function generateBarcode(dataString, scale, padding) {
        const canvas = document.createElement('canvas');
        try {
            bwipjs.toCanvas(canvas, {
                bcid: 'pdf417', text: dataString, scale: scale,
                padding: padding, columns: 13, eclevel: 5
            });
            return canvas;
        } catch (e) {
            console.error("Barcode generation error:", e);
            return null;
        }
    }

    function generateAndDisplayAllBarcodes() {
        const scale = parseInt(document.getElementById('a417-scale-input').value) || 4;
        const padding = parseInt(document.getElementById('a417-padding-input').value) || 10;
        a417_all_records.forEach((record, index) => {
            const dl_length = calculateDlSubfileLength(record);
            record.dl_subfile_length = String(dl_length).padStart(4, '0');
            const dataString = generateAamvaDataString(record);
            const canvas = generateBarcode(dataString, scale, padding);
            a417_barcode_images[index] = canvas;
        });
        populateRecordsTable();
    }
    
    function populateRecordsTable() {
        recordsTableBody.innerHTML = '';
        a417_all_records.forEach((record, index) => {
            const fullName = `${record.first_name || ''} ${record.family_name || ''}`.trim();
            const filename = record.filename || record.customer_id || `record_${index}`;
            const tr = document.createElement('tr');
            tr.dataset.index = index;
            tr.innerHTML = `<td>${filename}.png</td><td>${fullName}</td>`;
            tr.addEventListener('click', () => onRecordSelect(index));
            recordsTableBody.appendChild(tr);
        });
    }
    
    function onRecordSelect(index) {
        Array.from(recordsTableBody.children).forEach(row => row.classList.remove('selected'));
        recordsTableBody.querySelector(`[data-index='${index}']`).classList.add('selected');
        const recordData = a417_all_records[index];
        const canvas = a417_barcode_images[index];
        for(const name in a417_fields) {
            if(a417_fields[name]) a417_fields[name].value = recordData[name] || '';
        }
        if (canvas) {
            barcodePreview.innerHTML = '';
            const img = document.createElement('img');
            img.src = canvas.toDataURL();
            barcodePreview.appendChild(img);
        } else {
            barcodePreview.innerHTML = '<p>Error generating barcode for this record.</p>';
        }
        const dataString = generateAamvaDataString(recordData);
        displayFormattedData(recordData);
        rawDataText.value = "RAW AAMVA DATA STRING:\n====================\n" + dataString.replace(/\n/g, '\\n\n').replace(/\u001e/g, '<RS>').replace(/\u000d/g, '<CR>');
    }

    function displayFormattedData(data) {
        let text = `AAMVA 2020 DL/ID DATA\n====================\n`;
        text += `NAME: ${data.first_name || ''} ${data.family_name || ''}\n`;
        text += `DOB: ${data.dob || ''}\n`;
        text += `ADDRESS: ${data.street1 || ''}, ${data.city || ''}, ${data.state || ''} ${data.postal_code || ''}\n`;
        text += `ID: ${data.customer_id || ''}\n`;
        text += `ISS/EXP: ${data.issue_date || ''} / ${data.expiry_date || ''}\n`;
        formattedDataText.value = text;
    }

    function generateBarcodeForCurrentData() {
        try {
            const currentData = getCurrentData();
            const dl_length = calculateDlSubfileLength(currentData);
            currentData.dl_subfile_length = String(dl_length).padStart(4, '0');
            if(a417_fields.dl_subfile_length) a417_fields.dl_subfile_length.value = currentData.dl_subfile_length;
            
            const dataString = generateAamvaDataString(currentData);
            const scale = parseInt(document.getElementById('a417-scale-input').value) || 4;
            const padding = parseInt(document.getElementById('a417-padding-input').value) || 10;
            const canvas = generateBarcode(dataString, scale, padding);
            if(canvas) {
                barcodePreview.innerHTML = '';
                const img = document.createElement('img');
                img.src = canvas.toDataURL();
                barcodePreview.appendChild(img);
                const selectedRow = recordsTableBody.querySelector('tr.selected');
                if(selectedRow) {
                    const index = parseInt(selectedRow.dataset.index);
                    a417_all_records[index] = currentData;
                    a417_barcode_images[index] = canvas;
                    populateRecordsTable();
                    recordsTableBody.querySelector(`[data-index='${index}']`).classList.add('selected');
                }
                alert("Barcode generated/updated successfully for current data!");
            } else {
                alert("Failed to generate barcode.");
            }
        } catch (e) {
            alert("Error: " + e.message);
        }
    }
    
    async function exportAllImages() {
        if (a417_all_records.length === 0) {
            alert("No data to export. Please import from Excel first.");
            return;
        }
        try {
            const useFixedSize = document.getElementById('a417-fixed-size-check').checked;
            const scale = parseInt(document.getElementById('a417-scale-input').value);
            const fixedW = useFixedSize ? parseInt(document.getElementById('a417-fixed-width-input').value) : 0;
            const fixedH = useFixedSize ? parseInt(document.getElementById('a417-fixed-height-input').value) : 0;
            if (useFixedSize && (fixedW <= 0 || fixedH <= 0)) {
                throw new Error("Fixed width and height must be positive numbers.");
            }
            const canvasesToExport = [];
            const filenamesToExport = [];
            for (let i = 0; i < a417_all_records.length; i++) {
                const record = a417_all_records[i];
                const dataString = generateAamvaDataString(record);
                const barcodeCanvas = generateBarcode(dataString, scale, 0);
                if (!barcodeCanvas) continue;
                const finalCanvas = document.createElement('canvas');
                const ctx = finalCanvas.getContext('2d');
                if(useFixedSize) {
                    finalCanvas.width = fixedW;
                    finalCanvas.height = fixedH;
                    const x = (fixedW - barcodeCanvas.width) / 2;
                    const y = (fixedH - barcodeCanvas.height) / 2;
                    ctx.drawImage(barcodeCanvas, x, y);
                } else {
                    finalCanvas.width = barcodeCanvas.width;
                    finalCanvas.height = barcodeCanvas.height;
                    ctx.drawImage(barcodeCanvas, 0, 0);
                }
                const filename = `${record.filename || record.customer_id || `record_${i}`}.png`;
                canvasesToExport.push(finalCanvas);
                filenamesToExport.push(filename);
            }
            await exportCanvasesToDirectory(canvasesToExport, filenamesToExport);
        } catch (e) {
            alert("Export error: " + e.message);
        }
    }
    
    buildFormAndControls();
    generateRandomData();
}