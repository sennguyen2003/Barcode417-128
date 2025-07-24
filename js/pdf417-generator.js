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
        const STATE_IIN_MAP = {
        'AL': '636033', 'AK': '636059', 'AZ': '636026', 'AR': '636021', 
        'CA': '636014', 'CO': '636020', 'CT': '636006', 'DE': '636011',
         'DC': '636043', 'FL': '636010', 'GA': '636055', 'HI': '636047', 
         'ID': '636050', 'IL': '636035', 'IN': '636037', 'IA': '636018', 
         'KS': '636022', 'KY': '636046', 'LA': '636007', 'ME': '636041', 
         'MD': '636003', 'MA': '636002', 'MI': '636032', 'MN': '636038', 
         'MS': '636051', 'MO': '636030', 'MT': '636008', 'NE': '636054', 
         'NV': '636049', 'NH': '636039', 'NJ': '636036', 'NM': '636009', 
         'NY': '636001', 'NC': '636004', 'ND': '636034', 'OH': '636023',
          'OK': '636058', 'OR': '636029', 'PA': '636025', 'RI': '636052', 
          'SC': '636005', 'SD': '636042', 'TN': '636053', 'TX': '636015', 'UT': '636040', 
        'VT': '636024', 'VA': '636000', 'WA': '636045', 'WV': '636061', 'WI': '636031', 'WY': '636060'
    };

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
            {label: "Family Name (DCS):", name: "family_name", calculable: true}, 
            {label: "First Name (DAC):", name: "first_name", calculable: true},
            {label: "Middle Name(s) (DAD):", name: "middle_name"}, 
            {label: "Name Suffix (DCU):", name: "name_suffix"},
            {label: "Date of Birth (DBB):", name: "dob", placeholder: "MMDDYYYY", calculable: true},
            {label: "Document Expiration Date (DBA):", name: "expiry_date", placeholder: "MMDDYYYY", calculable: true},
            {label: "Document Issue Date (DBD):", name: "issue_date", placeholder: "MMDDYYYY", calculable: true},
            {label: "Customer ID Number (DAQ):", name: "customer_id", calculable: true}, 
            {label: "Document Discriminator (DCF):", name: "document_discriminator", calculable: true},
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
            // Đã có sẵn, chỉ cần đảm bảo calculable: true
            {label: "Audit Information (DCJ):", name: "audit_info", calculable: true}, 
            // Thêm trường mới, không có mã AAMVA nên để trống
            {label: "Issuing Office (IOE):", name: "issuing_office", calculable: true}, 
            {label: "Inventory Control (DCK):", name: "inventory_control", calculable: true}
        ]},
        "Optional Fields": { icon: "fa-solid fa-plus-square", fields: [
            {label: "Alias Family Name (DBN):", name: "alias_family"},
            {label: "Alias Given Name (DBG):", name: "alias_given"},
            {label: "Alias Suffix Name (DBS):", name: "alias_suffix"}
        ]}
    };

    function buildFormAndControls() {
            function updateIinBasedOnState() {
        const selectedState = a417_fields.state.value.toUpperCase();
        const iin = STATE_IIN_MAP[selectedState] || '636000'; // Fallback to a generic IIN
        a417_fields.iin.value = iin;
    }

        let accordionHtml = '';
        for (const category in fieldDefinitions) {
            const categoryInfo = fieldDefinitions[category];
            accordionHtml += `<div class="accordion-item">
                <button class="accordion-header"><i class="${categoryInfo.icon}"></i> ${category}</button>
                <div class="accordion-content">
                    <div class="grid-3-col">`;
            
            categoryInfo.fields.forEach(field => {
                const elementId = field.label.match(/\((.*?)\)/)?.[1] || '';
                
                let labelHtml = `<label for="a417-${field.name}" class="${field.calculable ? 'label-with-calculator' : ''}">
                                     <span>${field.label}</span>`;
                if (field.calculable) {
                    labelHtml += `<button class="field-calculator-btn" data-field-name="${field.name}" title="Generate for this field">
                                      <i class="fa-solid fa-calculator"></i>
                                  </button>`;
                }
                labelHtml += `</label>`;
                accordionHtml += labelHtml;

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
         for (const category in fieldDefinitions) {
             fieldDefinitions[category].fields.forEach(field => {
                const element = document.getElementById(`a417-${field.name}`);
                if (element) {
                    a417_fields[field.name] = element;
                } else {
                    console.warn(`Element with id 'a417-${field.name}' not found.`);
                }
             });
        }
        // ==

        const states = ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "DC","ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"];
        let stateOptions = states.map(s => `<option value="${s}"></option>`).join('');
        
        controlsContainer.innerHTML = `
            <div class="state-selector-group">
                <label for="a417-state-selector-for-random">State:</label>
                <input list="a417-states-datalist" id="a417-state-selector-for-random" placeholder="e.g., CA" value="CA">
                <datalist id="a417-states-datalist">${stateOptions}</datalist>
            </div>
            <button id="a417-fill-all-btn"><i class="fa-solid fa-wand-magic-sparkles"></i> Fill All Fields</button>
            <label for="a417-excel-input" class="file-input-label"><i class="fa-solid fa-file-excel"></i> Import Excel</label>
            <input type="file" id="a417-excel-input" accept=".xlsx, .xls">
            <button id="a417-generate-current-btn"><i class="fa-solid fa-gears"></i> Generate Barcode</button>
        `;
        addAccordionListeners();
        addFieldCalculatorListeners();
        
        document.getElementById('a417-fill-all-btn').addEventListener('click', generateAllRandomData);
        document.getElementById('a417-excel-input').addEventListener('change', importFromExcel);
        document.getElementById('a417-generate-current-btn').addEventListener('click', generateBarcodeForCurrentData);
        document.getElementById('a417-export-all-btn').addEventListener('click', exportAllImages);
        
        addTabListeners();
                // --- ADDED FOR IIN AUTO-UPDATE ---
        const stateSelector = document.getElementById('a417-state-selector-for-random');
        stateSelector.addEventListener('change', () => {
            // Update the main state field when the selector changes, then update IIN
            a417_fields.state.value = stateSelector.value;
            updateIinBasedOnState();
        });
        if (a417_fields.state) {
            a417_fields.state.addEventListener('change', updateIinBasedOnState);
        }
        // --- END OF ADDED CODE ---

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
                    content.style.maxHeight = content.scrollHeight + 40 + "px"; 
                    content.classList.add('active');
                }
            });
            if(index < 2) {
                header.click();
            }
        });
        // SỬA LỖI 1: Xóa văn bản tiếng Việt và dấu ngoặc nhọn bị thừa ở đây
    }

    function addTabListeners() {
        const tabLinks = document.querySelectorAll('.output-tabs .tab-link');
        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const tabId = link.getAttribute('data-tab');
                document.querySelectorAll('.output-tabs .tab-link').forEach(l => l.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                link.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
    
    function addFieldCalculatorListeners() {
        accordionContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.field-calculator-btn');
            if (!button) return;

            const fieldName = button.dataset.fieldName;
            const state = document.getElementById('a417-state-selector-for-random').value.toUpperCase();

            const generator = (fieldGenerators.specific[state] && fieldGenerators.specific[state][fieldName]) 
                              || fieldGenerators.generic[fieldName];
            
            if (generator) {
                generator();
            } else {
                console.warn(`No generator found for field '${fieldName}' in state '${state}'`);
            }
        });
    }
    
    // --- UTILITY FUNCTIONS ---
        function get_letter_corresponding_month(month) {
        const letters = "ABCDEFGHIJKL";
        return letters[parseInt(month) - 1];
    }
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
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    // --- START: STATE-SPECIFIC GENERATORS (All functions are defined here) ---
    const generic_calculate_documentNumber = () => { a417_fields.customer_id.value =getRandomNumericString(8); };
    const generic_calculate_ICN = () => { a417_fields.inventory_control.value = getRandomNumericString(12); };
    const generic_calculate_DD = () => { a417_fields.document_discriminator.value = getRandomLetterAndDigit() + getRandomLetterAndDigit() + getRandomNumericString(10); };
    
    const randomize_family_name = () => { a417_fields.family_name.value = getRandomLastName(); };
    const randomize_first_name = () => { a417_fields.first_name.value = getRandomFirstName(a417_fields.sex.value); };
    const randomize_dob = () => { a417_fields.dob.value = getFormattedDate_MMDDYYYY(getRandomDateByYear(1960, 2002)); };
    const randomize_issue_date = () => { 
        const today = new Date();
        a417_fields.issue_date.value = getFormattedDate_MMDDYYYY(getRandomDateByYear(2020, today.getFullYear())); 
    };
        const randomize_expiry_date = () => {
        const issueDateStr = a417_fields.issue_date.value;
        if (!issueDateStr || issueDateStr.length !== 8) {
            randomize_issue_date();
        }
        const updatedIssueDateStr = a417_fields.issue_date.value;
        const month = parseInt(updatedIssueDateStr.substring(0, 2)) - 1;
        const day = parseInt(updatedIssueDateStr.substring(2, 4));
        const year = parseInt(updatedIssueDateStr.substring(4, 8));
        const issueDate = new Date(year, month, day);

        const state = document.getElementById('a417-state-selector-for-random').value.toUpperCase();
        const expiryYears = (state === 'AZ') ? 12 : 8;
        const expiryDate = new Date(issueDate.getFullYear() + expiryYears, issueDate.getMonth(), issueDate.getDate());
        a417_fields.expiry_date.value = getFormattedDate_MMDDYYYY(expiryDate);
    };

/*
 $$$$  $$      $$$$  $$$$$   $$$$  $$   $  $$$$ 
$$  $$ $$     $$  $$ $$  $$ $$  $$ $$$ $$ $$  $$
$$$$$$ $$     $$$$$$ $$$$$  $$$$$$ $$ $ $ $$$$$$
$$  $$ $$     $$  $$ $$  $$ $$  $$ $$   $ $$  $$
$$  $$ $$$$$$ $$  $$ $$$$$  $$  $$ $$   $ $$  $$
*/

// ============== ALABAMA (AL) ============== //    
    const AL_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomNumericString(8);
    };
    const AL_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        const issueDate = a417_fields.issue_date.value;
        if (!docNum || docNum.length !== 8) {
            showInputDataAlert("AL ICN Error: A valid 8-char Document Number is required!");
            return;
        }
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("AL ICN Error: Incorrect issue date!");
            return;
        }
        const days = ("00" + (parseInt(getNumberOfDaysFromBeginnigOfYear(issueDate)) + 4)).slice(-3);
        a417_fields.inventory_control.value = `${docNum}${getRandomNumericString(5)}${issueDate.slice(-2)}${days}01`;
    };
    // --- NEW FUNCTION FOR ALABAMA'S EXPIRY DATE ---
    const AL_calculate_expiry_date = () => {
        const issueDateStr = a417_fields.issue_date.value;
        if (!issueDateStr || issueDateStr.length !== 8) {
            showInputDataAlert("AL Expiry Date Error: A valid Issue Date is required first.");
            return;
        }
        const month = issueDateStr.slice(0, 2);
        // Ensure day is at least '01' after subtracting
        let day = parseInt(issueDateStr.slice(2, 4)) - 1;
        if (day < 1) day = 1; 
        const year = (parseInt(issueDateStr.slice(-4)) + 4).toString();
        a417_fields.expiry_date.value = month + day.toString().padStart(2, '0') + year;
    };
    
   /* const AL_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        const issueDate = a417_fields.issue_date.value;
        if (!docNum || docNum.length !== 8) {
            showInputDataAlert("AL ICN Error: A valid 8-char Document Number is required!");
            return;
        }
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("AL ICN Error: Incorrect issue date!");
            return;
        }
        const days = ("00" + (parseInt(getNumberOfDaysFromBeginnigOfYear(issueDate)) + 4)).slice(-3);
        a417_fields.inventory_control.value = `${docNum}${getRandomNumericString(5)}${issueDate.slice(-2)}${days}01`;
    };*/

   /*
 $$$$  $$      $$$$   $$$$  $$  $$  $$$$
$$  $$ $$     $$  $$ $$     $$ $$  $$  $$
$$$$$$ $$     $$$$$$  $$$$  $$$$   $$$$$$
$$  $$ $$     $$  $$     $$ $$ $$  $$  $$
$$  $$ $$$$$$ $$  $$  $$$$  $$  $$ $$  $$
*/
   const AK_calculate_documentNumber = () => {
    a417_fields.customer_id.value = getRandomNumericString(7);
        };

        const AK_calculate_ICN = () => {
            a417_fields.inventory_control.value = "1000" + getRandomNumericString(6);
        };

        const AK_calculate_DD = () => {
            const issueDate = a417_fields.issue_date.value;
            if (!issueDate || issueDate.length !== 8) {
                showInputDataAlert("DD calculation error. Incorrect issue date!");
                return;
            }

            const randLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
            const ending = Math.random() < 0.5 ? "-0" : "-1";

            const dd = "8" + getRandomNumericString(6) + " " +
                getRandomNumericString(3) +
                issueDate.slice(-2) + issueDate.slice(0, 2) + issueDate.slice(2, 4) +
                randLetter() + randLetter() + randLetter() +
                ending;

            a417_fields.document_discriminator.value = dd;
        };


/*
 $$$$  $$$$$  $$$$$$ $$$$$$  $$$$  $$  $$  $$$$
$$  $$ $$  $$   $$      $$  $$  $$ $$$ $$ $$  $$
$$$$$$ $$$$$    $$     $$   $$  $$ $$ $$$ $$$$$$
$$  $$ $$  $$   $$    $$    $$  $$ $$  $$ $$  $$
$$  $$ $$  $$ $$$$$$ $$$$$$  $$$$  $$  $$ $$  $$
*/

// =============== ARIZONA (AZ) ============== //   
 const AZ_calculate_documentNumber = () => {
        a417_fields.customer_id.value = "D" + getRandomNumericString(8);
    };
    const AZ_calculate_ICN = () => {
        a417_fields.inventory_control.value = "48" + getRandomNumericString(9);
    };
    const AZ_calculate_DD = () => {
        const birthDate = a417_fields.dob.value;
        const firstName = a417_fields.first_name.value;
        const lastName = a417_fields.family_name.value;

        if (!birthDate || birthDate.length !== 8) {
            showInputDataAlert("AZ DD calculation error. Incorrect birth date!");
            return;
        }
        if (!firstName) {
            showInputDataAlert("AZ DD calculation error. Incorrect First name!");
            return;
        }
        if (!lastName) {
            showInputDataAlert("AZ DD calculation error. Incorrect Last name!");
            return;
        }

        a417_fields.document_discriminator.value =
            getRandomNumericString(4) +
            getRandomLetter() + getRandomLetter() +
            getRandomNumericString(3) +
            lastName.charAt(0).toUpperCase() +
            getRandomNumericString(4) +
            firstName.charAt(0).toUpperCase() +
            birthDate.slice(-1);
    };

 /*
 $$$$  $$$$$  $$  $$  $$$$  $$  $$  $$$$   $$$$   $$$$
$$  $$ $$  $$ $$ $$  $$  $$ $$$ $$ $$     $$  $$ $$
$$$$$$ $$$$$  $$$$   $$$$$$ $$ $$$  $$$$  $$$$$$  $$$$
$$  $$ $$  $$ $$ $$  $$  $$ $$  $$     $$ $$  $$     $$
$$  $$ $$  $$ $$  $$ $$  $$ $$  $$  $$$$  $$  $$  $$$$
*/
    const AR_calculate_documentNumber = () => {
        a417_fields.customer_id.value = "9" + getRandomNumericString(8);
    };
    const AR_calculate_ICN = () => {
        a417_fields.inventory_control.value = "021011" + getRandomNumericString(10);
    };
    const AR_calculate_DD = () => {
        a417_fields.document_discriminator.value = getRandomNumericString(9) + " " + getRandomNumericString(4);
    };
    
 /*
 $$$$   $$$$  $$     $$$$$$ $$$$$$  $$$$  $$$$$  $$  $$ $$$$$$  $$$$ 
$$  $$ $$  $$ $$       $$   $$     $$  $$ $$  $$ $$$ $$   $$   $$  $$
$$     $$$$$$ $$       $$   $$$$   $$  $$ $$$$$  $$ $$$   $$   $$$$$$
$$  $$ $$  $$ $$       $$   $$     $$  $$ $$  $$ $$  $$   $$   $$  $$
 $$$$  $$  $$ $$$$$$ $$$$$$ $$      $$$$  $$  $$ $$  $$ $$$$$$ $$  $$
*/
    const CA_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomLetter() + getRandomNumericString(7);
    };
    const CA_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        const issueDate = a417_fields.issue_date.value;
        if (!docNum || docNum.length !== 8) {
            showInputDataAlert("CA ICN Error: Incorrect document number (must be 8 chars).");
            return;
        }
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("CA ICN Error: Incorrect issue date.");
            return;
        }
        a417_fields.inventory_control.value = issueDate.slice(-2) + getNumberOfDaysFromBeginnigOfYear(issueDate) + docNum + "0401";
    };
    const CA_calculate_DD = () => {
        const issueDate = a417_fields.issue_date.value;
        const expiryDate = a417_fields.expiry_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("CA DD Error: Incorrect issue date!");
            return;
        }
        if (!expiryDate || expiryDate.length !== 8) {
            showInputDataAlert("CA DD Error: Incorrect expiry date!");
            return;
        }
        const suff_alphabet = ["AA", "BB", "DD"];
        const suffix = suff_alphabet[Math.floor(Math.random() * suff_alphabet.length)];
        const fullIssueDate = `${issueDate.slice(0, 2)}/${issueDate.slice(2, 4)}/${issueDate.slice(-4)}`;
        a417_fields.document_discriminator.value = `${fullIssueDate}${getRandomNumericString(5)}/${suffix}FD/${expiryDate.slice(-2)}`;
    };

  /*
 $$$$   $$$$  $$      $$$$  $$$$$   $$$$  $$$$$   $$$$
$$  $$ $$  $$ $$     $$  $$ $$  $$ $$  $$ $$  $$ $$  $$
$$     $$  $$ $$     $$  $$ $$$$$  $$$$$$ $$  $$ $$  $$
$$  $$ $$  $$ $$     $$  $$ $$  $$ $$  $$ $$  $$ $$  $$
 $$$$   $$$$  $$$$$$  $$$$  $$  $$ $$  $$ $$$$$   $$$$
*/


// ================== COLORADO (CO) ================= //
    const CO_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomNumericString(9);
    };
    const CO_calculate_DD = () => {
        a417_fields.document_discriminator.value = getRandomNumericString(7);

    };
     const CO_calculate_ICN = () => {
        const issueDateStr = a417_fields.issue_date.value;
        if (!issueDateStr || issueDateStr.length !== 8) {
            showInputDataAlert("CO ICN calculation error: An incorrect issue date is provided!");
            return;
        }

        const issueDate = new Date(
            parseInt(issueDateStr.slice(4, 8)),
            parseInt(issueDateStr.slice(0, 2)) - 1,
            parseInt(issueDateStr.slice(2, 4))
        );
        issueDate.setDate(issueDate.getDate() + 1);

        const month = (issueDate.getMonth() + 1).toString().padStart(2, '0');
        const day = issueDate.getDate().toString().padStart(2, '0');
        const year = issueDate.getFullYear().toString().slice(-2); // Get last 2 digits of year

        const formattedDate = `${month}${day}${year}`; // MMDDYY format

        a417_fields.inventory_control.value = `CODL_0_${formattedDate}_${getRandomNumericString(5)}`;
    };
    /*function CO_calculate_AUDIT() {
    var issueDate = document.getElementById("inputIssueDate").value;
    if (issueDate.length != 8) {
        showInputDataAlert("Audit information calculation error. Incorrect issue date!")
        return;
    }

    var issueDateDATE = new Date(parseInt(issueDate.slice(-4)), parseInt(issueDate.slice(0, 2)) - 1, parseInt(issueDate.slice(2, 4)));
    issueDateDATE.setDate(issueDateDATE.getDate() + 1)

    // Get year, month, and day part from the date
    var year = issueDateDATE.toLocaleString("default", { year: "2-digit" });
    var month = issueDateDATE.toLocaleString("default", { month: "2-digit" });
    var day = issueDateDATE.toLocaleString("default", { day: "2-digit" });

    // Generate yyyy-mm-dd date string
    var formattedDate = month + day + year;

    document.getElementById("inputAudit").value = "CODL_0_" + formattedDate + "_" + getRandomNumericString(5);
}*/

 /*
 $$$$   $$$$  $$  $$ $$  $$ $$$$$  $$$$  $$$$$$ $$$$$$  $$$$  $$  $$ $$$$$$
$$  $$ $$  $$ $$$ $$ $$$ $$ $$    $$  $$   $$     $$   $$  $$ $$  $$   $$
$$     $$  $$ $$ $$$ $$ $$$ $$$$  $$       $$     $$   $$     $$  $$   $$
$$  $$ $$  $$ $$  $$ $$  $$ $$    $$  $$   $$     $$   $$  $$ $$  $$   $$
 $$$$   $$$$  $$  $$ $$  $$ $$$$$  $$$$    $$   $$$$$$  $$$$   $$$$    $$
*/
       // CONNECTICUT (CT) - UPDATED
    const CT_calculate_documentNumber = () => {
        const dob = a417_fields.dob.value;
        if (!dob || dob.length !== 8) {
            showInputDataAlert("CT Doc Number Error: Incorrect birth date!");
            return;
        }
        const year = parseInt(dob.slice(-4));
        // This logic calculates the special month number based on the birth year
        const monthNumber = (year % 2) ? dob.slice(0, 2) : (parseInt(dob.slice(0, 2)) + 12).toString();
        a417_fields.customer_id.value = monthNumber + getRandomNumericString(7);
    };
    const CT_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        if (!docNum || docNum.length !== 9) {
            showInputDataAlert("CT ICN Error: Incorrect document number (must be 9 digits).");
            return;
        }
        a417_fields.inventory_control.value = docNum + "CT" + getRandomDigit() + getRandomLetter() + getRandomLetter() + getRandomLetter() + "01";
    };
    const CT_calculate_DD = () => {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("CT DD Error: Incorrect issue date!");
            return;
        }
        const formattedDate = issueDate.slice(-2) + issueDate.slice(0, 2) + issueDate.slice(2, 4); // YYMMDD
        a417_fields.document_discriminator.value = `${formattedDate}${getRandomNumericString(6)}01MV${getRandomLetter()}${getRandomDigit()}`;
    };


    /*
$$$$$  $$$$$ $$      $$$$  $$   $  $$$$  $$$$$  $$$$$
$$  $$ $$    $$     $$  $$ $$   $ $$  $$ $$  $$ $$
$$  $$ $$$$  $$     $$$$$$ $$ $ $ $$$$$$ $$$$$  $$$$
$$  $$ $$    $$     $$  $$ $$$$$$ $$  $$ $$  $$ $$
$$$$$  $$$$$ $$$$$$ $$  $$  $$ $$ $$  $$ $$  $$ $$$$$
*/
    // DELAWARE (DE) - UPDATED
    const DE_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomNumericString(7);
    };
    const DE_calculate_ICN = () => {
        a417_fields.inventory_control.value = "0110" + getRandomNumericString(12);
    };
    const DE_calculate_DD = () => {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("DE DD Error: Incorrect issue date!");
            return;
        }
        const formattedDate = issueDate.slice(-4) + issueDate.slice(0, 2) + issueDate.slice(2, 4); // YYYYMMDD
        a417_fields.document_discriminator.value = `L${formattedDate}${getRandomNumericString(6)}C`;
    };

    
    /*
$$$$$$ $$      $$$$  $$$$$  $$$$$$ $$$$$   $$$$ 
$$     $$     $$  $$ $$  $$   $$   $$  $$ $$  $$
$$$$   $$     $$  $$ $$$$$    $$   $$  $$ $$$$$$
$$     $$     $$  $$ $$  $$   $$   $$  $$ $$  $$
$$     $$$$$$  $$$$  $$  $$ $$$$$$ $$$$$  $$  $$
*/

// =============== FLORIDA (FL) ============== //

     // FLORIDA (FL) - UPDATED
    const FL_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomLetter() + getRandomNumericString(12);
    };
    const FL_calculate_ICN = () => {
        a417_fields.inventory_control.value = "0100" + getRandomNumericString(12);
    };
    const FL_calculate_DD = () => {
        // This function now generates a random value of 1 letter + 12 digits for the DD field.
        a417_fields.document_discriminator.value = getRandomLetter() + getRandomNumericString(12);
    };

/*
_$$$$_ $$$$$ _$$$$_ $$$$$_ _$$$$_ $$$$$$ _$$$$_     _$$$$_ _$$$$_ __$$ _$$$$_
$$____ $$___ $$__$$ $$__$$ $$____ __$$__ $$__$$     $$__$$ $$__$$ $$$$ $$__$$
$$_$$$ $$$$_ $$__$$ $$$$$_ $$_$$$ __$$__ $$$$$$     ___$$_ $$__$$ __$$ _$$$$$
$$__$$ $$___ $$__$$ $$__$$ $$__$$ __$$__ $$__$$     _$$___ $$__$$ __$$ ____$$
_$$$$_ $$$$$ _$$$$_ $$__$$ _$$$$_ $$$$$$ $$__$$     $$$$$$ _$$$$_ __$$ _$$$$_
*/


// ============================= GEORGIA (GA) ============================ //
    const GA_calculate_documentNumber = () => { a417_fields.customer_id.value = "0" + getRandomNumericString(8); };
    
    // Cập nhật hàm ICN với logic mới của bạn
    const GA_calculate_ICN = () => { 
        a417_fields.inventory_control.value = "1000" + getRandomNumericString(7);
    };
    
    // Cập nhật hàm DD để khớp với độ dài ICN mới (11 ký tự)
    const GA_calculate_DD = () => {
        const icn = a417_fields.inventory_control.value;
        if (!icn || icn.length !== 11) {
            showInputDataAlert("GA DD calculation error: A valid 11-char ICN is required. Please generate ICN first.");
            return;
        }
        a417_fields.document_discriminator.value = icn;
    };
/*
$$  $$  $$$$  $$   $  $$$$  $$$$$$ $$$$$$
$$  $$ $$  $$ $$   $ $$  $$   $$     $$
$$$$$$ $$$$$$ $$ $ $ $$$$$$   $$     $$
$$  $$ $$  $$ $$$$$$ $$  $$   $$     $$
$$  $$ $$  $$  $$ $$ $$  $$ $$$$$$ $$$$$$
*/  const HI_calculate_documentNumber = () => { a417_fields.customer_id.value = "H00" + getRandomNumericString(6); };
const HI_calculate_ICN = () => {
    const issueDate = a417_fields.issue_date.value;
    if (!issueDate || issueDate.length !== 8) { showInputDataAlert("HI ICN Error: Incorrect issue date."); return; }
    const d = new Date(issueDate.slice(-4), parseInt(issueDate.slice(0,2)) - 1, parseInt(issueDate.slice(2,4)));
    d.setDate(d.getDate() + 6);
    const formattedDate = ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2) + d.getFullYear();
    a417_fields.inventory_control.value = issueDate.slice(-4) + formattedDate.slice(0,4) + "_106336_2_1" + getRandomNumericString(2);
};

const HI_calculate_DD = () => {
    const issueDate = a417_fields.issue_date.value;
    if (!issueDate || issueDate.length !== 8) {
        showInputDataAlert("HI DD calculation error: Incorrect issue date!");
        return;
    }

    let randomPart = getRandomNumericString(6);
    for (let i = 0; i < 6; i++) { 
        randomPart += getRandomLetterAndDigit(); 
    }
    
    const formattedDate = issueDate.slice(-4) + issueDate.slice(0,2) + issueDate.slice(2,4); // YYYYMMDD
    
    a417_fields.document_discriminator.value = formattedDate + randomPart + "-ICWH";
};

/*
$$$$$$  $$$$  $$   $  $$$$
  $$   $$  $$ $$   $ $$  $$
  $$   $$  $$ $$ $ $ $$$$$$
  $$   $$  $$ $$$$$$ $$  $$
$$$$$$  $$$$   $$ $$ $$  $$

*/   
/**
 * Tạo và gán một số Document Number ngẫu nhiên.
 */
const IA_calculate_documentNumber = () => {
    // Tạo giá trị và gán trực tiếp vào đối tượng dữ liệu
    a417_fields.customer_id.value = 
        getRandomNumericString(3) + 
        getRandomLetter() + 
        getRandomLetter() + 
        getRandomNumericString(4);
}; 
/*
 * Tính toán giá trị DD (Document Discriminator) cho bang Iowa (IA).
 * Dựa trên ngày hết hạn, họ, tên và giới tính.
 */
const IA_calculate_DD = () => {
    // Lấy giá trị từ các trường dữ liệu
    const expiryDate = a417_fields.expiry_date.value;
    const lastName = a417_fields.family_name.value;
    const firstName = a417_fields.first_name.value;
    const sex = a417_fields.sex.value;

    // Kiểm tra dữ liệu đầu vào
    if (expiryDate.length !== 8) {
        showInputDataAlert("Lỗi tính DD cho IA: Ngày hết hạn không hợp lệ.");
        return;
    }
    if (!lastName) {
        showInputDataAlert("Lỗi tính DD cho IA: Vui lòng nhập Họ (Last name).");
        return;
    }
    if (!firstName) {
        showInputDataAlert("Lỗi tính DD cho IA: Vui lòng nhập Tên (First name).");
        return;
    }

    // === BẮT ĐẦU THAY ĐỔI ===
    // Chuyển đổi mã giới tính từ số sang chữ cái
    let sexCode = sex; // Mặc định giữ nguyên giá trị (cho trường hợp '9')
    if (sex === '1') {
        sexCode = 'M';
    } else if (sex === '2') {
        sexCode = 'F';
    }
    // === KẾT THÚC THAY ĐỔI ===

    // Tạo chuỗi DD theo công thức, sử dụng sexCode đã chuyển đổi
    const ddValue = `${getRandomNumericString(9)}${lastName[0]}${firstName[0]}${getRandomNumericString(4)}${sexCode}${expiryDate.slice(2, 4)}${expiryDate.slice(0, 2)}${expiryDate.slice(-2)}D`;

    // Gán giá trị vào ô input tương ứng
    a417_fields.document_discriminator.value = ddValue;
};

const IA_calculate_ICN = () => {
    // Ưu tiên lấy docNum từ đối tượng dữ liệu, nếu không có thì tạo mới
    let docNum = a417_fields.customer_id.value;
    if (!docNum) {
        docNum = getRandomNumericString(3) + getRandomLetter() + getRandomLetter() + getRandomNumericString(4);
        a417_fields.customer_id.value = docNum; // Lưu lại giá trị mới được tạo
    }

    const issueDate = a417_fields.issue_date.value;
    if (!issueDate || issueDate.length !== 8) {
        showInputDataAlert("IA ICN Error: Incorrect issue date.");
        return;
    }

    // Tính toán số ngày và định dạng lại
    const dayCount = getNumberOfDaysFromBeginnigOfYear(issueDate);
    const d = ("000" + (parseInt(dayCount) + 3)).slice(-3); // Sử dụng "000" để an toàn hơn

    a417_fields.inventory_control.value = docNum + issueDate.slice(-2) + d + "0101";
};




    /*
$$$$$$ $$$$$   $$$$  $$  $$  $$$$
  $$   $$  $$ $$  $$ $$  $$ $$  $$
  $$   $$  $$ $$$$$$ $$$$$$ $$  $$
  $$   $$  $$ $$  $$ $$  $$ $$  $$
$$$$$$ $$$$$  $$  $$ $$  $$  $$$$
*/
    // IDAHO (ID) - UPDATED
    const ID_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomLetter() + getRandomLetter() + getRandomNumericString(6) + getRandomLetter();
    };
    const ID_calculate_ICN = () => {
        // Using 2023 logic as default
        a417_fields.inventory_control.value = "MT" + getRandomNumericString(6) + "H" + getRandomNumericString(6) + "001";
    };
    const ID_calculate_DD = () => {
        // Using 2023 logic as default
        a417_fields.document_discriminator.value = getRandomNumericString(15);
    };

   /*
$$$$$$ $$     $$     $$$$$$ $$  $$  $$$$  $$$$$$  $$$$
  $$   $$     $$       $$   $$$ $$ $$  $$   $$   $$
  $$   $$     $$       $$   $$ $$$ $$  $$   $$    $$$$
  $$   $$     $$       $$   $$  $$ $$  $$   $$       $$
$$$$$$ $$$$$$ $$$$$$ $$$$$$ $$  $$  $$$$  $$$$$$  $$$$
*/

// ================== ILLINOIS (IL) ================= //
        // ILLINOIS (IL) - UPDATED
       // ILLINOIS (IL) - UPDATED
    const IL_calculate_documentNumber = () => {
        const familyName = a417_fields.family_name.value;
        if (!familyName) {
            showInputDataAlert("IL DocNumber Error: Last name is required!");
            return;
        }
        a417_fields.customer_id.value = familyName[0].toUpperCase() + getRandomNumericString(11);
    };
    const IL_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        if (!docNum || docNum.length !== 12) {
            showInputDataAlert("IL ICN Error: Document number must be 12 chars!");
            return;
        }
        a417_fields.inventory_control.value = `${docNum}IL${getRandomLetter()}${getRandomLetterAndDigit()}${getRandomLetter()}${getRandomLetter()}01`;
    };
    const IL_calculate_DD = () => {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("IL DD Error: Incorrect issue date (MMDDYYYY)!");
            return;
        }
        // Format date from MMDDYYYY to YYYYMMDD
        const formattedDate = `${issueDate.slice(-4)}${issueDate.slice(0, 2)}${issueDate.slice(2, 4)}`;
        
        // Generate the rest of the string according to the note
        a417_fields.document_discriminator.value = 
            `${formattedDate}${getRandomNumericString(3)}${getRandomLetter()}${getRandomLetter()}${getRandomNumericString(4)}`;
    };
    /*
$$$$$$ $$  $$ $$$$$  $$$$$$  $$$$  $$  $$  $$$$
  $$   $$$ $$ $$  $$   $$   $$  $$ $$$ $$ $$  $$
  $$   $$ $$$ $$  $$   $$   $$$$$$ $$ $$$ $$$$$$
  $$   $$  $$ $$  $$   $$   $$  $$ $$  $$ $$  $$
$$$$$$ $$  $$ $$$$$  $$$$$$ $$  $$ $$  $$ $$  $$
*/
       // INDIANA (IN) - UPDATED
    const IN_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomNumericString(4) + "-" + getRandomNumericString(2) + "-" + getRandomNumericString(4);
    };
    const IN_calculate_ICN = () => {
        a417_fields.inventory_control.value = "03701" + getRandomNumericString(11);
    };
    const IN_calculate_DD = () => {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("IN DD Error: Incorrect issue date!");
            return;
        }
        
        // Since there is no "Office Code" field, we generate a random 3-digit code here.
        const officeCode = getRandomNumericString(3); 
        
        const formattedDate = issueDate.slice(0, 4) + issueDate.slice(-2); // MMDDYY
        
        a417_fields.document_discriminator.value = `${formattedDate}${officeCode}00${getRandomNumericString(3)}`;
    };
    
/*
$$  $$  $$$$  $$  $$  $$$$   $$$$   $$$$
$$ $$  $$  $$ $$$ $$ $$     $$  $$ $$
$$$$   $$$$$$ $$ $$$  $$$$  $$$$$$  $$$$
$$ $$  $$  $$ $$  $$     $$ $$  $$     $$
$$  $$ $$  $$ $$  $$  $$$$  $$  $$  $$$$
*/ 
// ======================= KANSAS (KS) ======================= //
const KS_calculate_documentNumber = () => {
    a417_fields.customer_id.value = "K00-" + getRandomNumericString(2) + "-" + getRandomNumericString(4);
};

const KS_calculate_ICN = () => {
    const issueDate = a417_fields.issue_date.value;
    const docNum = a417_fields.customer_id.value;
    if (!issueDate || !docNum) {
        showInputDataAlert("KS ICN Error: Issue Date and Doc Number are required.");
        return;
    }
    if (docNum.replace(/-/g, '').length !== 9) {
        showInputDataAlert("KS ICN Error: Doc Number must be 9 digits (K00-00-0000).");
        return;
    }
    const days = ("000" + (parseInt(getNumberOfDaysFromBeginnigOfYear(issueDate)) + 3)).slice(-3);
    a417_fields.inventory_control.value = issueDate.slice(-2) + days + docNum.replace(/-/g, '') + "0101";
};

const KS_calculate_DD = () => {
    // Lấy tất cả giá trị cần thiết từ đối tượng a417_fields
    const birthDate = a417_fields.dob.value;
    const issueDate = a417_fields.issue_date.value;
    const expiryDate = a417_fields.expiry_date.value;
    const lastName = a417_fields.family_name.value;
    const firstName = a417_fields.first_name.value;
    const sex = a417_fields.sex.value;

    // Kiểm tra dữ liệu đầu vào
    if (!birthDate || birthDate.length !== 8) {
        showInputDataAlert("KS DD Error: Incorrect birth date (MMDDYYYY)!");
        return;
    }
    if (!issueDate || issueDate.length !== 8) {
        showInputDataAlert("KS DD Error: Incorrect issue date (MMDDYYYY)!");
        return;
    }
    if (!expiryDate || expiryDate.length !== 8) {
        showInputDataAlert("KS DD Error: Incorrect expiry date (MMDDYYYY)!");
        return;
    }
    if (!lastName) {
        showInputDataAlert("KS DD Error: Last name is required!");
        return;
    }
    if (!firstName) {
        showInputDataAlert("KS DD Error: First name is required!");
        return;
    }
    if (!sex) {
        showInputDataAlert("KS DD Error: Sex is required!");
        return;
    }

    // === BẮT ĐẦU CẬP NHẬT ===
    // Chuyển đổi mã giới tính từ số sang chữ cái
    let sexCode = sex; // Mặc định giữ nguyên giá trị (cho trường hợp '9')
    if (sex === '1') {
        sexCode = 'M';
    } else if (sex === '2') {
        sexCode = 'F';
    }
    // === KẾT THÚC CẬP NHẬT ===

    // Tính toán số ngày từ đầu năm (cộng thêm 1 theo logic của bạn)
    const daysSinceYearStart = parseInt(getNumberOfDaysFromBeginnigOfYear(issueDate)) + 1;
    // Định dạng thành chuỗi 3 ký tự, ví dụ: '005', '045', '123'
    const formattedDays = ("000" + daysSinceYearStart).slice(-3);

    // Ghép chuỗi DD bằng template literal và sử dụng `sexCode` đã được chuyển đổi
    const ddValue = `${birthDate.slice(-2, -1)}${formattedDays}${getRandomNumericString(6)}${birthDate.slice(-1)}${lastName[0]}${firstName[0]}${issueDate.slice(-2)}${formattedDays}${sexCode}${expiryDate.slice(-2)}${expiryDate.slice(2,4)}${get_letter_corresponding_month(expiryDate.slice(0,2))}B`;
    
    a417_fields.document_discriminator.value = ddValue;
};


    /*
$$  $$ $$$$$ $$  $$ $$$$$$ $$  $$  $$$$  $$  $$ $$  $$
$$ $$  $$    $$$ $$   $$   $$  $$ $$  $$ $$ $$   $$$$
$$$$   $$$$  $$ $$$   $$   $$  $$ $$     $$$$     $$
$$ $$  $$    $$  $$   $$   $$  $$ $$  $$ $$ $$    $$
$$  $$ $$$$$ $$  $$   $$    $$$$   $$$$  $$  $$   $$
*/    // KENTUCKY (KY) - UPDATED
    const KY_calculate_documentNumber = () => {
        const lastName = a417_fields.family_name.value;
        if (!lastName) {
            showInputDataAlert("KY Document number error: Last Name is required!");
            return;
        }
        a417_fields.customer_id.value = lastName.charAt(0).toUpperCase() + getRandomNumericString(8);
    };
    const KY_calculate_ICN = () => {
        a417_fields.inventory_control.value = "04601" + getRandomNumericString(11);
    };
    const KY_calculate_DD = () => {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("KY DD calculation error: Incorrect issue date!");
            return;
        }
        // issueDate format is MMDDYYYY
        // The rule is YYYYMMDD + 8 digits + ' 01111'
        // The original code had a typo: issueDate.slice(3,5) should be issueDate.slice(2,4)
        const formattedDate = `${issueDate.slice(-4)}${issueDate.slice(0, 2)}${issueDate.slice(2, 4)}`;
        a417_fields.document_discriminator.value = `${formattedDate}${getRandomNumericString(8)} 01111`;
    };


/*
$$      $$$$  $$  $$ $$$$$$  $$$$  $$$$$$  $$$$  $$  $$  $$$$
$$     $$  $$ $$  $$   $$   $$       $$   $$  $$ $$$ $$ $$  $$
$$     $$  $$ $$  $$   $$    $$$$    $$   $$$$$$ $$ $$$ $$$$$$
$$     $$  $$ $$  $$   $$       $$   $$   $$  $$ $$  $$ $$  $$
$$$$$$  $$$$   $$$$  $$$$$$  $$$$  $$$$$$ $$  $$ $$  $$ $$  $$
*/    
const LA_calculate_documentNumber = () => {
    a417_fields.customer_id.value = (Math.random() > 0.5 ? "00" : "01") + getRandomNumericString(7);
};

const LA_calculate_ICN = () => {
    a417_fields.inventory_control.value = "00700" + getRandomNumericString(11);
};

// Hàm mới cho Audit Info
const LA_calculate_audit_info = () => {
    a417_fields.audit_info.value = getRandomNumericString(4);
};

// Hàm mới cho Issuing Office
const LA_calculate_issuing_office = () => {
    a417_fields.issuing_office.value = "0" + getRandomInt(21, 35).toString();
};
    /*
$$   $  $$$$   $$$$   $$$$   $$$$   $$$$  $$  $$ $$  $$  $$$$  $$$$$ $$$$$$ $$$$$$  $$$$
$$$ $$ $$  $$ $$     $$     $$  $$ $$  $$ $$  $$ $$  $$ $$     $$      $$     $$   $$
$$ $ $ $$$$$$  $$$$   $$$$  $$$$$$ $$     $$$$$$ $$  $$  $$$$  $$$$    $$     $$    $$$$
$$   $ $$  $$     $$     $$ $$  $$ $$  $$ $$  $$ $$  $$     $$ $$      $$     $$       $$
$$   $ $$  $$  $$$$   $$$$  $$  $$  $$$$  $$  $$  $$$$   $$$$  $$$$$   $$     $$    $$$$
*/
     // MASSACHUSETTS (MA) - UPDATED
    const MA_calculate_documentNumber = () => {
        a417_fields.customer_id.value = "S" + getRandomNumericString(8);
    };
    const MA_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        const issueDate = a417_fields.issue_date.value;
        if (!docNum || docNum.length !== 9) {
            showInputDataAlert("MA ICN Error: Document Number (must be 'S' + 8 digits) is required!");
            return;
        }
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("MA ICN Error: Incorrect Issue Date!");
            return;
        }
        a417_fields.inventory_control.value = issueDate.slice(-2) + getNumberOfDaysFromBeginnigOfYear(issueDate) + docNum + "0601";
    };
    const MA_calculate_DD = () => {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("MA DD calculation error: Incorrect issue date!");
            return;
        }
        // This logic uses a fixed revision date as per the original code.
        a417_fields.document_discriminator.value = issueDate + " REV 02222016";
    };

/*
$$   $  $$$$  $$$$$  $$  $$ $$      $$$$  $$  $$ $$$$$
$$$ $$ $$  $$ $$  $$  $$$$  $$     $$  $$ $$$_$$ $$  $$
$$ $ $ $$$$$$ $$$$$    $$   $$     $$$$$$ $$ $$$ $$  $$
$$   $ $$  $$ $$  $$   $$   $$     $$  $$ $$  $$ $$  $$
$$   $ $$  $$ $$  $$   $$   $$$$$$_$$  $$ $$  $$ $$$$$
*/

const MD_calculate_documentNumber = () => {
    const lastName = a417_fields.family_name.value;
    if (!lastName) {
        showInputDataAlert("MD Document Number Error: Last name is required!");
        return;
    }
    // Thay vào đó, chúng tôi tạo một số giấy phép theo định dạng phổ biến của MD.
    // Nếu bạn có hàm CalculateDL, hãy thay thế logic dưới đây.
    // Định dạng MD thường là: 1 chữ cái, 12 số.
    const documentNumber = 
        lastName.charAt(0).toUpperCase() + "-" +
        getRandomNumericString(3) + "-" +
        getRandomNumericString(3) + "-" +
        getRandomNumericString(3) + "-" +
        getRandomNumericString(3);

    a417_fields.customer_id.value = documentNumber;
};

const MD_calculate_ICN = () => {
    a417_fields.inventory_control.value = "100" + getRandomNumericString(7);
};

const MD_calculate_DD = () => {
    // Logic: 6 số + 2 chữ cái + 1 số
    const ddValue = `${getRandomNumericString(6)}${getRandomLetter()}${getRandomLetter()}${getRandomDigit()}`;
    a417_fields.document_discriminator.value = ddValue;
};

/*
$$   $  $$$$  $$$$$$ $$  $$ $$$$$
$$$ $$ $$  $$   $$   $$$ $$ $$
$$ $ $ $$$$$$   $$   $$ $$$ $$$$
$$   $ $$  $$   $$   $$  $$ $$
$$   $ $$  $$ $$$$$$ $$  $$ $$$$$
*/

        // MAINE (ME) - UPDATED
    const ME_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomNumericString(7);
    };
    const ME_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        const issueDate = a417_fields.issue_date.value;
        if (!docNum || docNum.length !== 7) {
            showInputDataAlert("ME ICN Error: Document Number (7 digits) is required!");
            return;
        }
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("ME ICN Error: Incorrect Issue Date!");
            return;
        }
        const d = ("00" + (parseInt(getNumberOfDaysFromBeginnigOfYear(issueDate)) + 4)).slice(-3);
        a417_fields.inventory_control.value = `F${issueDate.slice(-2)}${d}${docNum}0101`;
    };
    const ME_calculate_DD = () => {
        a417_fields.document_discriminator.value = '0'.repeat(17) + getRandomNumericString(8);
    };


    /*
$$   $ $$$$$$  $$$$  $$  $$ $$$$$$  $$$$  $$$$  $$  $$
$$$ $$   $$   $$  $$ $$  $$   $$   $$     $$  $$ $$$ $$
$$ $ $   $$   $$     $$$$$$   $$   $$ $$$ $$$$$$ $$ $$$
$$   $   $$   $$  $$ $$  $$   $$   $$  $$ $$  $$ $$  $$
$$   $ $$$$$$  $$$$  $$  $$ $$$$$$  $$$$  $$  $$ $$  $$
*/

             // MICHIGAN (MI) - UPDATED WITH SPACES
    const MI_calculate_documentNumber = () => {
        const lastName = a417_fields.family_name.value;
        if (!lastName) {
            showInputDataAlert("MI Doc Number error: Last Name is required!");
            return;
        }
        // Format: LNNN NNN NNN (1 Letter, 9 numbers, 2 spaces) = 12 characters.
        // This is a common visual format.
        a417_fields.customer_id.value = 
            lastName.charAt(0)+ " " .toUpperCase() + 
            getRandomNumericString(3) + " " +
            getRandomNumericString(3) + " " +
            getRandomNumericString(3);
    };
    const MI_calculate_ICN = () => {
        const docNumWithSpaces = a417_fields.customer_id.value;
        const birthDate = a417_fields.dob.value;
        const expiryDate = a417_fields.expiry_date.value;
        
        if (!docNumWithSpaces) { 
            showInputDataAlert("MI ICN calculation error: A valid Document Number is required! Please generate it first.");
            return;
        }
        if (!birthDate || birthDate.length !== 8) {
            showInputDataAlert("MI ICN calculation error: Incorrect birth date!");
            return;
        }
        if (!expiryDate || expiryDate.length !== 8) {
            showInputDataAlert("MI ICN calculation error: Incorrect expiry date!");
            return;
        }
        
        // IMPORTANT: Use the document number *without* spaces for the calculation.
        const docNumWithoutSpaces = docNumWithSpaces.replace(/\s/g, '');
        
        const dob_YYYYMMDD = birthDate.slice(-4) + birthDate.slice(0, 2) + birthDate.slice(2, 4);
        const exp_YYMM = expiryDate.slice(-2) + expiryDate.slice(0, 2);
        a417_fields.inventory_control.value = docNumWithoutSpaces + dob_YYYYMMDD + exp_YYMM;
    };
    const MI_calculate_DD = () => {
        // Michigan DD format is a 13-digit random number.
        a417_fields.document_discriminator.value = getRandomNumericString(13);
    };
    /*
$$   $ $$$$$$ $$  $$ $$  $$ $$$$$  $$$$   $$$$  $$$$$$  $$$$
$$$ $$   $$   $$$ $$ $$$ $$ $$    $$     $$  $$   $$   $$  $$
$$ $ $   $$   $$ $$$ $$ $$$ $$$$   $$$$  $$  $$   $$   $$$$$$
$$   $   $$   $$  $$ $$  $$ $$        $$ $$  $$   $$   $$  $$
$$   $ $$$$$$ $$  $$ $$  $$ $$$$$  $$$$   $$$$    $$   $$  $$
*/
    // MINNESOTA (MN) - UPDATED
    const MN_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomLetter() + getRandomNumericString(12);
    };
    const MN_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        const issueDate = a417_fields.issue_date.value;
        if (!docNum || docNum.length !== 13) {
            showInputDataAlert("MN ICN Error: Document Number (must be 13 chars) is required!");
            return;
        }
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("MN ICN Error: Incorrect Issue Date!");
            return;
        }
        const d = ("00" + (parseInt(getNumberOfDaysFromBeginnigOfYear(issueDate)) + 3)).slice(-3);
        a417_fields.inventory_control.value = docNum + "01" + d + "01";
    };
    const MN_calculate_DD = () => {
        a417_fields.document_discriminator.value = '0'.repeat(7) + getRandomNumericString(7);
    };

    // MO
    const MO_calculate_documentNumber = () => { a417_fields.customer_id.value = getRandomLetter() + "0" + getRandomNumericString(8); };
    const MO_calculate_ICN = () => {
        const issueDate = a417_fields.issue_date.value;
        const docNum = a417_fields.customer_id.value;
        if (!docNum || docNum.length !== 10 || !issueDate) { showInputDataAlert("MO ICN Error: Doc Number (10 chars) and Issue Date are required."); return; }
        const days = parseInt(getNumberOfDaysFromBeginnigOfYear(issueDate)) + 2;
        a417_fields.inventory_control.value = issueDate.slice(-2) + ("00" + days).slice(-3) + docNum + "0101";
    };
        const MO_calculate_DD = () => {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("MO DD calculation error. Incorrect issue date!");
            return;
        }
        a417_fields.document_discriminator.value = issueDate.slice(-2) + "14" + getRandomNumericString(4) + "00" + getRandomNumericString(2);
    };

   /*
$$   $ $$$$$$  $$$$   $$$$  $$$$$$  $$$$   $$$$  $$$$$$ $$$$$  $$$$$  $$$$$$
$$$ $$   $$   $$     $$       $$   $$     $$       $$   $$  $$ $$  $$   $$ 
$$ $ $   $$    $$$$   $$$$    $$    $$$$   $$$$    $$   $$$$$  $$$$$    $$ 
$$   $   $$       $$     $$   $$       $$     $$   $$   $$     $$       $$ 
$$   $ $$$$$$  $$$$   $$$$  $$$$$$  $$$$   $$$$  $$$$$$ $$     $$     $$$$$$
*/        // MISSISSIPPI (MS) - UPDATED
    const MS_calculate_documentNumber = () => {
        a417_fields.customer_id.value = "80" + getRandomNumericString(7);
    };
    const MS_calculate_ICN = () => {
        a417_fields.inventory_control.value = "05100" + getRandomNumericString(6) + "23" + getRandomNumericString(3);
    };
       const MS_calculate_DD = () => {
        const birthDate = a417_fields.dob.value;
        const issueDate = a417_fields.issue_date.value;
        const expiryDate = a417_fields.expiry_date.value;
        const lastName = a417_fields.family_name.value;
        const firstName = a417_fields.first_name.value;
        const sex = a417_fields.sex.value;

        // Ensure all fields have valid data
        if (!birthDate || birthDate.length !== 8) { showInputDataAlert("MS DD Error: A valid Birth Date is required."); return; }
        if (!issueDate || issueDate.length !== 8) { showInputDataAlert("MS DD Error: A valid Issue Date is required."); return; }
        if (!expiryDate || expiryDate.length !== 8) { showInputDataAlert("MS DD Error: A valid Expiry Date is required."); return; }
        if (!lastName) { showInputDataAlert("MS DD Error: Last Name is required."); return; }
        if (!firstName) { showInputDataAlert("MS DD Error: First Name is required."); return; }
        if (!sex) { showInputDataAlert("MS DD Error: Sex is required."); return; }
        
        let s = "";
        for(let i = 0; i < 7; i++) { s += getRandomLetterAndDigit(); }

        const d = getNumberOfDaysFromBeginnigOfYear(issueDate);

        const expiryMonth = parseInt(expiryDate.slice(0, 2), 10);
        
        if (isNaN(expiryMonth) || expiryMonth < 1 || expiryMonth > 12) {
            showInputDataAlert("MS DD Error: Invalid month in Expiry Date.");
            return;
        }

        const monthLetter = get_letter_corresponding_month(expiryMonth);
        
        if (!monthLetter) {
            showInputDataAlert("MS DD Error: Could not generate month letter for Expiry Date.");
            return;
        }

        a417_fields.document_discriminator.value =
            birthDate.slice(-2, -1) + 
            getRandomLetter() + 
            s + 
            birthDate.slice(-1) +
            lastName.charAt(0).toUpperCase() + 
            firstName.charAt(0).toUpperCase() + 
            issueDate.slice(-2) + 
            d + 
            sex +
            expiryDate.slice(-2) + 
            expiryDate.slice(2, 4) + 
            monthLetter;
    };
    /*
$$   $  $$$$  $$  $$ $$$$$$  $$$$  $$  $$  $$$$
$$$ $$ $$  $$ $$$ $$   $$   $$  $$ $$$ $$ $$  $$
$$ $ $ $$  $$ $$ $$$   $$   $$$$$$ $$ $$$ $$$$$$
$$   $ $$  $$ $$  $$   $$   $$  $$ $$  $$ $$  $$
$$   $  $$$$  $$  $$   $$   $$  $$ $$  $$ $$  $$
*/
       // MONTANA (MT) - UPDATED
    const MT_calculate_documentNumber = () => {
        const birthDate = a417_fields.dob.value;
        if (!birthDate || birthDate.length !== 8) {
            showInputDataAlert("MT Document Number Error: Incorrect birth date!");
            return;
        }
        // Original logic was birthDate.slice(3,5) which is incorrect for MMDDYYYY.
        // Corrected to birthDate.slice(2,4) for DD.
        a417_fields.customer_id.value = 
            birthDate.slice(0, 2) + 
            getRandomNumericString(3) + 
            birthDate.slice(-4) + 
            "41" + 
            birthDate.slice(2, 4);
    };
    const MT_calculate_ICN = () => {
        let data1 = "";
        for (let i = 0; i < 6; i++) {
            data1 += getRandomLetterAndDigit();
        }
        a417_fields.inventory_control.value = "1100" + getRandomDigit() + data1 + "FMT" + getRandomLetterAndDigit() + getRandomLetter() + getRandomLetter() + "001";
    };
    const MT_calculate_DD = () => {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("MT DD calculation error: Incorrect issue date!");
            return;
        }
        const formattedDate = `${issueDate.slice(-4)}${issueDate.slice(0, 2)}${issueDate.slice(2, 4)}`; // YYYYMMDD
        a417_fields.document_discriminator.value = formattedDate + getRandomNumericString(12);
    };

    /*
$$  $$  $$$$  $$$$$  $$$$$$ $$  $$     $$$$   $$$$  $$$$$   $$$$  $$     $$$$$$ $$  $$  $$$$
$$$ $$ $$  $$ $$  $$   $$   $$  $$    $$  $$ $$  $$ $$  $$ $$  $$ $$       $$   $$$ $$ $$  $$
$$ $$$ $$  $$ $$$$$    $$   $$$$$$    $$     $$$$$$ $$$$$  $$  $$ $$       $$   $$ $$$ $$$$$$
$$  $$ $$  $$ $$  $$   $$   $$  $$    $$  $$ $$  $$ $$  $$ $$  $$ $$       $$   $$  $$ $$  $$
$$  $$  $$$$  $$  $$   $$   $$  $$     $$$$  $$  $$ $$  $$  $$$$  $$$$$$ $$$$$$ $$  $$ $$  $$
*/


// ================================== NORTH CAROLINA (NC) ================================= //

       // NORTH CAROLINA (NC) - UPDATED
    const NC_calculate_documentNumber = () => {
        a417_fields.customer_id.value = "00000" + getRandomNumericString(7);
    };
    const NC_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        if (!docNum || docNum.length !== 12) {
            showInputDataAlert("NC ICN Error: Document Number (must be 12 chars) is required!");
            return;
        }
        a417_fields.inventory_control.value = 
            docNum + 
            "NC" + 
            getRandomLetterAndDigit() + 
            getRandomLetterAndDigit() + 
            getRandomLetterAndDigit() + 
            getRandomLetterAndDigit() + 
            "01";
    };
    const NC_calculate_DD = () => {
        a417_fields.document_discriminator.value = "001" + getRandomNumericString(7);
    };

/*
$$  $$  $$$$  $$$$$  $$$$$$ $$  $$      $$$$$   $$$$  $$  $$  $$$$  $$$$$$  $$$$
$$$ $$ $$  $$ $$  $$   $$   $$  $$      $$  $$ $$  $$ $$ $$  $$  $$   $$   $$  $$
$$ $$$ $$  $$ $$$$$    $$   $$$$$$      $$  $$ $$$$$$ $$$$   $$  $$   $$   $$$$$$
$$  $$ $$  $$ $$  $$   $$   $$  $$      $$  $$ $$  $$ $$ $$  $$  $$   $$   $$  $$
$$  $$  $$$$  $$  $$   $$   $$  $$      $$$$$  $$  $$ $$  $$  $$$$    $$   $$  $$
*/

    // NORTH DAKOTA (ND) - UPDATED
    const ND_calculate_documentNumber = () => {
        const birthDate = a417_fields.dob.value;
        const lastName = a417_fields.family_name.value;
        if (!birthDate || birthDate.length !== 8) {
            showInputDataAlert("ND Doc Number Error: Incorrect birth date!");
            return;
        }
        if (!lastName) {
            showInputDataAlert("ND Doc Number Error: Last name is required!");
            return;
        }
        const tempLastName = lastName + "XX"; // Ensure lastname is at least 3 chars
        a417_fields.customer_id.value = 
            tempLastName.slice(0, 3).toUpperCase() + 
            birthDate.slice(-2) + 
            getRandomNumericString(4);
    };
    const ND_calculate_ICN = () => {
        // Using 2023 logic as default
        a417_fields.inventory_control.value = "05100" + getRandomNumericString(11);
    };
    const ND_calculate_DD = () => {
        const birthDate = a417_fields.dob.value;
        const expiryDate = a417_fields.expiry_date.value;
        const height = a417_fields.height.value;
        const docNum = a417_fields.customer_id.value;
        const lastName = a417_fields.family_name.value;
        const firstName = a417_fields.first_name.value;
        const sex = a417_fields.sex.value;

        // Validation checks
        if (!birthDate || birthDate.length !== 8) { showInputDataAlert("ND DD Error: A valid Birth Date is required."); return; }
        if (!expiryDate || expiryDate.length !== 8) { showInputDataAlert("ND DD Error: A valid Expiry Date is required."); return; }
        if (!height) { showInputDataAlert("ND DD Error: Height is required."); return; }
        if (!docNum || docNum.length !== 9) { showInputDataAlert("ND DD Error: A valid 9-char Document Number is required."); return; }
        if (!lastName) { showInputDataAlert("ND DD Error: Last Name is required."); return; }
        if (!firstName) { showInputDataAlert("ND DD Error: First Name is required."); return; }
        if (!sex) { showInputDataAlert("ND DD Error: Sex is required."); return; }

        const sex_digit = sex === "1" ? "5" : "1"; // '1' for male in new structure

        a417_fields.document_discriminator.value = 
            birthDate.slice(-2, -1) + 
            docNum + 
            lastName.charAt(0).toUpperCase() + 
            firstName.charAt(0).toUpperCase() +
            sex_digit + "2" + 
            expiryDate.slice(-1) + 
            expiryDate.slice(2, 4) + 
            getRandomLetter().toLowerCase() + 
            getRandomLetter() + 
            height + "YDZ";
    };
    /*
$$  $$ $$$$$ $$$$$  $$$$$   $$$$   $$$$  $$  $$  $$$$
$$$ $$ $$    $$  $$ $$  $$ $$  $$ $$     $$ $$  $$  $$
$$ $$$ $$$$  $$$$$  $$$$$  $$$$$$  $$$$  $$$$   $$$$$$
$$  $$ $$    $$  $$ $$  $$ $$  $$     $$ $$ $$  $$  $$
$$  $$ $$$$$ $$$$$  $$  $$ $$  $$  $$$$  $$  $$ $$  $$
*/
        // NEBRASKA (NE) - UPDATED
    const NE_calculate_documentNumber = () => {
        const alphabet = "ABCEGHV";
        a417_fields.customer_id.value = alphabet[Math.floor(Math.random() * alphabet.length)] + getRandomNumericString(8);
    };
    const NE_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        if (!docNum || docNum.length !== 9) {
            showInputDataAlert("NE ICN calculation error: Incorrect document number (must be 9 chars)!");
            return;
        }
        const icnValue = docNum + "NETYCO01";
        a417_fields.inventory_control.value = icnValue;
        
        // After setting ICN, immediately calculate and set DD
        NE_calculate_DD(icnValue); 
    };
    const NE_calculate_DD = (icn_from_previous_function = null) => {
        // This function can be called independently or from the ICN function.
        const icn = icn_from_previous_function || a417_fields.inventory_control.value;
        if (!icn || icn.length !== 17) {
            showInputDataAlert("NE DD calculation error: A valid 17-char ICN is required! Please generate ICN first if calling this directly.");
            return;
        }
        a417_fields.document_discriminator.value = "054" + icn + getRandomNumericString(5);
    };
    /*const NE_calculate_ICN = () => {
    const icn = "0540000" + getRandomNumericString(4) + "00000";
    document.getElementById("inputICN").value = icn;
    document.getElementById("inputDD").value = icn;
};

const NE_calculate_DD = () => {
    const icn = document.getElementById("inputICN").value.trim();
    if (icn.length !== 16) {
        showInputDataAlert("DD calculation error. Incorrect ICN!");
        return;
    }
    document.getElementById("inputDD").value = icn;
};*/


  /*
$$  $$ $$$$$ $$   $     $$  $$  $$$$  $$   $ $$$$$   $$$$  $$  $$ $$$$$$ $$$$$  $$$$$
$$$ $$ $$    $$   $     $$  $$ $$  $$ $$$ $$ $$  $$ $$     $$  $$   $$   $$  $$ $$
$$ $$$ $$$$  $$ $ $     $$$$$$ $$$$$$ $$ $ $ $$$$$   $$$$  $$$$$$   $$   $$$$$  $$$$
$$  $$ $$    $$$$$$     $$  $$ $$  $$ $$   $ $$         $$ $$  $$   $$   $$  $$ $$
$$  $$ $$$$$  $$ $$     $$  $$ $$  $$ $$   $ $$      $$$$  $$  $$ $$$$$$ $$  $$ $$$$$
*/
       // NEW HAMPSHIRE (NH) - UPDATED
    const NH_calculate_documentNumber = () => {
        a417_fields.customer_id.value = "NHL" + getRandomNumericString(8);
    };
    const NH_calculate_ICN = () => {
        const icnValue = "0" + getRandomNumericString(7);
        a417_fields.inventory_control.value = icnValue;
        // Also set the DD value, as per the original logic
        a417_fields.document_discriminator.value = icnValue;
    };
    const NH_calculate_DD = () => {
        // This function simply copies the ICN value to the DD field
        const icnValue = a417_fields.inventory_control.value;
        if (!icnValue || icnValue.length !== 8) {
            showInputDataAlert("NH DD calculation error: A valid 8-char ICN is required. Please generate ICN first.");
            return;
        }
        a417_fields.document_discriminator.value = icnValue;
    };
    /*
$$  $$ $$$$$ $$   $    $$$$$$ $$$$$ $$$$$   $$$$  $$$$$ $$  $$
$$$ $$ $$    $$   $        $$ $$    $$  $$ $$     $$     $$$$
$$ $$$ $$$$  $$ $ $        $$ $$$$  $$$$$   $$$$  $$$$    $$
$$  $$ $$    $$$$$$    $$  $$ $$    $$  $$     $$ $$      $$
$$  $$ $$$$$  $$ $$     $$$$  $$$$$ $$  $$  $$$$  $$$$$   $$
*/
        // NEW JERSEY (NJ) - UPDATED
    const NJ_calculate_documentNumber = () => {
        const lastName = a417_fields.family_name.value;
        const firstName = a417_fields.first_name.value;
        const middleName = a417_fields.middle_name.value;
        const birthDate = a417_fields.dob.value;
        if (!lastName || !firstName || !birthDate || birthDate.length !== 8) {
            showInputDataAlert("NJ Doc Number Error: Last Name, First Name, and a valid DOB are required.");
            return;
        }
        // Since CalculateDL is not available, we create a plausible format.
        // NJ DL# is Letter + 4 digits + 5 digits + 5 digits
        a417_fields.customer_id.value = 
            lastName.charAt(0).toUpperCase() + 
            getRandomNumericString(4) + 
            getRandomNumericString(5) + 
            getRandomNumericString(5);
    };
    const NJ_calculate_ICN = () => {
        const lastName = a417_fields.family_name.value;
        if (!lastName) {
            showInputDataAlert("NJ ICN Error: Last Name is required.");
            return;
        }
        let random_data = "";
        for (let i = 0; i < 9; i++) { random_data += getRandomLetterAndDigit(); }
        random_data += "NJ" + getRandomNumericString(2);
        a417_fields.inventory_control.value = lastName.charAt(0).toUpperCase() + random_data + "SL01";
    };
    const NJ_calculate_DD = () => {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("NJ DD Error: Incorrect issue date!");
            return;
        }
        // The original logic required an "option1" field which doesn't exist.
        // We will generate a random letter for the first part.
        const option = getRandomLetter(); 
        const issueYear = issueDate.slice(-4);
        const days = getNumberOfDaysFromBeginnigOfYear(issueDate);
        a417_fields.document_discriminator.value = `${option}${issueYear}${days}0000${getRandomNumericString(4)}`;
    };

    // NM
    const NM_calculate_documentNumber = () => { a417_fields.customer_id.value = "0" + getRandomNumericString(8); };
    const NM_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        if (!docNum || docNum.length !== 9) { showInputDataAlert("NM ICN Error: Doc Number (9 chars) is required."); return; }
        a417_fields.inventory_control.value = docNum + "01";
    };
    
    /*
$$  $$ $$$$$ $$  $$  $$$$  $$$$$   $$$$
$$$ $$ $$    $$  $$ $$  $$ $$  $$ $$  $$
$$ $$$ $$$$  $$  $$ $$$$$$ $$  $$ $$$$$$
$$  $$ $$     $$$$  $$  $$ $$  $$ $$  $$
$$  $$ $$$$$   $$   $$  $$ $$$$$  $$  $$
*/
       // NEVADA (NV) - UPDATED
    const NV_calculate_documentNumber = () => {
        a417_fields.customer_id.value = "1" + getRandomNumericString(9);
    };
    const NV_calculate_ICN = () => {
        a417_fields.inventory_control.value = "0019" + getRandomNumericString(7) + "01";
    };
    const NV_calculate_DD = () => {
        a417_fields.document_discriminator.value = "0001" + getRandomNumericString(17);
    };

    
   /* const NV_calculate_ICN() {
    document.getElementById("inputICN").value = "0015" + getRandomNumericString(7) + "01";}*/
    
   /*
$$  $$ $$$$$ $$   $    $$  $$  $$$$  $$$$$  $$  $$
$$$ $$ $$    $$   $     $$$$  $$  $$ $$  $$ $$ $$
$$ $$$ $$$$  $$ $ $      $$   $$  $$ $$$$$  $$$$
$$  $$ $$    $$$$$$      $$   $$  $$ $$  $$ $$ $$
$$  $$ $$$$$  $$ $$      $$    $$$$  $$  $$ $$  $$
*/
    // NEW YORK (NY) - UPDATED
    const NY_calculate_documentNumber = () => {
        a417_fields.customer_id.value = "7" + getRandomNumericString(8);
    };
    const NY_calculate_DD = () => {
        let s = "";
        for (let i = 0; i < 8; i++) {
            s += getRandomLetterAndDigit();
        }
        a417_fields.document_discriminator.value = s + "06";
    };

/*
 $$$$  $$  $$ $$$$$$  $$$$
$$  $$ $$  $$   $$   $$  $$
$$  $$ $$$$$$   $$   $$  $$
$$  $$ $$  $$   $$   $$  $$
 $$$$  $$  $$ $$$$$$  $$$$

*/  

    // OHIO (OH) - UPDATED
    const OH_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomLetter() + getRandomLetter() + getRandomNumericString(6);
    };
    const OH_calculate_ICN = () => {
        a417_fields.inventory_control.value = getRandomLetter() + getRandomNumericString(8);
    };
    const OH_calculate_DD = () => {
        a417_fields.document_discriminator.value = "0" + getRandomNumericString(7) + "0";
    };
  /*
 $$$$  $$  $$ $$      $$$$  $$  $$  $$$$  $$   $  $$$$
$$  $$ $$ $$  $$     $$  $$ $$  $$ $$  $$ $$$ $$ $$  $$
$$  $$ $$$$   $$     $$$$$$ $$$$$$ $$  $$ $$ $ $ $$$$$$
$$  $$ $$ $$  $$     $$  $$ $$  $$ $$  $$ $$   $ $$  $$
 $$$$  $$  $$ $$$$$$ $$  $$ $$  $$  $$$$  $$   $ $$  $$
*/
       // OKLAHOMA (OK) - UPDATED
    const OK_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomLetter() + "08" + getRandomNumericString(7);
    };
    const OK_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        if (!docNum || docNum.length !== 10) {
            showInputDataAlert("OK ICN Error: Document Number (must be 10 chars) is required!");
            return;
        }
        a417_fields.inventory_control.value = 
            docNum + 
            "OK" + 
            getRandomLetterAndDigit() + 
            getRandomLetterAndDigit() + 
            "SL01";
    };
    const OK_calculate_DD = () => {
        const docNum = a417_fields.customer_id.value;
        const issueDate = a417_fields.issue_date.value;
        const birthDate = a417_fields.dob.value;

        if (!docNum || docNum.length !== 10) {
            showInputDataAlert("OK DD Error: A valid 10-char Document Number is required!");
            return;
        }
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("OK DD Error: An incorrect Issue Date is provided!");
            return;
        }
        if (!birthDate || birthDate.length !== 8) {
            showInputDataAlert("OK DD Error: An incorrect Birth Date is provided!");
            return;
        }

        const dobFormatted = birthDate.slice(0, 4) + birthDate.slice(-2); // MMDDYY
        const issueFormatted = issueDate.slice(0, 4) + issueDate.slice(-2); // MMDDYY
        a417_fields.document_discriminator.value = `${docNum}${dobFormatted}${issueFormatted}R`;
    };
/*
 $$$$  $$$$$  $$$$$  $$$$   $$$$  $$  $$
$$  $$ $$  $$ $$    $$     $$  $$ $$$ $$
$$  $$ $$$$$  $$$$  $$ $$$ $$  $$ $$ $$$
$$  $$ $$  $$ $$    $$  $$ $$  $$ $$  $$
 $$$$  $$  $$ $$$$$  $$$$   $$$$  $$  $$
*/   
    const OR_calculate_documentNumber = () => { a417_fields.customer_id.value = getRandomNumericString(7); };
    const OR_calculate_ICN = () => { a417_fields.inventory_control.value = "AA" + getRandomNumericString(7); };
   const OR_calculate_DD = () => {
    a417_fields.document_discriminator.value = `200${getRandomNumericString(6)}`;
};

/*
$$$$$  $$$$$ $$  $$ $$  $$  $$$$  $$  $$ $$     $$  $$  $$$$  $$  $$ $$$$$$  $$$$
$$  $$ $$    $$$ $$ $$$ $$ $$      $$$$  $$     $$  $$ $$  $$ $$$ $$   $$   $$  $$
$$$$$  $$$$  $$ $$$ $$ $$$  $$$$    $$   $$     $$  $$ $$$$$$ $$ $$$   $$   $$$$$$
$$     $$    $$  $$ $$  $$     $$   $$   $$      $$$$  $$  $$ $$  $$   $$   $$  $$
$$     $$$$$ $$  $$ $$  $$  $$$$    $$   $$$$$$   $$   $$  $$ $$  $$ $$$$$$ $$  $$
*/

// ============================== PENNSYLVANIA (PA) ============================ //
    // PENNSYLVANIA (PA) - UPDATED
    const PA_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomNumericString(8);
    };
    const PA_calculate_ICN = () => {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("PA ICN Error: Incorrect issue date!");
            return;
        }
        a417_fields.inventory_control.value = "02500" + getRandomNumericString(6) + issueDate.slice(-2) + getRandomNumericString(3);
    };
    const PA_calculate_DD = () => {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("PA DD calculation error: Incorrect issue date!");
            return;
        }
        a417_fields.document_discriminator.value = 
            issueDate.slice(-2) + 
            getNumberOfDaysFromBeginnigOfYear(issueDate) + 
            getRandomNumericString(10) + 
            "00000" + 
            getRandomNumericString(5);
    };
    
/*
$$$$$  $$  $$  $$$$  $$$$$  $$$$$    $$$$$$  $$$$  $$      $$$$  $$  $$ $$$$$
$$  $$ $$  $$ $$  $$ $$  $$ $$         $$   $$     $$     $$  $$ $$$ $$ $$  $$
$$$$$  $$$$$$ $$  $$ $$  $$ $$$$       $$    $$$$  $$     $$$$$$ $$ $$$ $$  $$
$$  $$ $$  $$ $$  $$ $$  $$ $$         $$       $$ $$     $$  $$ $$  $$ $$  $$
$$  $$ $$  $$  $$$$  $$$$$  $$$$$    $$$$$$  $$$$  $$$$$$ $$  $$ $$  $$ $$$$$
*/
        // RHODE ISLAND (RI) - UPDATED
    const RI_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomNumericString(7);
    };
    const RI_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        if (!docNum || (docNum.length !== 7 && docNum.length !== 8)) {
            showInputDataAlert("RI ICN Error: Document Number (must be 7 or 8 chars) is required!");
            return;
        }
        a417_fields.inventory_control.value = `O${docNum}RI${getRandomLetter()}${getRandomLetter()}TL01`;
    };
    const RI_calculate_DD = () => {
        // Using 2022 logic as default
        a417_fields.document_discriminator.value = getRandomNumericString(7);
    };
    /*const RI_calculate_DD = () => {
    const issueDate = document.getElementById("inputIssueDate").value.trim(); // MMDDYYYY
    if (issueDate.length !== 8 || !/^\d{8}$/.test(issueDate)) {
        showInputDataAlert("DD calculation error. Incorrect issue date!");
        return;
    }

    const issueYear = parseInt(issueDate.slice(-4), 10);

    if (issueYear > 2017) {
        document.getElementById("inputDD").value = getRandomNumericString(6);
        return;
    }

    const documentNumber = document.getElementById("inputDocumentNumber").value.trim();
    if (documentNumber.length !== 7) {
        showInputDataAlert("DD calculation error. Incorrect document number!");
        return;
    }

    const dd =
        documentNumber +
        issueDate.slice(-4) +    // YYYY
        issueDate.slice(0, 2) +  // MM
        issueDate.slice(2, 4) +  // DD
        getRandomNumericString(6);

    document.getElementById("inputDD").value = dd;
};
*/

/*
 $$$$   $$$$  $$  $$ $$$$$$ $$  $$     $$$$   $$$$  $$$$$   $$$$  $$     $$$$$$ $$  $$  $$$$
$$     $$  $$ $$  $$   $$   $$  $$    $$  $$ $$  $$ $$  $$ $$  $$ $$       $$   $$$ $$ $$  $$
 $$$$  $$  $$ $$  $$   $$   $$$$$$    $$     $$$$$$ $$$$$  $$  $$ $$       $$   $$ $$$ $$$$$$
    $$ $$  $$ $$  $$   $$   $$  $$    $$  $$ $$  $$ $$  $$ $$  $$ $$       $$   $$  $$ $$  $$
 $$$$   $$$$   $$$$    $$   $$  $$     $$$$  $$  $$ $$  $$  $$$$  $$$$$$ $$$$$$ $$  $$ $$  $$
*/
    const SC_calculate_documentNumber = () => { a417_fields.customer_id.value = "10" + getRandomNumericString(7); };
    const SC_calculate_DD = () => {
    const expiryDate = a417_fields.expiry_date.value;

    // Kiểm tra dữ liệu đầu vào
    if (!expiryDate || expiryDate.length !== 8) {
        showInputDataAlert("SC DD Error: Incorrect expiry date (MMDDYYYY)!");
        return;
    }
    
    // Ghép chuỗi DD bằng template literal
    const ddValue = 
        `${getRandomNumericString(8)}` +
        `${expiryDate.slice(0, 2)}` +  // MM
        `${expiryDate.slice(-2)}` +    // YY
        `${getNumberOfDaysFromBeginnigOfYear(expiryDate)}` +
        `${getRandomNumericString(4)}`;

    a417_fields.document_discriminator.value = ddValue;
};

    
    
/*
 $$$$   $$$$  $$  $$ $$$$$$ $$  $$     $$$$$   $$$$  $$  $$  $$$$  $$$$$$  $$$$
$$     $$  $$ $$  $$   $$   $$  $$     $$  $$ $$  $$ $$ $$  $$  $$   $$   $$  $$
 $$$$  $$  $$ $$  $$   $$   $$$$$$     $$  $$ $$$$$$ $$$$   $$  $$   $$   $$$$$$
    $$ $$  $$ $$  $$   $$   $$  $$     $$  $$ $$  $$ $$ $$  $$  $$   $$   $$  $$
  $$$$  $$$$   $$$$    $$   $$  $$     $$$$$  $$  $$ $$  $$  $$$$    $$   $$  $$
*/
    const SD_calculate_documentNumber = () => { a417_fields.customer_id.value = "01" + getRandomNumericString(6); };
    const SD_calculate_ICN = () => { a417_fields.inventory_control.value = "042000" + getRandomNumericString(10); };
const SD_calculate_DD = () => {
    // Lấy giá trị từ các trường
    const issueDate = a417_fields.issue_date.value;
    const documentNumber = a417_fields.customer_id.value;

    // Kiểm tra dữ liệu đầu vào
    if (!issueDate || issueDate.length !== 8) {
        showInputDataAlert("SD DD Error: Incorrect issue date (MMDDYYYY)!");
        return;
    }
    if (!documentNumber || documentNumber.length !== 8) {
        showInputDataAlert("SD DD Error: Incorrect document number (must be 8 digits)!");
        return;
    }

    // Ghép chuỗi DD theo công thức
    const ddValue = 
        `${documentNumber}` +
        `${issueDate.slice(-4)}${issueDate.slice(0, 2)}${issueDate.slice(2, 4)}` + // YYYYMMDD
        `${getRandomNumericString(7)}`;

    a417_fields.document_discriminator.value = ddValue;
};

/*
$$$$$$ $$$$$ $$  $$ $$  $$ $$$$$  $$$$   $$$$  $$$$$ $$$$$
  $$   $$    $$$ $$ $$$ $$ $$    $$     $$     $$    $$
  $$   $$$$  $$ $$$ $$ $$$ $$$$   $$$$   $$$$  $$$$  $$$$
  $$   $$    $$  $$ $$  $$ $$        $$     $$ $$    $$
  $$   $$$$$ $$  $$ $$  $$ $$$$$  $$$$   $$$$  $$$$$ $$$$$
*/

// ========================== Nennessee (TN) =========================== //
        // TENNESSEE (TN) - UPDATED
    const TN_calculate_documentNumber = () => {
        a417_fields.customer_id.value = (Math.random() < 0.5 ? '0' : '1') + getRandomNumericString(8);
    };
    const TN_calculate_ICN = () => {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("TN ICN Error: Incorrect issue date!");
            return;
        }
        a417_fields.inventory_control.value = 
            issueDate.slice(-2) + 
            getNumberOfDaysFromBeginnigOfYear(issueDate) + 
            getRandomNumericString(9) + "0101";
    };
    const TN_calculate_DD = () => {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("TN DD Error: Incorrect issue date!");
            return;
        }
        const formattedDate = issueDate.slice(-2) + issueDate.slice(0, 2) + issueDate.slice(2, 4); // YYMMDD
        a417_fields.document_discriminator.value = 
            getRandomNumericString(2) + "0" + formattedDate + getRandomNumericString(7);
    };

  /*
$$$$$$ $$$$$ $$  $$  $$$$   $$$$ 
  $$   $$     $$$$  $$  $$ $$
  $$   $$$$    $$   $$$$$$  $$$$
  $$   $$     $$$$  $$  $$     $$
  $$   $$$$$ $$  $$ $$  $$  $$$$
*/

// ======== TEXAS (TX) ======== //
    // TEXAS (TX) - UPDATED
    const TX_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomNumericString(8);
    };
    const TX_calculate_ICN = () => {
        a417_fields.inventory_control.value = "10000" + getRandomNumericString(6);
    };
    const TX_calculate_DD = () => {
        a417_fields.document_discriminator.value = getRandomNumericString(20);
    };

/*const TX_2016_calculate_ICN = () => {
    const documentNumber = document.getElementById("inputDocumentNumber").value.trim();
    if (documentNumber.length !== 8) {
        showInputDataAlert("ICN calculation error. Incorrect document number!");
        return;
    }

    const issueDate = document.getElementById("inputIssueDate").value.trim(); // MMDDYYYY
    if (issueDate.length !== 8 || !/^\d{8}$/.test(issueDate)) {
        showInputDataAlert("ICN calculation error. Incorrect issue date!");
        return;
    }

    // Tạo đối tượng ngày từ chuỗi MMDDYYYY
    const month = parseInt(issueDate.slice(0, 2), 10) - 1; // Tháng trong JS bắt đầu từ 0
    const day = parseInt(issueDate.slice(2, 4), 10);
    const year = parseInt(issueDate.slice(4), 10);

    const issueDateObj = new Date(year, month, day);
    issueDateObj.setDate(issueDateObj.getDate() + 1); // Cộng thêm 1 ngày

    // Format lại thành YYYYMMDD
    const formattedDate = issueDateObj.getFullYear().toString()
        + String(issueDateObj.getMonth() + 1).padStart(2, '0')
        + String(issueDateObj.getDate()).padStart(2, '0');

    document.getElementById("inputICN").value = `${documentNumber}  ${formattedDate}`;
};
*/
  /*
$$  $$ $$$$$$  $$$$  $$  $$
$$  $$   $$   $$  $$ $$  $$
$$  $$   $$   $$$$$$ $$$$$$
$$  $$   $$   $$  $$ $$  $$
 $$$$    $$   $$  $$ $$  $$
*/
        // UTAH (UT) - UPDATED
    const UT_calculate_documentNumber = () => {
        a417_fields.customer_id.value = "1" + getRandomNumericString(8);
    };
    const UT_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        if (!docNum || docNum.length !== 9) {
            showInputDataAlert("UT ICN Error: Document Number (must be 9 chars) is required!");
            return;
        }
        a417_fields.inventory_control.value = `${docNum}UT${getRandomDigit()}${getRandomDigit()}SL01`;
    };
    const UT_calculate_DD = () => {
        a417_fields.document_discriminator.value = getRandomNumericString(8);
    };
    /*const UT_2016_calculate_REAL_ID = (alertEnabled = true) => {
    console.log("Running REAL ID check...");

    const issueDate = document.getElementById("inputIssueDate").value.trim(); // MMDDYYYY
    if (issueDate.length !== 8 || !/^\d{8}$/.test(issueDate)) {
        if (alertEnabled) {
            showInputDataAlert("REAL ID calculation error. Incorrect issue date!");
        }
        return;
    }

    // Tạo đối tượng ngày từ MMDDYYYY
    const year = parseInt(issueDate.slice(4), 10);
    const month = parseInt(issueDate.slice(0, 2), 10) - 1;
    const day = parseInt(issueDate.slice(2, 4), 10);
    const issueDateObj = new Date(year, month, day);

    const realIDCutoff = new Date(2019, 1, 1); // February 1, 2019

    const realIDStatus = issueDateObj >= realIDCutoff ? "F" : "N"; // F = REAL ID, N = NOT
    document.getElementById("inputIsRealID").value = realIDStatus;
};
*/

  
/*
$$  $$ $$$$$$ $$$$$   $$$$  $$$$$$ $$  $$ $$$$$$  $$$$
$$  $$   $$   $$  $$ $$       $$   $$$ $$   $$   $$  $$
$$  $$   $$   $$$$$  $$ $$$   $$   $$ $$$   $$   $$$$$$
 $$$$    $$   $$  $$ $$  $$   $$   $$  $$   $$   $$  $$
  $$   $$$$$$ $$  $$  $$$$  $$$$$$ $$  $$ $$$$$$ $$  $$
*/


// ========================== VIRGINIA (VA) =========================== //
    // VIRGINIA (VA) - UPDATED
    const VA_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomLetter() + getRandomNumericString(8);
    };
    const VA_calculate_ICN = () => {
        a417_fields.inventory_control.value = "0060101" + getRandomNumericString(9);
    };
    const VA_calculate_DD = () => {
        a417_fields.document_discriminator.value = "0" + getRandomNumericString(8);
    };


/*
$$  $$ $$$$$ $$$$$  $$   $  $$$$  $$  $$ $$$$$$
$$  $$ $$    $$  $$ $$$ $$ $$  $$ $$$ $$   $$
$$  $$ $$$$  $$$$$  $$ $ $ $$  $$ $$ $$$   $$
 $$$$  $$    $$  $$ $$   $ $$  $$ $$  $$   $$
  $$   $$$$$ $$  $$ $$   $  $$$$  $$  $$   $$
*/
    const VT_calculate_documentNumber = () => { a417_fields.customer_id.value = getRandomNumericString(8); };
const VT_calculate_DD = () => {
    // Lấy giá trị từ các trường
    const documentNumber = a417_fields.customer_id.value;
    const issueDate = a417_fields.issue_date.value;

    // Kiểm tra dữ liệu đầu vào
    if (!documentNumber || documentNumber.length !== 8) {
        showInputDataAlert("VT DD Error: Incorrect document number (must be 8 digits)!");
        return;
    }
    if (!issueDate || issueDate.length !== 8) {
        showInputDataAlert("VT DD Error: Incorrect issue date (MMDDYYYY)!");
        return;
    }

    // Ghép chuỗi DD theo công thức
    const ddValue = 
        `${issueDate.slice(0, 4)}` + // MMDD
        `${issueDate.slice(-2)}` +   // YY
        `${getRandomNumericString(4)}` +
        `${documentNumber}`;

    a417_fields.document_discriminator.value = ddValue;
};
/*
$$   $  $$$$   $$$$  $$  $$ $$$$$$ $$  $$  $$$$  $$$$$$  $$$$  $$  $$
$$   $ $$  $$ $$     $$  $$   $$   $$$ $$ $$       $$   $$  $$ $$$ $$
$$ $ $ $$$$$$  $$$$  $$$$$$   $$   $$ $$$ $$ $$$   $$   $$  $$ $$ $$$
$$$$$$ $$  $$     $$ $$  $$   $$   $$  $$ $$  $$   $$   $$  $$ $$  $$
 $$ $$ $$  $$  $$$$  $$  $$ $$$$$$ $$  $$  $$$$    $$    $$$$  $$  $$
*/

// ================== WASHINGTON (WA) ================== //
            // WASHINGTON (WA) - UPDATED
    const WA_calculate_documentNumber = () => {
        let random_string = "";
        for (let i = 0; i < 8; i++) {
            random_string += getRandomLetterAndDigit();
        }
        a417_fields.customer_id.value = "WDL" + random_string + "B";
    };
    const WA_calculate_ICN = () => {
        const issueDate = a417_fields.issue_date.value;
        if (!issueDate || issueDate.length !== 8) {
            showInputDataAlert("WA ICN calculation error: Incorrect issue date!");
            return;
        }
        a417_fields.inventory_control.value = 
            getRandomLetter() +
            issueDate.slice(0, 2) + 
            issueDate.slice(2, 4) + 
            issueDate.slice(-2) + 
            "98" + 
            getRandomNumericString(4);
    };
    const WA_calculate_DD = () => {
        const docNum = a417_fields.customer_id.value;
        let inventory_control = a417_fields.inventory_control.value;

        if (!docNum || docNum.length !== 12) {
            showInputDataAlert("WA DD Error: A valid 12-char Document Number is required! Please generate it first.");
            return;
        }
        // If ICN is missing, generate it first.
        if (!inventory_control || inventory_control.length !== 13) {
             WA_calculate_ICN();
             inventory_control = a417_fields.inventory_control.value;
        }
        a417_fields.document_discriminator.value = docNum + inventory_control;
    };
   /*
$$   $ $$$$$$  $$$$   $$$$   $$$$  $$  $$  $$$$  $$$$$$ $$  $$
$$   $   $$   $$     $$  $$ $$  $$ $$$ $$ $$       $$   $$$ $$
$$ $ $   $$    $$$$  $$     $$  $$ $$ $$$  $$$$    $$   $$ $$$
$$$$$$   $$       $$ $$  $$ $$  $$ $$  $$     $$   $$   $$  $$
 $$ $$ $$$$$$  $$$$   $$$$   $$$$  $$  $$  $$$$  $$$$$$ $$  $$
*/

    // WISCONSIN (WI) - UPDATED
           // WISCONSIN (WI) - FINAL STABLE VERSION
    const WI_calculate_documentNumber = () => {
        const lastName = a417_fields.family_name.value;
        if (!lastName) {
            showInputDataAlert("WI Doc Number error: Last Name is required!");
            return;
        }
        // Format: LNNN-NNNN-NNNN-NN (1 Letter, 13 numbers, with dashes)
        a417_fields.customer_id.value = 
            lastName.charAt(0).toUpperCase() + 
            getRandomNumericString(3) + "-" +
            getRandomNumericString(4) + "-" +
            getRandomNumericString(4) + "-" +
            getRandomNumericString(2);
    };
    const WI_calculate_ICN = () => {
        a417_fields.inventory_control.value = "0130100" + getRandomNumericString(9);
    };
    const WI_calculate_DD = () => {
        const lastName = a417_fields.family_name.value;
        const issueDate = a417_fields.issue_date.value;
        if (!lastName || !issueDate) {
            showInputDataAlert("WI DD Error: Last Name and Issue Date are required!");
            return;
        }
        const formattedDate = issueDate.slice(-4) + issueDate.slice(0, 2) + issueDate.slice(2, 4); // YYYYMMDD
        const randomSample = Math.random() < 0.5 ? "10" : "15";

        a417_fields.document_discriminator.value = 
            `OT${lastName.charAt(0).toUpperCase()}${getRandomLetter()}${getRandomLetter()}${formattedDate}${randomSample}${getRandomNumericString(6)}`;
    };
  /*
##   # #####  ####  ######    ##  ## ###### #####   ####  ###### ##  ## ######  ####
##   # ##    ##       ##      ##  ##   ##   ##  ## ##       ##   ### ##   ##   ##  ##
## # # ####   ####    ##      ##  ##   ##   #####  ## ###   ##   ## ###   ##   ######
###### ##        ##   ##       ####    ##   ##  ## ##  ##   ##   ##  ##   ##   ##  ##
 ## ## #####  ####    ##        ##   ###### ##  ##  ####  ###### ##  ## ###### ##  ##
*/

// ========================== WEST VIRGINIA (WV) =========================== //

        // WEST VIRGINIA (WV) - UPDATED
    const WV_calculate_documentNumber = () => {
        a417_fields.customer_id.value = getRandomLetter() + getRandomNumericString(6);
    };
    const WV_calculate_ICN = () => {
        const docNum = a417_fields.customer_id.value;
        if (!docNum || docNum.length !== 7) {
            showInputDataAlert("WV ICN Error: Document Number (must be 7 chars) is required!");
            return;
        }
        a417_fields.inventory_control.value = 
            docNum + "WV" + 
            getRandomLetter() + 
            getRandomLetter() + 
            getRandomLetter() + 
            getRandomLetter() + "01";
    };
    const WV_calculate_DD = () => {
        const birthDate = a417_fields.dob.value;
        const expiryDate = a417_fields.expiry_date.value;
        const lastName = a417_fields.family_name.value;
        const firstName = a417_fields.first_name.value;

        if (!birthDate || birthDate.length !== 8) { showInputDataAlert("WV DD Error: A valid Birth Date is required."); return; }
        if (!expiryDate || expiryDate.length !== 8) { showInputDataAlert("WV DD Error: A valid Expiry Date is required."); return; }
        if (!lastName) { showInputDataAlert("WV DD Error: Last Name is required."); return; }
        if (!firstName) { showInputDataAlert("WV DD Error: First Name is required."); return; }

        a417_fields.document_discriminator.value = 
            birthDate.slice(0, 4) + 
            birthDate.slice(-2) + 
            lastName.charAt(0).toUpperCase() + 
            firstName.charAt(0).toUpperCase() + 
            expiryDate.slice(-2) + 
            expiryDate.slice(0, 2);
    };
    /*
$$   $ $$  $$  $$$$  $$   $ $$$$$$ $$  $$  $$$$
$$   $  $$$$  $$  $$ $$$ $$   $$   $$$ $$ $$
$$ $ $   $$   $$  $$ $$ $ $   $$   $$ $$$ $$ $$$
$$$$$$   $$   $$  $$ $$   $   $$   $$  $$ $$  $$
 $$ $$   $$    $$$$  $$   $ $$$$$$ $$  $$  $$$$
*/

       // WYOMING (WY) - UPDATED
    const WY_calculate_documentNumber = () => {
        a417_fields.customer_id.value = "11" + getRandomNumericString(7);
    };
    const WY_calculate_ICN_and_DD = () => {
        // This single function generates a value and sets it for both ICN and DD
        const value = "100003" + getRandomNumericString(3) + "7";
        a417_fields.inventory_control.value = value;
        a417_fields.document_discriminator.value = value;
    };
    /*
$$   $  $$$$   $$$$  $$  $$ $$$$$$ $$  $$  $$$$  $$$$$$  $$$$  $$  $$      $$$$$   $$$$
$$   $ $$  $$ $$     $$  $$   $$   $$$ $$ $$       $$   $$  $$ $$$ $$      $$  $$ $$  $$
$$ $ $ $$$$$$  $$$$  $$$$$$   $$   $$ $$$ $$ $$$   $$   $$  $$ $$ $$$      $$  $$ $$
$$$$$$ $$  $$     $$ $$  $$   $$   $$  $$ $$  $$   $$   $$  $$ $$  $$      $$  $$ $$  $$
 $$ $$ $$  $$  $$$$  $$  $$ $$$$$$ $$  $$  $$$$    $$    $$$$  $$  $$      $$$$$   $$$$
*/
// ================= DISTRICT OF COLUMBIA (DC) - UPDATED ================= //
const DC_calculate_documentNumber = () => {
    a417_fields.customer_id.value = getRandomNumericString(7);
};

const DC_calculate_audit_info = () => {
    const issueDateStr = a417_fields.issue_date.value;

    // Kiểm tra dữ liệu đầu vào
    if (!issueDateStr || issueDateStr.length !== 8) {
        showInputDataAlert("DC Audit Info Error: Incorrect issue date (MMDDYYYY)!");
        return;
    }

    // Phân tích ngày tháng và cộng thêm 5 ngày
    const year = parseInt(issueDateStr.slice(-4));
    const month = parseInt(issueDateStr.slice(0, 2)) - 1; // Tháng trong JS bắt đầu từ 0
    const day = parseInt(issueDateStr.slice(2, 4));
    
    const issueDateObj = new Date(year, month, day);
    issueDateObj.setDate(issueDateObj.getDate() + 5);

    // Định dạng lại ngày mới thành chuỗi MMDDYYYY
    // Sử dụng hàm getFormattedDate_MMDDYYYY đã có sẵn để đảm bảo tính nhất quán
    const formattedDate = getFormattedDate_MMDDYYYY(issueDateObj);

    // Tạo chuỗi Audit Info cuối cùng
    const auditValue = `${formattedDate}_${getRandomNumericString(6)}_${getRandomDigit()}_${getRandomNumericString(3)}`;
    
    a417_fields.audit_info.value = auditValue;
};

const DC_calculate_DD = () => {
    a417_fields.document_discriminator.value = getRandomNumericString(8);
};

    //--- END OF STATE-SPECIFIC GENERATORS ---
    
        const fieldGenerators = {
        generic: {
            customer_id: generic_calculate_documentNumber,
            document_discriminator: generic_calculate_DD,
            inventory_control: generic_calculate_ICN,
            family_name: randomize_family_name,
            first_name: randomize_first_name,
            dob: randomize_dob,
            issue_date: randomize_issue_date,
            expiry_date: randomize_expiry_date,
        },
        specific: {
            'DC': { customer_id: DC_calculate_documentNumber, audit_info: DC_calculate_audit_info, document_discriminator: DC_calculate_DD },
            'AK': { customer_id: AK_calculate_documentNumber, inventory_control: AK_calculate_ICN, document_discriminator: AK_calculate_DD },
            'AL': { customer_id: AL_calculate_documentNumber, inventory_control: AL_calculate_ICN, expiry_date: AL_calculate_expiry_date },
            'AR': { customer_id: AR_calculate_documentNumber, inventory_control: AR_calculate_ICN, document_discriminator: AR_calculate_DD },
            'AZ': { customer_id: AZ_calculate_documentNumber, inventory_control: AZ_calculate_ICN, document_discriminator: AZ_calculate_DD },
            'CA': { customer_id: CA_calculate_documentNumber, inventory_control: CA_calculate_ICN, document_discriminator: CA_calculate_DD },
            'CO': { customer_id: CO_calculate_documentNumber, inventory_control: CO_calculate_ICN, document_discriminator: CO_calculate_DD },
            'CT': { customer_id: CT_calculate_documentNumber, inventory_control: CT_calculate_ICN, document_discriminator: CT_calculate_DD },
            'DE': { customer_id: DE_calculate_documentNumber, inventory_control: DE_calculate_ICN, document_discriminator: DE_calculate_DD },
            'FL': { customer_id: FL_calculate_documentNumber, inventory_control: FL_calculate_ICN, document_discriminator: FL_calculate_DD },
            'GA': { customer_id: GA_calculate_documentNumber, inventory_control: GA_calculate_ICN, document_discriminator: GA_calculate_DD  },
            'HI': { customer_id: HI_calculate_documentNumber, inventory_control: HI_calculate_ICN, document_discriminator: HI_calculate_DD},
            'IA': {customer_id: IA_calculate_documentNumber, inventory_control: IA_calculate_ICN, document_discriminator: IA_calculate_DD},            'ID': { customer_id: ID_calculate_documentNumber, inventory_control: ID_calculate_ICN, document_discriminator: ID_calculate_DD },
            'IL': { customer_id: IL_calculate_documentNumber, inventory_control: IL_calculate_ICN, document_discriminator: IL_calculate_DD },
            'IN': { customer_id: IN_calculate_documentNumber, inventory_control: IN_calculate_ICN, document_discriminator: IN_calculate_DD },
            'KS': { customer_id: KS_calculate_documentNumber, inventory_control: KS_calculate_ICN, document_discriminator: KS_calculate_DD },            'KY': { customer_id: KY_calculate_documentNumber, inventory_control: KY_calculate_ICN, document_discriminator: KY_calculate_DD },
            'LA': { customer_id: LA_calculate_documentNumber, inventory_control: LA_calculate_ICN, audit_info: LA_calculate_audit_info, issuing_office: LA_calculate_issuing_office }, 
            'MD': { customer_id: MD_calculate_documentNumber, inventory_control: MD_calculate_ICN, document_discriminator: MD_calculate_DD },
            'ME': { customer_id: ME_calculate_documentNumber, inventory_control: ME_calculate_ICN, document_discriminator: ME_calculate_DD },
            'MI': { customer_id: MI_calculate_documentNumber, inventory_control: MI_calculate_ICN, document_discriminator: MI_calculate_DD },
            'MN': { customer_id: MN_calculate_documentNumber, inventory_control: MN_calculate_ICN, document_discriminator: MN_calculate_DD },
            'MO': { customer_id: MO_calculate_documentNumber, inventory_control: MO_calculate_ICN, document_discriminator: MO_calculate_DD },
            'MS': { customer_id: MS_calculate_documentNumber, inventory_control: MS_calculate_ICN, document_discriminator: MS_calculate_DD },
            'MT': { customer_id: MT_calculate_documentNumber, inventory_control: MT_calculate_ICN, document_discriminator: MT_calculate_DD },
            'NC': { customer_id: NC_calculate_documentNumber, inventory_control: NC_calculate_ICN, document_discriminator: NC_calculate_DD },
            'ND': { customer_id: ND_calculate_documentNumber, inventory_control: ND_calculate_ICN, document_discriminator: ND_calculate_DD },
            'NE': { customer_id: NE_calculate_documentNumber, inventory_control: NE_calculate_ICN, document_discriminator: NE_calculate_DD },
            'NH': { customer_id: NH_calculate_documentNumber, inventory_control: NH_calculate_ICN, document_discriminator: NH_calculate_DD },
            'NJ': { customer_id: NJ_calculate_documentNumber, inventory_control: NJ_calculate_ICN, document_discriminator: NJ_calculate_DD },
            'NM': { customer_id: NM_calculate_documentNumber, inventory_control: NM_calculate_ICN },
            'NV': { customer_id: NV_calculate_documentNumber, inventory_control: NV_calculate_ICN, document_discriminator: NV_calculate_DD },
            'NY': { customer_id: NY_calculate_documentNumber, document_discriminator: NY_calculate_DD },
            'OH': { customer_id: OH_calculate_documentNumber, inventory_control: OH_calculate_ICN, document_discriminator: OH_calculate_DD },
            'OK': { customer_id: OK_calculate_documentNumber, inventory_control: OK_calculate_ICN, document_discriminator: OK_calculate_DD },
            'OR': { customer_id: OR_calculate_documentNumber, inventory_control: OR_calculate_ICN, document_discriminator: OR_calculate_DD },            
            'PA': { customer_id: PA_calculate_documentNumber, inventory_control: PA_calculate_ICN, document_discriminator: PA_calculate_DD },
            'RI': { customer_id: RI_calculate_documentNumber, inventory_control: RI_calculate_ICN, document_discriminator: RI_calculate_DD },
            'SC': {  customer_id: SC_calculate_documentNumber, document_discriminator: SC_calculate_DD },            
            'SD': { customer_id: SD_calculate_documentNumber, inventory_control: SD_calculate_ICN, document_discriminator: SD_calculate_DD }, 
           'TN': { customer_id: TN_calculate_documentNumber, inventory_control: TN_calculate_ICN, document_discriminator: TN_calculate_DD },
            'TX': { customer_id: TX_calculate_documentNumber, inventory_control: TX_calculate_ICN },
            'UT': { customer_id: UT_calculate_documentNumber, inventory_control: UT_calculate_ICN, document_discriminator: UT_calculate_DD },
            'VA': { customer_id: VA_calculate_documentNumber, inventory_control: VA_calculate_ICN, document_discriminator: VA_calculate_DD },
            'VT': { customer_id: VT_calculate_documentNumber, document_discriminator: VT_calculate_DD },
            'WA': { customer_id: WA_calculate_documentNumber, inventory_control: WA_calculate_ICN, document_discriminator: WA_calculate_DD },
            'WI': { inventory_control: WI_calculate_ICN, document_discriminator: WI_calculate_DD },
            'WV': { customer_id: WV_calculate_documentNumber, inventory_control: WV_calculate_ICN, document_discriminator: WV_calculate_DD },
            'WY': { customer_id: WY_calculate_documentNumber, inventory_control: WY_calculate_ICN_and_DD, document_discriminator: WY_calculate_ICN_and_DD 
}
        
        }
    };
    
    function generateAllRandomData() {
        const stateSelector = document.getElementById('a417-state-selector-for-random');
        const selectedState = stateSelector.value.toUpperCase().trim();
        if (!selectedState) {
            alert("Vui lòng chọn một tiểu bang.");
            stateSelector.focus();
            return;
        }
        a417_fields.state.value = selectedState;
        

        a417_fields.sex.value = Math.random() > 0.5 ? "1" : "2";
        fieldGenerators.generic.family_name();
        fieldGenerators.generic.first_name();
        fieldGenerators.generic.dob();
        fieldGenerators.generic.issue_date();
        fieldGenerators.generic.expiry_date();
        
        const cityData = {
            AK: { cities: ["Anchorage", "Fairbanks", "Juneau"], zips: [99501, 99701, 99801]}, AL: { cities: ["Birmingham", "Montgomery", "Huntsville"], zips: [35203, 36104, 35801]},
            AR: { cities: ["Little Rock", "Fort Smith", "Fayetteville"], zips: [72201, 72901, 72701]}, AZ: { cities: ["Phoenix", "Tucson", "Mesa"], zips: [85001, 85701, 85201]},
            CA: { cities: ["Los Angeles", "San Diego", "San Jose"], zips: [90001, 92101, 95101]}, CO: { cities: ["Denver", "Colorado Springs", "Aurora"], zips: [80202, 80903, 80010]},
            CT: { cities: ["Bridgeport", "New Haven", "Hartford"], zips: [6604, 6510, 6103]}, DE: { cities: ["Wilmington", "Dover", "Newark"], zips: [19801, 19901, 19711]},
            FL: { cities: ["Jacksonville", "Miami", "Tampa"], zips: [32202, 33101, 33602]}, ID: { cities: ["Boise", "Meridian", "Nampa"], zips: [83702, 83642, 83651]},
            IL: { cities: ["Chicago", "Aurora", "Joliet"], zips: [60601, 60502, 60431]}, IN: { cities: ["Indianapolis", "Fort Wayne", "Evansville"], zips: [46204, 46802, 47708]},
            KY: { cities: ["Louisville", "Lexington", "Bowling Green"], zips: [40202, 40507, 42101]}, MA: { cities: ["Boston", "Worcester", "Springfield"], zips: [2108, 1602, 1103]},
            ME: { cities: ["Portland", "Lewiston", "Bangor"], zips: [4101, 4240, 4401]}, MI: { cities: ["Detroit", "Grand Rapids", "Warren"], zips: [48201, 49503, 48089]},
            MN: { cities: ["Minneapolis", "Saint Paul", "Rochester"], zips: [55401, 55101, 55901]}, MO: { cities: ["Kansas City", "Saint Louis", "Springfield"], zips: [64105, 63101, 65801]},
            MS: { cities: ["Jackson", "Gulfport", "Southaven"], zips: [39201, 39501, 38671]}, MT: { cities: ["Billings", "Missoula", "Great Falls"], zips: [59101, 59801, 59401]},
            NC: { cities: ["Charlotte", "Raleigh", "Greensboro"], zips: [28202, 27601, 27401]}, NH: { cities: ["Manchester", "Nashua", "Concord"], zips: [3101, 3060, 3301]},
            NJ: { cities: ["Newark", "Jersey City", "Paterson"], zips: [7102, 7302, 7501]}, NV: { cities: ["Las Vegas", "Henderson", "Reno"], zips: [89101, 89002, 89501]},
            NY: { cities: ["New York", "Buffalo", "Rochester"], zips: [10001, 14201, 14602]}, OH: { cities: ["Columbus", "Cleveland", "Cincinnati"], zips: [43215, 44101, 45202]},
            OK: { cities: ["Oklahoma City", "Tulsa", "Norman"], zips: [73102, 74103, 73019]}, RI: { cities: ["Providence", "Warwick", "Cranston"], zips: [2903, 2886, 2920]},
            TN: { cities: ["Nashville", "Memphis", "Knoxville"], zips: [37201, 38103, 37901]}, TX: { cities: ["Houston", "San Antonio", "Dallas"], zips: [77002, 78205, 75201]},
            UT: { cities: ["Salt Lake City", "West Valley City", "Provo"], zips: [84101, 84119, 84601]}, VA: { cities: ["Virginia Beach", "Norfolk", "Chesapeake"], zips: [23450, 23501, 23320]},
            WA: { cities: ["Seattle", "Spokane", "Tacoma"], zips: [98101, 99201, 98402]}, WI: { cities: ["Milwaukee", "Madison", "Green Bay"], zips: [53202, 53703, 54301]},
            WV: { cities: ["Charleston", "Huntington", "Morgantown"], zips: [25301, 25701, 26501]}, WY: { cities: ["Cheyenne", "Casper", "Laramie"], zips: [82001, 82601, 82070]}
        };
        const currentCityData = cityData[selectedState] || { cities: ["Anytown"], zips: [12345]};
        const randomIndex = Math.floor(Math.random() * currentCityData.cities.length);
        
        a417_fields.city.value = currentCityData.cities[randomIndex];
        a417_fields.postal_code.value = String(currentCityData.zips[randomIndex] + Math.floor(Math.random() * 50)).padStart(5,'0');
        a417_fields.street1.value = `${Math.floor(Math.random() * 9000) + 100} ${["Main St", "Oak Ave", "Pine Rd"][Math.floor(Math.random()*3)]}`;
        
        a417_fields.height.value = `0${(Math.floor(Math.random() * 16) + 60)}`;
        a417_fields.weight_pounds.value = (Math.floor(Math.random() * 100) + 120).toString();
        
        ['customer_id', 'inventory_control', 'document_discriminator'].forEach(fieldName => {
            const generator = (fieldGenerators.specific[selectedState] && fieldGenerators.specific[selectedState][fieldName]) 
                              || fieldGenerators.generic[fieldName];
            if(generator) generator();
        });
        
        alert(`Đã tạo dữ liệu ngẫu nhiên cho tiểu bang: ${selectedState}`);
    }

    // --- CORE APPLICATION FUNCTIONS ---
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

                if (jsonData.length === 0) {
                    alert("No data found in Excel file.");
                    return;
                }

                a417_all_records = [];
                a417_barcode_images = {};
                
                // Ánh xạ từ tiêu đề cột Excel sang tên trường nội bộ
                const excelMapping = {
                    'Last Name': 'family_name', 'First Name': 'first_name', 'Middle Name': 'middle_name',
                    'Date of Birth': 'dob', 'Expiration Date': 'expiry_date', 'Issue Date': 'issue_date',
                    'ID Number': 'customer_id', 'Address 1': 'street1', 'City': 'city', 'State': 'state',
                    'Postal Code': 'postal_code', 'Sex': 'sex', 'Eye Color': 'eye_color', 'Height': 'height',
                    'Hair Color': 'hair_color', 'Weight (lbs)': 'weight_pounds', 'Country': 'country',
                    'Document Discriminator': 'document_discriminator', 'Card Revision Date': 'card_revision_date',
                    'Inventory control': 'inventory_control', 'Vehicle Class': 'vehicle_class',
                    'Filename': 'filename',
                    // Thêm các trường mới nếu có trong Excel
                    'Issuing Office': 'issuing_office',
                    'Audit Information': 'audit_info'
                };

                // Lấy danh sách tất cả các tên trường hợp lệ từ fieldDefinitions
                const allFieldNames = Object.values(fieldDefinitions).flatMap(cat => cat.fields.map(f => f.name));

                jsonData.forEach(row => {
                    // === BẮT ĐẦU SỬA ĐỔI QUAN TRỌNG ===
                    // 1. Tạo một đối tượng recordData trống cho mỗi dòng
                    const recordData = {};

                    // 2. Khởi tạo tất cả các trường với giá trị rỗng để đảm bảo tính nhất quán
                    allFieldNames.forEach(fieldName => {
                        recordData[fieldName] = '';
                    });

                    // 3. Điền dữ liệu từ file Excel
                    for (const excelHeader in excelMapping) {
                        if (row[excelHeader] !== undefined && row[excelHeader] !== null) {
                            const fieldName = excelMapping[excelHeader];
                            let value = String(row[excelHeader]).trim();

                            // Xử lý ngày tháng
                            if (['Date of Birth', 'Expiration Date', 'Issue Date'].includes(excelHeader) && value) {
                                // Logic này phức tạp và có thể gây lỗi, đơn giản hóa nó
                                // Giả sử Excel có định dạng MM/DD/YYYY hoặc là số ngày của Excel
                                try {
                                    const date = new Date(value);
                                    // Kiểm tra xem có phải là ngày hợp lệ không
                                    if (!isNaN(date.getTime())) {
                                        value = getFormattedDate_MMDDYYYY(date);
                                    }
                                    // Nếu không, giữ nguyên giá trị gốc từ Excel (có thể là MMDDYYYY)
                                } catch (dateError) {
                                    // Bỏ qua lỗi và giữ nguyên giá trị
                                }
                            } 
                            // Xử lý giới tính: chuyển đổi mọi thứ về 1, 2, hoặc 9
                            else if (fieldName === 'sex') {
                                const val_lower = value.toLowerCase();
                                if (['male', 'm', '1', 'nam'].includes(val_lower)) {
                                    value = "1";
                                } else if (['female', 'f', '2', 'nữ'].includes(val_lower)) {
                                    value = "2";
                                } else {
                                    value = "9"; // Mặc định là không xác định
                                }
                            }
                            
                            if (fieldName) { // Đảm bảo fieldName tồn tại
                                recordData[fieldName] = value;
                            }
                        }
                    }
                     // === KẾT THÚC SỬA ĐỔI QUAN TRỌNG ===

                    // Thêm các giá trị mặc định nếu cần và chúng chưa được điền từ Excel
                    if (!recordData.country) recordData.country = 'USA';
                    
                    a417_all_records.push(recordData);
                });

                generateAndDisplayAllBarcodes();
                alert(`Successfully imported and generated ${a417_all_records.length} barcodes!`);

            } catch (err) {
                console.error("Error processing Excel file:", err);
                alert("Error processing Excel file: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }
    
    function calculateDlSubfileLength(record_data) {
 const field_to_id = {
        'customer_id': 'DAQ', 'family_name_trunc': 'DDE', 'first_name': 'DAC', 'first_name_trunc': 'DDF', 'middle_name': 'DAD', 'middle_name_trunc': 'DDG',
        'name_suffix': 'DCU', 'dob': 'DBB', 'expiry_date': 'DBA', 'issue_date': 'DBD', 'family_name': 'DCS', 'document_discriminator': 'DCF',
        'country': 'DCG', 'street1': 'DAG', 'street2': 'DAH', 'city': 'DAI', 'state': 'DAJ', 'postal_code': 'DAK', 'sex': 'DBC', 'eye_color': 'DAY',
        'height': 'DAU', 'hair_color': 'DAZ', 'race': 'DCL', 'weight_pounds': 'DAW', 'weight_kg': 'DAX', 'weight_range': 'DCE',
        'vehicle_class': 'DCA', 'restrictions': 'DCB', 'endorsements': 'DCD', 'std_vehicle_class': 'DCM', 'std_restriction': 'DCO',
        'std_endorsement': 'DCN', 'vehicle_class_desc': 'DCP', 'restriction_desc': 'DCR', 'endorsement_desc': 'DCQ',
        'compliance_type': 'DDA', 'card_revision_date': 'DDB', 'limited_duration': 'DDD', 'hazmat_expiry': 'DDC',
        'under_18': 'DDH', 'under_19': 'DDI', 'under_21': 'DDJ', 'organ_donor': 'DDK', 'veteran': 'DDL',
        'alias_family': 'DBN', 'alias_given': 'DBG', 'alias_suffix': 'DBS', 'place_of_birth': 'DCI',
        'audit_info': 'DCJ', 'inventory_control': 'DCK',
        // === THÊM DÒNG NÀY VÀO ===
        'issuing_office': 'IOE'
        // =======================
    };        let total_length = 1; 
        for (const field_name in field_to_id) {
            const value = record_data[field_name] || '';
            if (value) total_length += field_to_id[field_name].length + String(value).length + 1;
        }
        return total_length;     
    }
    //////////////////chỗ hiện thị khi quét
    function generateAamvaDataString(record_data) {
           const dl_length = String(record_data.dl_subfile_length || '0').padStart(4, '0');
    let data = `@\n\u001e\u000dANSI ${record_data.iin || ''.padEnd(6)}`+
               `${(record_data.aamva_version || '').padStart(2, '0')}`+
               `${(record_data.jurisdiction_version || '').padStart(2, '0')}`+
               `${(record_data.subfile_count || '').padStart(2, '0')}`+
               `DL0042${dl_length}DL`;
                   data += `DAQ${String(record_data.customer_id || '')}\n`;

        const data_elements = [
        ['DAQ', 'customer_id'],
        ['DCS', 'family_name'], ['DAC', 'first_name'], ['DAD', 'middle_name'], ['DBD', 'issue_date'],
        ['DBB', 'dob'], ['DBA', 'expiry_date'], ['DBC', 'sex'], ['DAY', 'eye_color'], ['DAU', 'height'],
        ['DAG', 'street1'], ['DAI', 'city'], ['DAI', 'state'], ['DAK', 'postal_code'], ['DCF', 'document_discriminator'],
        ['DCG', 'country'], ['DDE', 'family_name_trunc'], ['DDF', 'first_name_trunc'], ['DDG', 'middle_name_trunc'],
        ['DCA', 'vehicle_class'],['DCB', 'restrictions'],['DCD', 'endorsements'],['DDB', 'card_revision_date'],
        ['DDK', 'organ_donor'],
        // === THÊM TRƯỜNG MỚI VÀO ĐÂY ===
        ['DCK', 'inventory_control'],
        ['DCJ', 'audit_info'],
        ['IOE', 'issuing_office'] // Thêm trường mới
        // ==============================
    ];
            for (const [element_id, field_name] of data_elements) {
        let value = String(record_data[field_name] || '');

        // === BẮT ĐẦU THAY ĐỔI ===
        // Chuyển đổi giá trị giới tính từ số sang chữ cái
        if (field_name === 'sex') {
            if (value === '1') {
                value = 'M';
            } else if (value === '2') {
                value = 'F';
            }
            // Giá trị '9' (Unknown) sẽ được giữ nguyên
        }
        // === KẾT THÚC THAY ĐỔI ===

        // Chỉ thêm các trường có giá trị để tiết kiệm không gian
        if (value) {
            data += `${element_id}${value}\n`;
        }
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
            // SỬA LỖI 2: Sửa lỗi chính tả từ "ApadStart" thành "padStart"
            record.dl_subfile_length = String(dl_length).padStart(4, '0');
            const dataString = generateAamvaDataString(record);
            const canvas = generateBarcode(dataString, scale, padding);
            a417_barcode_images[index] = canvas;
        });
        populateRecordsTable();
         if (a417_all_records.length > 0) {
            onRecordSelect(0); 
        }
        
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
        // updateIinBasedOnState(); // KHÔNG CẦN GỌI Ở ĐÂY VÌ SẼ LÀM THAY ĐỔI DỮ LIỆU ĐÃ IMPORT
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
             if (!currentData.filename) {
            currentData.filename = currentData.customer_id || `record_${new Date().getTime()}`;
        }
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
                // 2. [THÊM MỚI] Hiển thị dữ liệu văn bản (formatted và raw)
            displayFormattedData(currentData);
            rawDataText.value = "RAW AAMVA DATA STRING:\n====================\n" + dataString.replace(/\n/g, '\\n\n').replace(/\u001e/g, '<RS>').replace(/\u000d/g, '<CR>');
                const selectedRow = recordsTableBody.querySelector('tr.selected');
            if (selectedRow) {
                // Cập nhật bản ghi đã có
                const index = parseInt(selectedRow.dataset.index);
                a417_all_records[index] = currentData;
                a417_barcode_images[index] = canvas;
                populateRecordsTable();
                const newSelectedRow = recordsTableBody.querySelector(`[data-index='${index}']`);
                if (newSelectedRow) newSelectedRow.classList.add('selected');
                // alert("Đã cập nhật thành công bản ghi hiện tại!"); // Có thể bỏ alert này để đỡ phiền
            } else {
                // Thêm bản ghi mới
                a417_all_records.push(currentData);
                a417_barcode_images[a417_all_records.length - 1] = canvas;
                populateRecordsTable();
                const newIndex = a417_all_records.length - 1;
                const newRow = recordsTableBody.querySelector(`[data-index='${newIndex}']`);
                if (newRow) newRow.classList.add('selected');
                // alert("Đã tạo và thêm thành công bản ghi mới!"); // Có thể bỏ alert này
            }
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
    // Tôi cũng đã xóa lệnh gọi generateAllRandomData() ở đây để khi tải lại trang,
    // nó không tự động tạo dữ liệu ngẫu nhiên, giúp bạn dễ dàng kiểm tra chức năng import hơn.
    // Nếu bạn muốn nó tự tạo dữ liệu khi tải, hãy thêm lại dòng này:
    // generateAllRandomData(); 
}