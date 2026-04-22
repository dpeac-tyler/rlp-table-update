    // Quick Builder Parser Implementation

    // Store parsed questions globally - load from storage if exists
    let parsedQuestions = [];
    let isEditMode = false;
    let editQuestionIndex = null;

    // Load existing questions from storage on page load
    (function loadExistingQuestions() {
      const storedQuestions = sessionStorage.getItem('reviewQuestions') || localStorage.getItem('reviewQuestions');
      if (storedQuestions) {
        try {
          parsedQuestions = JSON.parse(storedQuestions);
          console.log('Loaded existing questions from storage:', parsedQuestions.length);
        } catch (e) {
          console.error('Error loading questions from storage:', e);
          parsedQuestions = [];
        }
      }
    })();

    // Check if we're in edit mode
    window.addEventListener('DOMContentLoaded', function() {
      const editQuestionData = sessionStorage.getItem('editQuestionData');
      const editIndex = sessionStorage.getItem('editQuestionIndex');

      if (editQuestionData && editIndex !== null) {
        isEditMode = true;
        editQuestionIndex = parseInt(editIndex);
        const questionData = JSON.parse(editQuestionData);

        // Clear the edit data from session storage
        sessionStorage.removeItem('editQuestionData');
        sessionStorage.removeItem('editQuestionIndex');

        // Pre-populate the appropriate section
        if (questionData.questionType === 'ff' || questionData.type === 'ff') {
          populateFreeFormForEdit(questionData);
        } else if (questionData.questionType === 'yn' || questionData.type === 'yn') {
          populateYesNoForEdit(questionData);
        } else if (questionData.questionType === 'ack' || questionData.type === 'ack') {
          populateAcknowledgementForEdit(questionData);
        } else if (questionData.questionType === 'dt' || questionData.type === 'dt') {
          populateDateForEdit(questionData);
        } else if (questionData.questionType === 'mc' || questionData.type === 'mc') {
          populateMultipleChoiceForEdit(questionData);
        } else if (questionData.questionType === 'addr' || questionData.type === 'addr') {
          populateAddressForEdit(questionData);
        } else if (questionData.questionType === 'ms' || questionData.type === 'ms') {
          populateMultiSelectForEdit(questionData);
        } else if (questionData.questionType === 'tbl' || questionData.type === 'tbl') {
          populateTableForEdit(questionData);
        }
      }
    });

    function populateAcknowledgementForEdit(questionData) {
      // Set question type to Acknowledgment
      document.getElementById('questionType').value = 'Acknowledgment';

      // Show Acknowledgement section
      document.getElementById('acknowledgementSection').style.display = 'block';

      // Populate basic fields
      document.getElementById('ackQuestion').value = questionData.question || '';
      document.getElementById('ackQuestionCounter').textContent = (5000 - questionData.question.length) + ' of 5000 remaining';

      // Handle instructions
      if (questionData.instructions && questionData.instructions !== 'y' && questionData.instructions !== '') {
        document.getElementById('ackInstructions').checked = true;
        document.getElementById('ackInstructionsGroup').style.display = 'block';
        document.getElementById('ackInstructionsText').value = questionData.instructions;
      } else {
        document.getElementById('ackInstructions').checked = false;
        document.getElementById('ackInstructionsGroup').style.display = 'none';
      }
    }

    function populateDateForEdit(questionData) {
      // Set question type to Date / Date Range
      document.getElementById('questionType').value = 'Date / Date Range';

      // Show Date section
      document.getElementById('dateSection').style.display = 'block';

      // Populate basic fields
      document.getElementById('dtQuestion').value = questionData.question || '';
      document.getElementById('dtQuestionCounter').textContent = (300 - questionData.question.length) + ' of 300 remaining';
      document.getElementById('dtRequired').checked = questionData.required === 'y';

      // Handle instructions
      if (questionData.instructions && questionData.instructions !== 'y' && questionData.instructions !== '') {
        document.getElementById('dtInstructions').checked = true;
        document.getElementById('dtInstructionsGroup').style.display = 'block';
        document.getElementById('dtInstructionsText').value = questionData.instructions;
      } else {
        document.getElementById('dtInstructions').checked = false;
        document.getElementById('dtInstructionsGroup').style.display = 'none';
      }

      // Set date range checkbox
      document.getElementById('dtDateRange').checked = questionData.dateRange === 'y';
    }

    function populateMultipleChoiceForEdit(questionData) {
      // Set question type to Multiple Choice
      document.getElementById('questionType').value = 'Multiple Choice';

      // Show Multiple Choice section
      document.getElementById('multipleChoiceSection').style.display = 'block';

      // Populate basic fields
      document.getElementById('mcQuestion').value = questionData.question || '';
      document.getElementById('mcQuestionCounter').textContent = (500 - questionData.question.length) + ' of 500 remaining';
      document.getElementById('mcRequired').checked = questionData.required === 'y';

      // Handle instructions
      if (questionData.instructions && questionData.instructions !== 'y' && questionData.instructions !== '') {
        document.getElementById('mcInstructions').checked = true;
        document.getElementById('mcInstructionsGroup').style.display = 'block';
        document.getElementById('mcInstructionsText').value = questionData.instructions;
      } else {
        document.getElementById('mcInstructions').checked = false;
        document.getElementById('mcInstructionsGroup').style.display = 'none';
      }

      // Populate choices
      const choices = questionData.choices || [];
      const container = document.getElementById('mcChoicesContainer');
      container.innerHTML = ''; // Clear existing choices

      choices.forEach((choice, index) => {
        const choiceNumber = index + 1;
        const showDelete = choices.length >= 3 ? 'block' : 'none';

        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'usa-form-group';
        choiceDiv.style.cssText = 'margin-bottom: 1.5rem; position: relative;';
        choiceDiv.setAttribute('data-choice-number', choiceNumber);

        choiceDiv.innerHTML = `
          <label class="usa-label" for="mcChoice${choiceNumber}">Choice ${choiceNumber} <span class="field-required">Required</span></label>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <input class="usa-input" id="mcChoice${choiceNumber}" name="mcChoice${choiceNumber}" type="text" value="${escapeHtml(choice)}" style="flex: 1;">
            <button type="button" class="mc-delete-btn" style="display: ${showDelete};" onclick="deleteMCChoice(${choiceNumber})">
              <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
            </button>
          </div>
        `;

        container.appendChild(choiceDiv);
      });

      // Update choice count
      mcChoiceCount = choices.length;
    }

    function populateMultiSelectForEdit(questionData) {
      // Set question type to Multi-Select
      document.getElementById('questionType').value = 'Multi-Select';

      // Show Multi-Select section
      document.getElementById('multiSelectSection').style.display = 'block';

      // Populate basic fields
      document.getElementById('msQuestion').value = questionData.question || '';
      document.getElementById('msQuestionCounter').textContent = (500 - questionData.question.length) + ' of 500 remaining';
      document.getElementById('msRequired').checked = questionData.required === 'y';

      // Handle instructions
      if (questionData.instructions && questionData.instructions !== 'y' && questionData.instructions !== '') {
        document.getElementById('msInstructions').checked = true;
        document.getElementById('msInstructionsGroup').style.display = 'block';
        document.getElementById('msInstructionsText').value = questionData.instructions;
      } else {
        document.getElementById('msInstructions').checked = false;
        document.getElementById('msInstructionsGroup').style.display = 'none';
      }

      // Populate choices
      const choices = questionData.choices || [];
      const container = document.getElementById('msChoicesContainer');
      container.innerHTML = ''; // Clear existing choices

      choices.forEach((choice, index) => {
        const choiceNumber = index + 1;
        const showDelete = choices.length >= 3 ? 'block' : 'none';

        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'usa-form-group';
        choiceDiv.style.cssText = 'margin-bottom: 1.5rem; position: relative;';
        choiceDiv.setAttribute('data-choice-number', choiceNumber);

        choiceDiv.innerHTML = `
          <label class="usa-label" for="msChoice${choiceNumber}">Choice ${choiceNumber} <span class="field-required">Required</span></label>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <input class="usa-input" id="msChoice${choiceNumber}" name="msChoice${choiceNumber}" type="text" value="${escapeHtml(choice)}" style="flex: 1;">
            <button type="button" class="ms-delete-btn" style="display: ${showDelete};" onclick="deleteMSChoice(${choiceNumber})">
              <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
            </button>
          </div>
        `;

        container.appendChild(choiceDiv);
      });

      // Update choice count
      msChoiceCount = choices.length;
    }

    function populateTableForEdit(questionData) {
      // Set question type to Table
      document.getElementById('questionType').value = 'Table';

      // Show Table section
      document.getElementById('tableSection').style.display = 'block';

      // Populate basic fields
      document.getElementById('tblQuestion').value = questionData.question || '';
      document.getElementById('tblQuestionCounter').textContent = (500 - questionData.question.length) + ' of 500 remaining';

      // Handle instructions
      if (questionData.instructions && questionData.instructions !== 'y' && questionData.instructions !== '') {
        document.getElementById('tblInstructions').checked = true;
        document.getElementById('tblInstructionsGroup').style.display = 'block';
        document.getElementById('tblInstructionsText').value = questionData.instructions;
      } else {
        document.getElementById('tblInstructions').checked = false;
        document.getElementById('tblInstructionsGroup').style.display = 'none';
      }

      // Populate headers
      const headers = questionData.headers || [];
      const container = document.getElementById('tblHeadersContainer');
      container.innerHTML = ''; // Clear existing headers

      headers.forEach((header, index) => {
        const headerNumber = index + 1;
        const showDelete = headers.length >= 3 ? 'block' : 'none';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'section-indicator section-indicator--small';
        headerDiv.style.cssText = 'background-color: #fff; padding: 2.4rem 5rem; border: 1px solid #dfe1e2; border-radius: 0.5rem; margin-bottom: 1.5rem;';
        headerDiv.setAttribute('data-section', headerNumber);
        headerDiv.setAttribute('data-header-number', headerNumber);

        headerDiv.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <h3 style="font-size: 1.8rem; font-weight: 700; margin: 0;">Header ${headerNumber}</h3>
            <button type="button" class="tbl-delete-header-btn" style="display: ${showDelete};" onclick="deleteTblHeader(${headerNumber})">
              <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
            </button>
          </div>
          <hr style="border: none; border-top: 1px solid #dfe1e2; margin-bottom: 2rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div class="usa-form-group">
              <label class="usa-label" for="tblHeader${headerNumber}">Header ${headerNumber} <span class="field-required">Required</span></label>
              <input class="usa-input" id="tblHeader${headerNumber}" name="tblHeader${headerNumber}" type="text" value="${escapeHtml(header.title)}">
            </div>
            <div class="usa-form-group">
              <label class="usa-label" for="tblFormat${headerNumber}">Column Format <span class="field-required">Required</span></label>
              <select class="usa-select" id="tblFormat${headerNumber}" name="tblFormat${headerNumber}">
                <option value="">Please Select</option>
                <option value="alphanumeric" ${header.format === 'alphanumeric' ? 'selected' : ''}>Alpha Numeric</option>
                <option value="date" ${header.format === 'date' ? 'selected' : ''}>Date Field</option>
                <option value="document" ${header.format === 'document' ? 'selected' : ''}>Document</option>
                <option value="numeric" ${header.format === 'numeric' ? 'selected' : ''}>Numeric</option>
              </select>
            </div>
          </div>
        `;

        container.appendChild(headerDiv);
      });

      // Update header count
      tblHeaderCount = headers.length;

      // Populate required rows
      document.getElementById('tblRequiredRows').value = questionData.requiredRows || '0';
    }

    function populateAddressForEdit(questionData) {
      // Set question type to Addresses / Repeatable Fields
      document.getElementById('questionType').value = 'Addresses / Repeatable Fields';

      // Show Address section
      document.getElementById('addressSection').style.display = 'block';

      // Populate basic fields
      document.getElementById('addrQuestion').value = questionData.question || '';
      document.getElementById('addrQuestionCounter').textContent = (500 - questionData.question.length) + ' of 500 remaining';

      // Handle instructions
      if (questionData.instructions && questionData.instructions !== 'y' && questionData.instructions !== '') {
        document.getElementById('addrInstructions').checked = true;
        document.getElementById('addrInstructionsGroup').style.display = 'block';
        document.getElementById('addrInstructionsText').value = questionData.instructions;
      } else {
        document.getElementById('addrInstructions').checked = false;
        document.getElementById('addrInstructionsGroup').style.display = 'none';
      }

      // Set minimum field-sets
      document.getElementById('addrMinFieldSets').value = questionData.minFieldSets || '0';

      // Map of field names to checkbox IDs
      const fieldMap = {
        'Business Name': { displayed: 'addrBusinessNameDisplayed', required: 'addrBusinessNameRequired' },
        'Position/Job Title': { displayed: 'addrPositionDisplayed', required: 'addrPositionRequired' },
        'Branch Name/Number': { displayed: 'addrBranchDisplayed', required: 'addrBranchRequired' },
        'Doing Business As': { displayed: 'addrDbaDisplayed', required: 'addrDbaRequired' },
        'Date': { displayed: 'addrDateDisplayed', required: 'addrDateRequired' },
        'Prefix': { displayed: 'addrPrefixDisplayed', required: 'addrPrefixRequired' },
        'First Name': { displayed: 'addrFirstNameDisplayed', required: 'addrFirstNameRequired' },
        'Middle Name': { displayed: 'addrMiddleNameDisplayed', required: 'addrMiddleNameRequired' },
        'Last Name': { displayed: 'addrLastNameDisplayed', required: 'addrLastNameRequired' },
        'Suffix': { displayed: 'addrSuffixDisplayed', required: 'addrSuffixRequired' },
        'Maiden Name': { displayed: 'addrMaidenNameDisplayed', required: 'addrMaidenNameRequired' },
        'Date of Birth': { displayed: 'addrDobDisplayed', required: 'addrDobRequired' },
        'Social Security Number': { displayed: 'addrSsnDisplayed', required: 'addrSsnRequired' },
        'Alias': { displayed: 'addrAliasDisplayed', required: 'addrAliasRequired' },
        'Address Line 1': { displayed: 'addrLine1Displayed', required: 'addrLine1Required' },
        'Address Line 2': { displayed: 'addrLine2Displayed', required: 'addrLine2Required' },
        'City/APO/DPO/FPO': { displayed: 'addrCityDisplayed', required: 'addrCityRequired' },
        'State': { displayed: 'addrStateDisplayed', required: 'addrStateRequired' },
        'Zip Code': { displayed: 'addrZipDisplayed', required: 'addrZipRequired' },
        'County': { displayed: 'addrCountyDisplayed', required: 'addrCountyRequired' },
        'Telephone Number': { displayed: 'addrTelephoneDisplayed', required: 'addrTelephoneRequired' },
        'Alt. Telephone Number': { displayed: 'addrAltTelephoneDisplayed', required: 'addrAltTelephoneRequired' },
        'Email Address': { displayed: 'addrEmailDisplayed', required: 'addrEmailRequired' }
      };

      // Restore field selections
      const fields = questionData.fields || [];
      fields.forEach(field => {
        const mapping = fieldMap[field.name];
        if (mapping) {
          // Check the Displayed checkbox
          const displayedCheckbox = document.getElementById(mapping.displayed);
          const requiredCheckbox = document.getElementById(mapping.required);

          if (displayedCheckbox) {
            displayedCheckbox.checked = true;
            // Enable the Required checkbox since Displayed is checked
            requiredCheckbox.disabled = false;
            // Check Required if it was required
            requiredCheckbox.checked = field.required === 'y';
          }
        }
      });
    }

    function populateYesNoForEdit(questionData) {
      // Set question type to Yes/No; Either/Or
      document.getElementById('questionType').value = 'Yes/No; Either/Or';

      // Show Yes/No section
      document.getElementById('yesNoSection').style.display = 'block';

      // Populate basic fields
      document.getElementById('ynQuestion').value = questionData.question || '';
      document.getElementById('ynQuestionCounter').textContent = (500 - questionData.question.length) + ' of 500 remaining';
      document.getElementById('ynRequired').checked = questionData.required === 'y';

      // Handle instructions
      if (questionData.instructions && questionData.instructions !== 'y' && questionData.instructions !== '') {
        document.getElementById('ynInstructions').checked = true;
        document.getElementById('ynInstructionsGroup').style.display = 'block';
        document.getElementById('ynInstructionsText').value = questionData.instructions;
      } else {
        document.getElementById('ynInstructions').checked = false;
        document.getElementById('ynInstructionsGroup').style.display = 'none';
      }

      document.getElementById('ynChoice1').value = questionData.choice1 || '';
      document.getElementById('ynChoice2').value = questionData.choice2 || '';
    }

    function populateFreeFormForEdit(questionData) {
      // Set question type to Free Form
      document.getElementById('questionType').value = 'Free Form';

      // Show Free Form section
      document.getElementById('freeFormSection').style.display = 'block';

      // Populate basic fields
      document.getElementById('ffQuestion').value = questionData.question || '';
      document.getElementById('ffQuestionCounter').textContent = (300 - questionData.question.length) + ' of 300 remaining';
      document.getElementById('ffRequired').checked = questionData.required === 'y';

      // Handle instructions
      if (questionData.instructions && questionData.instructions !== 'y' && questionData.instructions !== '') {
        document.getElementById('ffInstructions').checked = true;
        document.getElementById('ffInstructionsGroup').style.display = 'block';
        document.getElementById('ffInstructionsText').value = questionData.instructions;
      } else {
        document.getElementById('ffInstructions').checked = false;
        document.getElementById('ffInstructionsGroup').style.display = 'none';
      }

      // Set format
      const format = questionData.format === 'an' ? 'alphanumeric' : 'numeric';
      document.getElementById('ffFormat').value = format;

      // Handle alphanumeric format
      if (format === 'alphanumeric') {
        document.getElementById('ffResponseLengthGroup').style.display = 'block';
        document.getElementById('ffResponseLength').value = questionData.length || '';

        if (questionData.length === 'custom') {
          document.getElementById('ffCustomLengthGroup').style.display = 'block';
          document.getElementById('ffMinLength').value = questionData.minLength || '';
          document.getElementById('ffMaxLength').value = questionData.maxLength || '';
        }
      }

      // Handle numeric format
      if (format === 'numeric') {
        document.getElementById('ffFormatOptionsGroup').style.display = 'block';
        document.getElementById('ffFormatOptions').value = questionData.numericFormat || '';

        if (questionData.numericFormat === 'currency') {
          document.getElementById('ffCurrencyGroup').style.display = 'block';
          document.getElementById('ffCurrencyMin').value = questionData.minValue || '0';
          document.getElementById('ffCurrencyMax').value = questionData.maxValue || '5000';
        } else if (questionData.numericFormat === 'decimal') {
          document.getElementById('ffDecimalGroup').style.display = 'block';
          document.getElementById('ffDecimalPlaces').value = questionData.decimalPlaces || '';
          document.getElementById('ffDecimalMin').value = questionData.minValue || '0';
          document.getElementById('ffDecimalMax').value = questionData.maxValue || '5000';
        } else if (questionData.numericFormat === 'integer') {
          document.getElementById('ffIntegerGroup').style.display = 'block';
          document.getElementById('ffIntegerMin').value = questionData.minValue || '0';
          document.getElementById('ffIntegerMax').value = questionData.maxValue || '5000';
        } else if (questionData.numericFormat === 'percentage') {
          document.getElementById('ffPercentageGroup').style.display = 'block';
          document.getElementById('ffPercentageDecimalPlaces').value = questionData.decimalPlaces || '0';
          document.getElementById('ffPercentageMin').value = questionData.minValue || '0';
          document.getElementById('ffPercentageMax').value = questionData.maxValue || '5000';
        }
      }
    }

    // Show/hide sections based on dropdown selection
    document.getElementById('questionType').addEventListener('change', function() {
      const formBuilderSection = document.getElementById('formBuilderSection');
      const freeFormSection = document.getElementById('freeFormSection');
      const yesNoSection = document.getElementById('yesNoSection');
      const acknowledgementSection = document.getElementById('acknowledgementSection');
      const dateSection = document.getElementById('dateSection');
      const multipleChoiceSection = document.getElementById('multipleChoiceSection');
      const multiSelectSection = document.getElementById('multiSelectSection');
      const tableSection = document.getElementById('tableSection');
      const tableRowLabelsSection = document.getElementById('tableRowLabelsSection');
      const addressSection = document.getElementById('addressSection');

      // Hide all sections first
      formBuilderSection.style.display = 'none';
      freeFormSection.style.display = 'none';
      yesNoSection.style.display = 'none';
      acknowledgementSection.style.display = 'none';
      dateSection.style.display = 'none';
      multipleChoiceSection.style.display = 'none';
      multiSelectSection.style.display = 'none';
      tableSection.style.display = 'none';
      tableRowLabelsSection.style.display = 'none';
      addressSection.style.display = 'none';

      // Show the appropriate section
      if (this.value === 'Form Builder') {
        formBuilderSection.style.display = 'block';
      } else if (this.value === 'Free Form') {
        freeFormSection.style.display = 'block';
      } else if (this.value === 'Yes/No; Either/Or') {
        yesNoSection.style.display = 'block';
      } else if (this.value === 'Acknowledgment') {
        acknowledgementSection.style.display = 'block';
      } else if (this.value === 'Date / Date Range') {
        dateSection.style.display = 'block';
      } else if (this.value === 'Multiple Choice') {
        multipleChoiceSection.style.display = 'block';
      } else if (this.value === 'Multi-Select') {
        multiSelectSection.style.display = 'block';
      } else if (this.value === 'Table') {
        tableSection.style.display = 'block';
      } else if (this.value === 'Table (Row Labels)') {
        tableRowLabelsSection.style.display = 'block';
      } else if (this.value === 'Addresses / Repeatable Fields') {
        addressSection.style.display = 'block';
      }
    });

    // Accordion toggle functionality
    document.querySelectorAll('.usa-accordion__button').forEach(button => {
      button.addEventListener('click', function() {
        const expanded = this.getAttribute('aria-expanded') === 'true';
        const content = document.getElementById(this.getAttribute('aria-controls'));

        this.setAttribute('aria-expanded', !expanded);
        content.hidden = expanded;
      });
    });

    // Free Form Question Builder functionality

    // Character counter for question field
    const ffQuestionField = document.getElementById('ffQuestion');
    const ffQuestionCounter = document.getElementById('ffQuestionCounter');

    ffQuestionField.addEventListener('input', function() {
      const remaining = 300 - this.value.length;
      ffQuestionCounter.textContent = `${remaining} of 300 remaining`;
    });

    // Show/hide instructions textarea for Free Form
    document.getElementById('ffInstructions').addEventListener('change', function() {
      const instructionsGroup = document.getElementById('ffInstructionsGroup');
      if (this.checked) {
        instructionsGroup.style.display = 'block';
      } else {
        instructionsGroup.style.display = 'none';
        document.getElementById('ffInstructionsText').value = '';
      }
    });

    // Yes/No Question Builder functionality

    // Character counter for yes/no question field
    const ynQuestionField = document.getElementById('ynQuestion');
    const ynQuestionCounter = document.getElementById('ynQuestionCounter');

    ynQuestionField.addEventListener('input', function() {
      const remaining = 500 - this.value.length;
      ynQuestionCounter.textContent = `${remaining} of 500 remaining`;
    });

    // Show/hide instructions textarea for Yes/No
    document.getElementById('ynInstructions').addEventListener('change', function() {
      const instructionsGroup = document.getElementById('ynInstructionsGroup');
      if (this.checked) {
        instructionsGroup.style.display = 'block';
      } else {
        instructionsGroup.style.display = 'none';
        document.getElementById('ynInstructionsText').value = '';
      }
    });

    // Acknowledgement Question Builder functionality

    // Character counter for acknowledgement question field
    const ackQuestionField = document.getElementById('ackQuestion');
    const ackQuestionCounter = document.getElementById('ackQuestionCounter');

    ackQuestionField.addEventListener('input', function() {
      const remaining = 5000 - this.value.length;
      ackQuestionCounter.textContent = `${remaining} of 5000 remaining`;
    });

    // Show/hide instructions textarea for Acknowledgement
    document.getElementById('ackInstructions').addEventListener('change', function() {
      const instructionsGroup = document.getElementById('ackInstructionsGroup');
      if (this.checked) {
        instructionsGroup.style.display = 'block';
      } else {
        instructionsGroup.style.display = 'none';
        document.getElementById('ackInstructionsText').value = '';
      }
    });

    // Date / Date Range Question Builder functionality

    // Character counter for date question field
    const dtQuestionField = document.getElementById('dtQuestion');
    const dtQuestionCounter = document.getElementById('dtQuestionCounter');

    dtQuestionField.addEventListener('input', function() {
      const remaining = 300 - this.value.length;
      dtQuestionCounter.textContent = `${remaining} of 300 remaining`;
    });

    // Show/hide instructions textarea for Date
    document.getElementById('dtInstructions').addEventListener('change', function() {
      const instructionsGroup = document.getElementById('dtInstructionsGroup');
      if (this.checked) {
        instructionsGroup.style.display = 'block';
      } else {
        instructionsGroup.style.display = 'none';
        document.getElementById('dtInstructionsText').value = '';
      }
    });

    // Multiple Choice Question Builder functionality

    // Character counter for multiple choice question field
    const mcQuestionField = document.getElementById('mcQuestion');
    const mcQuestionCounter = document.getElementById('mcQuestionCounter');

    mcQuestionField.addEventListener('input', function() {
      const remaining = 500 - this.value.length;
      mcQuestionCounter.textContent = `${remaining} of 500 remaining`;
    });

    // Show/hide instructions textarea for Multiple Choice
    document.getElementById('mcInstructions').addEventListener('change', function() {
      const instructionsGroup = document.getElementById('mcInstructionsGroup');
      if (this.checked) {
        instructionsGroup.style.display = 'block';
      } else {
        instructionsGroup.style.display = 'none';
        document.getElementById('mcInstructionsText').value = '';
      }
    });

    // Multi-Select Question Builder functionality

    // Character counter for multi-select question field
    const msQuestionField = document.getElementById('msQuestion');
    const msQuestionCounter = document.getElementById('msQuestionCounter');

    msQuestionField.addEventListener('input', function() {
      const remaining = 500 - this.value.length;
      msQuestionCounter.textContent = `${remaining} of 500 remaining`;
    });

    // Show/hide instructions textarea for Multi-Select
    document.getElementById('msInstructions').addEventListener('change', function() {
      const instructionsGroup = document.getElementById('msInstructionsGroup');
      if (this.checked) {
        instructionsGroup.style.display = 'block';
      } else {
        instructionsGroup.style.display = 'none';
        document.getElementById('msInstructionsText').value = '';
      }
    });

    // Table Question Builder functionality

    // Character counter for table question field
    const tblQuestionField = document.getElementById('tblQuestion');
    const tblQuestionCounter = document.getElementById('tblQuestionCounter');

    tblQuestionField.addEventListener('input', function() {
      const remaining = 500 - this.value.length;
      tblQuestionCounter.textContent = `${remaining} of 500 remaining`;
    });

    // Show/hide instructions textarea for Table
    document.getElementById('tblInstructions').addEventListener('change', function() {
      const instructionsGroup = document.getElementById('tblInstructionsGroup');
      if (this.checked) {
        instructionsGroup.style.display = 'block';
      } else {
        instructionsGroup.style.display = 'none';
        document.getElementById('tblInstructionsText').value = '';
      }
    });

    // Track current header count for Table
    let tblHeaderCount = 2;

    // Add Header button handler
    document.getElementById('addTblHeaderButton').addEventListener('click', function() {
      if (tblHeaderCount >= 6) {
        alert('Maximum 6 headers allowed.');
        return;
      }

      tblHeaderCount++;
      const container = document.getElementById('tblHeadersContainer');

      const headerDiv = document.createElement('div');
      headerDiv.className = 'section-indicator section-indicator--small';
      headerDiv.style.cssText = 'background-color: #fff; padding: 2.4rem 5rem; border: 1px solid #dfe1e2; border-radius: 0.5rem; margin-bottom: 1.5rem;';
      headerDiv.setAttribute('data-section', tblHeaderCount);
      headerDiv.setAttribute('data-header-number', tblHeaderCount);

      headerDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h3 style="font-size: 1.8rem; font-weight: 700; margin: 0;">Header ${tblHeaderCount}</h3>
          <button type="button" class="tbl-delete-header-btn" onclick="deleteTblHeader(${tblHeaderCount})">
            <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
          </button>
        </div>
        <hr style="border: none; border-top: 1px solid #dfe1e2; margin-bottom: 2rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <div class="usa-form-group">
            <label class="usa-label" for="tblHeader${tblHeaderCount}">Header ${tblHeaderCount} <span class="field-required">Required</span></label>
            <input class="usa-input" id="tblHeader${tblHeaderCount}" name="tblHeader${tblHeaderCount}" type="text">
          </div>
          <div class="usa-form-group">
            <label class="usa-label" for="tblFormat${tblHeaderCount}">Column Format <span class="field-required">Required</span></label>
            <select class="usa-select" id="tblFormat${tblHeaderCount}" name="tblFormat${tblHeaderCount}">
              <option value="">Please Select</option>
              <option value="alphanumeric">Alpha Numeric</option>
              <option value="date">Date Field</option>
              <option value="document">Document</option>
              <option value="numeric">Numeric</option>
            </select>
          </div>
        </div>
      `;

      container.appendChild(headerDiv);

      // Show delete buttons on all headers when we have 3 or more
      if (tblHeaderCount >= 3) {
        document.querySelectorAll('.tbl-delete-header-btn').forEach(btn => {
          btn.style.display = 'block';
        });
      }

      // Disable Add Header button at 6 headers
      if (tblHeaderCount >= 6) {
        this.disabled = true;
      }
    });

    // Delete header function (global scope for onclick)
    window.deleteTblHeader = function(headerNumber) {
      const headerElements = document.querySelectorAll('#tblHeadersContainer [data-header-number]');

      // Must have at least 2 headers
      if (headerElements.length <= 2) {
        alert('You must have at least 2 headers.');
        return;
      }

      // Find and remove the header
      const headerToRemove = document.querySelector(`#tblHeadersContainer [data-header-number="${headerNumber}"]`);
      if (headerToRemove) {
        headerToRemove.remove();
        tblHeaderCount--;

        // Renumber remaining headers
        const remainingHeaders = document.querySelectorAll('#tblHeadersContainer [data-header-number]');
        remainingHeaders.forEach((header, index) => {
          const newNumber = index + 1;
          header.setAttribute('data-section', newNumber);
          header.setAttribute('data-header-number', newNumber);

          const h3 = header.querySelector('h3');
          const deleteBtn = header.querySelector('.tbl-delete-header-btn');
          const headerInput = header.querySelector('input[id^="tblHeader"]');
          const formatSelect = header.querySelector('select[id^="tblFormat"]');
          const headerLabel = header.querySelector('label[for^="tblHeader"]');
          const formatLabel = header.querySelector('label[for^="tblFormat"]');

          h3.textContent = `Header ${newNumber}`;
          deleteBtn.setAttribute('onclick', `deleteTblHeader(${newNumber})`);

          headerInput.id = `tblHeader${newNumber}`;
          headerInput.name = `tblHeader${newNumber}`;
          headerLabel.setAttribute('for', `tblHeader${newNumber}`);
          headerLabel.innerHTML = `Header ${newNumber} <span class="field-required">Required</span>`;

          formatSelect.id = `tblFormat${newNumber}`;
          formatSelect.name = `tblFormat${newNumber}`;
          formatLabel.setAttribute('for', `tblFormat${newNumber}`);
        });

        // Update tblHeaderCount to match actual count
        tblHeaderCount = remainingHeaders.length;

        // Hide delete buttons if we're back to 2 headers
        if (tblHeaderCount <= 2) {
          document.querySelectorAll('.tbl-delete-header-btn').forEach(btn => {
            btn.style.display = 'none';
          });
        }

        // Re-enable Add Header button
        const addButton = document.getElementById('addTblHeaderButton');
        if (addButton) {
          addButton.disabled = false;
        }
      }
    };

    // Table (Row Labels) Question Builder functionality

    // Character counter for table row labels question field
    const tblrQuestionField = document.getElementById('tblrQuestion');
    const tblrQuestionCounter = document.getElementById('tblrQuestionCounter');

    tblrQuestionField.addEventListener('input', function() {
      const remaining = 500 - this.value.length;
      tblrQuestionCounter.textContent = `${remaining} of 500 remaining`;
    });

    // Show/hide instructions textarea for Table (Row Labels)
    document.getElementById('tblrInstructions').addEventListener('change', function() {
      const instructionsGroup = document.getElementById('tblrInstructionsGroup');
      if (this.checked) {
        instructionsGroup.style.display = 'block';
      } else {
        instructionsGroup.style.display = 'none';
        document.getElementById('tblrInstructionsText').value = '';
      }
    });

    // Track current row label count for Table (Row Labels)
    let tblrRowCount = 1;

    // Add Row button handler for Table (Row Labels)
    document.getElementById('addTblrRowButton').addEventListener('click', function() {
      if (tblrRowCount >= 10) {
        alert('Maximum 10 rows allowed.');
        return;
      }

      tblrRowCount++;
      const container = document.getElementById('tblrRowLabelsContainer');

      const rowDiv = document.createElement('div');
      rowDiv.style.cssText = 'display: grid; grid-template-columns: 1fr auto auto; gap: 2rem; align-items: start; margin-bottom: 1.5rem;';
      rowDiv.setAttribute('data-row-number', tblrRowCount);

      rowDiv.innerHTML = `
        <div class="usa-form-group" style="margin: 0;">
          <label class="usa-label" for="tblrRowLabel${tblrRowCount}">Row ${tblrRowCount} Label <span class="field-required">Required</span></label>
          <input class="usa-input" id="tblrRowLabel${tblrRowCount}" name="tblrRowLabel${tblrRowCount}" type="text">
        </div>
        <div style="padding-top: 3.2rem;">
          <input class="usa-checkbox__input" id="tblrRowRequired${tblrRowCount}" type="checkbox" name="tblrRowRequired${tblrRowCount}">
          <label class="usa-checkbox__label" for="tblrRowRequired${tblrRowCount}" style="margin: 0;"></label>
        </div>
        <div style="padding-top: 3.2rem;">
          <button type="button" class="tblr-delete-row-btn" onclick="deleteTblrRow(${tblrRowCount})">
            <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
          </button>
        </div>
      `;

      container.appendChild(rowDiv);

      // Show delete buttons on all rows when we have 2 or more
      if (tblrRowCount >= 2) {
        document.querySelectorAll('.tblr-delete-row-btn').forEach(btn => {
          btn.style.display = 'block';
        });
      }
    });

    // Delete row function for Table (Row Labels) (global scope for onclick)
    window.deleteTblrRow = function(rowNumber) {
      const rowElements = document.querySelectorAll('#tblrRowLabelsContainer [data-row-number]');

      // Must have at least 1 row
      if (rowElements.length <= 1) {
        alert('You must have at least 1 row.');
        return;
      }

      // Find and remove the row
      const rowToRemove = document.querySelector(`#tblrRowLabelsContainer [data-row-number="${rowNumber}"]`);
      if (rowToRemove) {
        rowToRemove.remove();
        tblrRowCount--;

        // Renumber remaining rows
        const remainingRows = document.querySelectorAll('#tblrRowLabelsContainer [data-row-number]');
        remainingRows.forEach((row, index) => {
          const newNumber = index + 1;
          row.setAttribute('data-row-number', newNumber);

          const label = row.querySelector('label[for^="tblrRowLabel"]');
          const input = row.querySelector('input[id^="tblrRowLabel"]');
          const checkbox = row.querySelector('input[id^="tblrRowRequired"]');
          const checkboxLabel = row.querySelector('label[for^="tblrRowRequired"]');
          const deleteBtn = row.querySelector('.tblr-delete-row-btn');

          label.setAttribute('for', `tblrRowLabel${newNumber}`);
          label.innerHTML = `Row ${newNumber} Label <span class="field-required">Required</span>`;
          input.id = `tblrRowLabel${newNumber}`;
          input.name = `tblrRowLabel${newNumber}`;

          checkbox.id = `tblrRowRequired${newNumber}`;
          checkbox.name = `tblrRowRequired${newNumber}`;
          checkboxLabel.setAttribute('for', `tblrRowRequired${newNumber}`);

          deleteBtn.setAttribute('onclick', `deleteTblrRow(${newNumber})`);
        });

        // Update tblrRowCount to match actual count
        tblrRowCount = remainingRows.length;

        // Hide delete buttons if we're back to 1 row
        if (tblrRowCount <= 1) {
          document.querySelectorAll('.tblr-delete-row-btn').forEach(btn => {
            btn.style.display = 'none';
          });
        }
      }
    };

    // Track current header count for Table (Row Labels)
    let tblrHeaderCount = 2;

    // Add Header button handler for Table (Row Labels)
    document.getElementById('addTblrHeaderButton').addEventListener('click', function() {
      if (tblrHeaderCount >= 6) {
        alert('Maximum 6 headers allowed.');
        return;
      }

      tblrHeaderCount++;
      const container = document.getElementById('tblrHeadersContainer');

      const headerDiv = document.createElement('div');
      headerDiv.className = 'section-indicator section-indicator--small';
      headerDiv.style.cssText = 'background-color: #fff; padding: 2.4rem 5rem; border: 1px solid #dfe1e2; border-radius: 0.5rem; margin-bottom: 2rem;';
      headerDiv.setAttribute('data-section', tblrHeaderCount);
      headerDiv.setAttribute('data-header-number', tblrHeaderCount);

      headerDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 2rem; margin-bottom: 1rem;">
          <div style="font-weight: 700; font-size: 1.6rem;">Header ${tblrHeaderCount}</div>
          <div style="font-weight: 700; font-size: 1.6rem;">Required</div>
          <div></div>
        </div>

        <hr style="border: none; border-top: 1px solid #dfe1e2; margin-bottom: 2rem;">

        <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 2rem; align-items: start;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div class="usa-form-group" style="margin: 0;">
              <label class="usa-label" for="tblrHeader${tblrHeaderCount}">Header ${tblrHeaderCount} <span class="field-required">Required</span></label>
              <input class="usa-input" id="tblrHeader${tblrHeaderCount}" name="tblrHeader${tblrHeaderCount}" type="text">
            </div>
            <div class="usa-form-group" style="margin: 0;">
              <label class="usa-label" for="tblrFormat${tblrHeaderCount}">Column Format <span class="field-required">Required</span></label>
              <select class="usa-select" id="tblrFormat${tblrHeaderCount}" name="tblrFormat${tblrHeaderCount}">
                <option value="">Please Select</option>
                <option value="alphanumeric">Alpha Numeric</option>
                <option value="numeric">Numeric</option>
              </select>
            </div>
          </div>
          <div style="padding-top: 3.2rem;">
            <input class="usa-checkbox__input" id="tblrHeaderRequired${tblrHeaderCount}" type="checkbox" name="tblrHeaderRequired${tblrHeaderCount}" disabled>
            <label class="usa-checkbox__label" for="tblrHeaderRequired${tblrHeaderCount}" style="margin: 0;"></label>
          </div>
          <div style="padding-top: 3.2rem;">
            <button type="button" class="tblr-delete-header-btn" onclick="deleteTblrHeader(${tblrHeaderCount})">
              <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
            </button>
          </div>
        </div>
      `;

      container.appendChild(headerDiv);

      // Show delete buttons on all headers when we have 2 or more headers in the DOM
      const headerElements = document.querySelectorAll('#tblrHeadersContainer [data-header-number]');
      if (headerElements.length >= 2) {
        document.querySelectorAll('.tblr-delete-header-btn').forEach(btn => {
          btn.style.display = 'block';
        });
      }
    });

    // Delete header function for Table (Row Labels) (global scope for onclick)
    window.deleteTblrHeader = function(headerNumber) {
      const headerElements = document.querySelectorAll('#tblrHeadersContainer [data-header-number]');

      // Must have at least 1 header (Header 2)
      if (headerElements.length <= 1) {
        alert('You must have at least 1 header.');
        return;
      }

      // Find and remove the header
      const headerToRemove = document.querySelector(`#tblrHeadersContainer [data-header-number="${headerNumber}"]`);
      if (headerToRemove) {
        headerToRemove.remove();
        tblrHeaderCount--;

        // Renumber remaining headers
        const remainingHeaders = document.querySelectorAll('#tblrHeadersContainer [data-header-number]');
        remainingHeaders.forEach((header, index) => {
          const newNumber = index + 2; // Start from 2
          header.setAttribute('data-section', newNumber);
          header.setAttribute('data-header-number', newNumber);

          // Update header title
          const headerTitle = header.querySelector('[style*="font-weight: 700"]');
          headerTitle.textContent = `Header ${newNumber}`;

          // Update input field
          const headerInput = header.querySelector('input[id^="tblrHeader"]');
          const headerLabel = header.querySelector('label[for^="tblrHeader"]');
          headerInput.id = `tblrHeader${newNumber}`;
          headerInput.name = `tblrHeader${newNumber}`;
          headerLabel.setAttribute('for', `tblrHeader${newNumber}`);
          headerLabel.innerHTML = `Header ${newNumber} <span class="field-required">Required</span>`;

          // Update select field
          const formatSelect = header.querySelector('select[id^="tblrFormat"]');
          const formatLabel = header.querySelector('label[for^="tblrFormat"]');
          formatSelect.id = `tblrFormat${newNumber}`;
          formatSelect.name = `tblrFormat${newNumber}`;
          formatLabel.setAttribute('for', `tblrFormat${newNumber}`);

          // Update checkbox
          const checkbox = header.querySelector('input[id^="tblrHeaderRequired"]');
          const checkboxLabel = header.querySelector('label[for^="tblrHeaderRequired"]');
          checkbox.id = `tblrHeaderRequired${newNumber}`;
          checkbox.name = `tblrHeaderRequired${newNumber}`;
          checkboxLabel.setAttribute('for', `tblrHeaderRequired${newNumber}`);

          // Update delete button
          const deleteBtn = header.querySelector('.tblr-delete-header-btn');
          deleteBtn.setAttribute('onclick', `deleteTblrHeader(${newNumber})`);
        });

        // Update tblrHeaderCount to match actual count (starting from 2)
        tblrHeaderCount = remainingHeaders.length + 1;

        // Hide delete buttons if we're back to 1 header
        if (remainingHeaders.length <= 1) {
          document.querySelectorAll('.tblr-delete-header-btn').forEach(btn => {
            btn.style.display = 'none';
          });
        }
      }
    };

    // Address / Repeatable Fields Question Builder functionality

    // Character counter for address question field
    const addrQuestionField = document.getElementById('addrQuestion');
    const addrQuestionCounter = document.getElementById('addrQuestionCounter');

    addrQuestionField.addEventListener('input', function() {
      const remaining = 500 - this.value.length;
      addrQuestionCounter.textContent = `${remaining} of 500 remaining`;
    });

    // Show/hide instructions textarea for Address
    document.getElementById('addrInstructions').addEventListener('change', function() {
      const instructionsGroup = document.getElementById('addrInstructionsGroup');
      if (this.checked) {
        instructionsGroup.style.display = 'block';
      } else {
        instructionsGroup.style.display = 'none';
        document.getElementById('addrInstructionsText').value = '';
      }
    });

    // Helper function to link Displayed checkbox to Required checkbox
    function linkDisplayedToRequired(displayedId, requiredId) {
      const displayedCheckbox = document.getElementById(displayedId);
      const requiredCheckbox = document.getElementById(requiredId);

      displayedCheckbox.addEventListener('change', function() {
        if (this.checked) {
          requiredCheckbox.disabled = false;
        } else {
          requiredCheckbox.disabled = true;
          requiredCheckbox.checked = false;
        }
      });
    }

    // Link all Displayed/Required checkbox pairs
    linkDisplayedToRequired('addrBusinessNameDisplayed', 'addrBusinessNameRequired');
    linkDisplayedToRequired('addrPositionDisplayed', 'addrPositionRequired');
    linkDisplayedToRequired('addrBranchDisplayed', 'addrBranchRequired');
    linkDisplayedToRequired('addrDbaDisplayed', 'addrDbaRequired');
    linkDisplayedToRequired('addrDateDisplayed', 'addrDateRequired');
    linkDisplayedToRequired('addrPrefixDisplayed', 'addrPrefixRequired');
    linkDisplayedToRequired('addrFirstNameDisplayed', 'addrFirstNameRequired');
    linkDisplayedToRequired('addrMiddleNameDisplayed', 'addrMiddleNameRequired');
    linkDisplayedToRequired('addrLastNameDisplayed', 'addrLastNameRequired');
    linkDisplayedToRequired('addrSuffixDisplayed', 'addrSuffixRequired');
    linkDisplayedToRequired('addrMaidenNameDisplayed', 'addrMaidenNameRequired');
    linkDisplayedToRequired('addrDobDisplayed', 'addrDobRequired');
    linkDisplayedToRequired('addrSsnDisplayed', 'addrSsnRequired');
    linkDisplayedToRequired('addrAliasDisplayed', 'addrAliasRequired');
    linkDisplayedToRequired('addrLine1Displayed', 'addrLine1Required');
    linkDisplayedToRequired('addrLine2Displayed', 'addrLine2Required');
    linkDisplayedToRequired('addrCityDisplayed', 'addrCityRequired');
    linkDisplayedToRequired('addrStateDisplayed', 'addrStateRequired');
    linkDisplayedToRequired('addrZipDisplayed', 'addrZipRequired');
    linkDisplayedToRequired('addrCountyDisplayed', 'addrCountyRequired');
    linkDisplayedToRequired('addrTelephoneDisplayed', 'addrTelephoneRequired');
    linkDisplayedToRequired('addrAltTelephoneDisplayed', 'addrAltTelephoneRequired');
    linkDisplayedToRequired('addrEmailDisplayed', 'addrEmailRequired');

    // Track current choice count for Multiple Choice
    let mcChoiceCount = 2;

    // Add Choice button handler
    document.getElementById('addMCChoiceButton').addEventListener('click', function() {
      if (mcChoiceCount >= 20) {
        alert('Maximum 20 choices allowed.');
        return;
      }

      mcChoiceCount++;
      const container = document.getElementById('mcChoicesContainer');

      const choiceDiv = document.createElement('div');
      choiceDiv.className = 'usa-form-group';
      choiceDiv.style.cssText = 'margin-bottom: 1.5rem; position: relative;';
      choiceDiv.setAttribute('data-choice-number', mcChoiceCount);

      choiceDiv.innerHTML = `
        <label class="usa-label" for="mcChoice${mcChoiceCount}">Choice ${mcChoiceCount} <span class="field-required">Required</span></label>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <input class="usa-input" id="mcChoice${mcChoiceCount}" name="mcChoice${mcChoiceCount}" type="text" style="flex: 1;">
          <button type="button" class="mc-delete-btn" onclick="deleteMCChoice(${mcChoiceCount})">
            <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
          </button>
        </div>
      `;

      container.appendChild(choiceDiv);

      // Show delete buttons on all choices when we have 3 or more
      if (mcChoiceCount >= 3) {
        document.querySelectorAll('.mc-delete-btn').forEach(btn => {
          btn.style.display = 'block';
        });
      }
    });

    // Delete choice function (global scope for onclick)
    window.deleteMCChoice = function(choiceNumber) {
      const choiceElements = document.querySelectorAll('#mcChoicesContainer [data-choice-number]');

      // Must have at least 2 choices
      if (choiceElements.length <= 2) {
        alert('You must have at least 2 choices.');
        return;
      }

      // Find and remove the choice
      const choiceToRemove = document.querySelector(`#mcChoicesContainer [data-choice-number="${choiceNumber}"]`);
      if (choiceToRemove) {
        choiceToRemove.remove();
        mcChoiceCount--;

        // Renumber remaining choices
        const remainingChoices = document.querySelectorAll('#mcChoicesContainer [data-choice-number]');
        remainingChoices.forEach((choice, index) => {
          const newNumber = index + 1;
          choice.setAttribute('data-choice-number', newNumber);

          const label = choice.querySelector('label');
          const input = choice.querySelector('input');
          const deleteBtn = choice.querySelector('.mc-delete-btn');

          label.setAttribute('for', `mcChoice${newNumber}`);
          label.innerHTML = `Choice ${newNumber} <span class="field-required">Required</span>`;
          input.id = `mcChoice${newNumber}`;
          input.name = `mcChoice${newNumber}`;
          deleteBtn.setAttribute('onclick', `deleteMCChoice(${newNumber})`);
        });

        // Update mcChoiceCount to match actual count
        mcChoiceCount = remainingChoices.length;

        // Hide delete buttons if we're back to 2 choices
        if (mcChoiceCount <= 2) {
          document.querySelectorAll('.mc-delete-btn').forEach(btn => {
            btn.style.display = 'none';
          });
        }
      }
    };

    // Track current choice count for Multi-Select
    let msChoiceCount = 2;

    // Add Choice button handler for Multi-Select
    document.getElementById('addMSChoiceButton').addEventListener('click', function() {
      if (msChoiceCount >= 15) {
        alert('Maximum 15 choices allowed.');
        return;
      }

      msChoiceCount++;
      const container = document.getElementById('msChoicesContainer');

      const choiceDiv = document.createElement('div');
      choiceDiv.className = 'usa-form-group';
      choiceDiv.style.cssText = 'margin-bottom: 1.5rem; position: relative;';
      choiceDiv.setAttribute('data-choice-number', msChoiceCount);

      choiceDiv.innerHTML = `
        <label class="usa-label" for="msChoice${msChoiceCount}">Choice ${msChoiceCount} <span class="field-required">Required</span></label>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <input class="usa-input" id="msChoice${msChoiceCount}" name="msChoice${msChoiceCount}" type="text" style="flex: 1;">
          <button type="button" class="ms-delete-btn" onclick="deleteMSChoice(${msChoiceCount})">
            <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
          </button>
        </div>
      `;

      container.appendChild(choiceDiv);

      // Show delete buttons on all choices when we have 3 or more
      if (msChoiceCount >= 3) {
        document.querySelectorAll('.ms-delete-btn').forEach(btn => {
          btn.style.display = 'block';
        });
      }
    });

    // Delete choice function for Multi-Select (global scope for onclick)
    window.deleteMSChoice = function(choiceNumber) {
      const choiceElements = document.querySelectorAll('#msChoicesContainer [data-choice-number]');

      // Must have at least 2 choices
      if (choiceElements.length <= 2) {
        alert('You must have at least 2 choices.');
        return;
      }

      // Find and remove the choice
      const choiceToRemove = document.querySelector(`#msChoicesContainer [data-choice-number="${choiceNumber}"]`);
      if (choiceToRemove) {
        choiceToRemove.remove();
        msChoiceCount--;

        // Renumber remaining choices
        const remainingChoices = document.querySelectorAll('#msChoicesContainer [data-choice-number]');
        remainingChoices.forEach((choice, index) => {
          const newNumber = index + 1;
          choice.setAttribute('data-choice-number', newNumber);

          const label = choice.querySelector('label');
          const input = choice.querySelector('input');
          const deleteBtn = choice.querySelector('.ms-delete-btn');

          label.setAttribute('for', `msChoice${newNumber}`);
          label.innerHTML = `Choice ${newNumber} <span class="field-required">Required</span>`;
          input.id = `msChoice${newNumber}`;
          input.name = `msChoice${newNumber}`;
          deleteBtn.setAttribute('onclick', `deleteMSChoice(${newNumber})`);
        });

        // Update msChoiceCount to match actual count
        msChoiceCount = remainingChoices.length;

        // Hide delete buttons if we're back to 2 choices
        if (msChoiceCount <= 2) {
          document.querySelectorAll('.ms-delete-btn').forEach(btn => {
            btn.style.display = 'none';
          });
        }
      }
    };

    // Show/hide Response Length or Format Options based on Format selection
    document.getElementById('ffFormat').addEventListener('change', function() {
      const responseLengthGroup = document.getElementById('ffResponseLengthGroup');
      const formatOptionsGroup = document.getElementById('ffFormatOptionsGroup');

      // Hide all option groups first
      responseLengthGroup.style.display = 'none';
      formatOptionsGroup.style.display = 'none';
      document.getElementById('ffCustomLengthGroup').style.display = 'none';
      document.getElementById('ffCurrencyGroup').style.display = 'none';
      document.getElementById('ffDecimalGroup').style.display = 'none';
      document.getElementById('ffIntegerGroup').style.display = 'none';
      document.getElementById('ffPercentageGroup').style.display = 'none';

      if (this.value === 'alphanumeric') {
        responseLengthGroup.style.display = 'block';
      } else if (this.value === 'numeric') {
        formatOptionsGroup.style.display = 'block';
      }

      // Reset dependent fields
      document.getElementById('ffResponseLength').value = '';
      document.getElementById('ffFormatOptions').value = '';
    });

    // Show/hide Custom Length based on Response Length selection
    document.getElementById('ffResponseLength').addEventListener('change', function() {
      const customLengthGroup = document.getElementById('ffCustomLengthGroup');

      if (this.value === 'custom') {
        customLengthGroup.style.display = 'block';
      } else {
        customLengthGroup.style.display = 'none';
        // Reset custom fields
        document.getElementById('ffMinLength').value = '';
        document.getElementById('ffMaxLength').value = '';
      }
    });

    // Show/hide numeric format options based on Format Options selection
    document.getElementById('ffFormatOptions').addEventListener('change', function() {
      const currencyGroup = document.getElementById('ffCurrencyGroup');
      const decimalGroup = document.getElementById('ffDecimalGroup');
      const integerGroup = document.getElementById('ffIntegerGroup');
      const percentageGroup = document.getElementById('ffPercentageGroup');

      // Hide all groups first
      currencyGroup.style.display = 'none';
      decimalGroup.style.display = 'none';
      integerGroup.style.display = 'none';
      percentageGroup.style.display = 'none';

      // Show the appropriate group
      if (this.value === 'currency') {
        currencyGroup.style.display = 'block';
      } else if (this.value === 'decimal') {
        decimalGroup.style.display = 'block';
      } else if (this.value === 'integer') {
        integerGroup.style.display = 'block';
      } else if (this.value === 'percentage') {
        percentageGroup.style.display = 'block';
      }
    });

    // Clear Acknowledgement button handler
    document.getElementById('clearAcknowledgementButton').addEventListener('click', function() {
      // Reset all acknowledgement fields
      document.getElementById('ackQuestion').value = '';
      document.getElementById('ackQuestionCounter').textContent = '5000 of 5000 remaining';
      document.getElementById('ackInstructions').checked = false;
      document.getElementById('ackInstructionsGroup').style.display = 'none';
      document.getElementById('ackInstructionsText').value = '';

      // Reset edit mode flags
      isEditMode = false;
      editQuestionIndex = null;

      // Reset to Question Type dropdown
      document.getElementById('questionType').value = '';
      document.getElementById('acknowledgementSection').style.display = 'none';
    });

    // Clear Date button handler
    document.getElementById('clearDateButton').addEventListener('click', function() {
      // Reset all date fields
      document.getElementById('dtQuestion').value = '';
      document.getElementById('dtQuestionCounter').textContent = '300 of 300 remaining';
      document.getElementById('dtRequired').checked = true;
      document.getElementById('dtInstructions').checked = false;
      document.getElementById('dtInstructionsGroup').style.display = 'none';
      document.getElementById('dtInstructionsText').value = '';
      document.getElementById('dtDateRange').checked = false;

      // Reset edit mode flags
      isEditMode = false;
      editQuestionIndex = null;

      // Reset to Question Type dropdown
      document.getElementById('questionType').value = '';
      document.getElementById('dateSection').style.display = 'none';
    });

    // Clear Multiple Choice button handler
    document.getElementById('clearMultipleChoiceButton').addEventListener('click', function() {
      // Reset question field
      document.getElementById('mcQuestion').value = '';
      document.getElementById('mcQuestionCounter').textContent = '500 of 500 remaining';
      document.getElementById('mcRequired').checked = true;
      document.getElementById('mcInstructions').checked = false;
      document.getElementById('mcInstructionsGroup').style.display = 'none';
      document.getElementById('mcInstructionsText').value = '';

      // Reset choices to just 2
      const container = document.getElementById('mcChoicesContainer');
      container.innerHTML = `
        <!-- Choice 1 -->
        <div class="usa-form-group" style="margin-bottom: 1.5rem; position: relative;" data-choice-number="1">
          <label class="usa-label" for="mcChoice1">Choice 1 <span class="field-required">Required</span></label>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <input class="usa-input" id="mcChoice1" name="mcChoice1" type="text" style="flex: 1;">
            <button type="button" class="mc-delete-btn" style="display: none;" onclick="deleteMCChoice(1)">
              <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
            </button>
          </div>
        </div>

        <!-- Choice 2 -->
        <div class="usa-form-group" style="margin-bottom: 1.5rem; position: relative;" data-choice-number="2">
          <label class="usa-label" for="mcChoice2">Choice 2 <span class="field-required">Required</span></label>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <input class="usa-input" id="mcChoice2" name="mcChoice2" type="text" style="flex: 1;">
            <button type="button" class="mc-delete-btn" style="display: none;" onclick="deleteMCChoice(2)">
              <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
            </button>
          </div>
        </div>
      `;
      mcChoiceCount = 2;

      // Reset edit mode flags
      isEditMode = false;
      editQuestionIndex = null;

      // Reset to Question Type dropdown
      document.getElementById('questionType').value = '';
      document.getElementById('multipleChoiceSection').style.display = 'none';
    });

    // Clear Multi-Select button handler
    document.getElementById('clearMultiSelectButton').addEventListener('click', function() {
      // Reset question field
      document.getElementById('msQuestion').value = '';
      document.getElementById('msQuestionCounter').textContent = '500 of 500 remaining';
      document.getElementById('msRequired').checked = true;
      document.getElementById('msInstructions').checked = false;
      document.getElementById('msInstructionsGroup').style.display = 'none';
      document.getElementById('msInstructionsText').value = '';

      // Reset choices to just 2
      const container = document.getElementById('msChoicesContainer');
      container.innerHTML = `
        <!-- Choice 1 -->
        <div class="usa-form-group" style="margin-bottom: 1.5rem; position: relative;" data-choice-number="1">
          <label class="usa-label" for="msChoice1">Choice 1 <span class="field-required">Required</span></label>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <input class="usa-input" id="msChoice1" name="msChoice1" type="text" style="flex: 1;">
            <button type="button" class="ms-delete-btn" style="display: none;" onclick="deleteMSChoice(1)">
              <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
            </button>
          </div>
        </div>

        <!-- Choice 2 -->
        <div class="usa-form-group" style="margin-bottom: 1.5rem; position: relative;" data-choice-number="2">
          <label class="usa-label" for="msChoice2">Choice 2 <span class="field-required">Required</span></label>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <input class="usa-input" id="msChoice2" name="msChoice2" type="text" style="flex: 1;">
            <button type="button" class="ms-delete-btn" style="display: none;" onclick="deleteMSChoice(2)">
              <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
            </button>
          </div>
        </div>
      `;
      msChoiceCount = 2;

      // Reset edit mode flags
      isEditMode = false;
      editQuestionIndex = null;

      // Reset to Question Type dropdown
      document.getElementById('questionType').value = '';
      document.getElementById('multiSelectSection').style.display = 'none';
    });

    // Clear Table button handler
    document.getElementById('clearTableButton').addEventListener('click', function() {
      // Reset question field
      document.getElementById('tblQuestion').value = '';
      document.getElementById('tblQuestionCounter').textContent = '500 of 500 remaining';
      document.getElementById('tblInstructions').checked = false;
      document.getElementById('tblInstructionsGroup').style.display = 'none';
      document.getElementById('tblInstructionsText').value = '';

      // Reset required rows
      document.getElementById('tblRequiredRows').value = '0';

      // Reset headers to just 2
      const container = document.getElementById('tblHeadersContainer');
      container.innerHTML = `
        <!-- Header 1 -->
        <div class="section-indicator section-indicator--small" data-section="1" data-header-number="1" style="background-color: #fff; padding: 2.4rem 5rem; border: 1px solid #dfe1e2; border-radius: 0.5rem; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <h3 style="font-size: 1.8rem; font-weight: 700; margin: 0;">Header 1</h3>
            <button type="button" class="tbl-delete-header-btn" style="display: none;" onclick="deleteTblHeader(1)">
              <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
            </button>
          </div>
          <hr style="border: none; border-top: 1px solid #dfe1e2; margin-bottom: 2rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div class="usa-form-group">
              <label class="usa-label" for="tblHeader1">Header 1 <span class="field-required">Required</span></label>
              <input class="usa-input" id="tblHeader1" name="tblHeader1" type="text">
            </div>
            <div class="usa-form-group">
              <label class="usa-label" for="tblFormat1">Column Format <span class="field-required">Required</span></label>
              <select class="usa-select" id="tblFormat1" name="tblFormat1">
                <option value="">Please Select</option>
                <option value="alphanumeric">Alpha Numeric</option>
                <option value="numeric">Numeric</option>
                <option value="date">Date Field</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Header 2 -->
        <div class="section-indicator section-indicator--small" data-section="2" data-header-number="2" style="background-color: #fff; padding: 2.4rem 5rem; border: 1px solid #dfe1e2; border-radius: 0.5rem; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <h3 style="font-size: 1.8rem; font-weight: 700; margin: 0;">Header 2</h3>
            <button type="button" class="tbl-delete-header-btn" style="display: none;" onclick="deleteTblHeader(2)">
              <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
            </button>
          </div>
          <hr style="border: none; border-top: 1px solid #dfe1e2; margin-bottom: 2rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div class="usa-form-group">
              <label class="usa-label" for="tblHeader2">Header 2 <span class="field-required">Required</span></label>
              <input class="usa-input" id="tblHeader2" name="tblHeader2" type="text">
            </div>
            <div class="usa-form-group">
              <label class="usa-label" for="tblFormat2">Column Format <span class="field-required">Required</span></label>
              <select class="usa-select" id="tblFormat2" name="tblFormat2">
                <option value="">Please Select</option>
                <option value="alphanumeric">Alpha Numeric</option>
                <option value="numeric">Numeric</option>
                <option value="date">Date Field</option>
              </select>
            </div>
          </div>
        </div>
      `;
      tblHeaderCount = 2;

      // Re-enable Add Header button
      document.getElementById('addTblHeaderButton').disabled = false;

      // Reset edit mode flags
      isEditMode = false;
      editQuestionIndex = null;

      // Reset to Question Type dropdown
      document.getElementById('questionType').value = '';
      document.getElementById('tableSection').style.display = 'none';
    });

    // Clear Table (Row Labels) button handler
    document.getElementById('clearTableRowLabelsButton').addEventListener('click', function() {
      // Reset question field
      document.getElementById('tblrQuestion').value = '';
      document.getElementById('tblrQuestionCounter').textContent = '500 of 500 remaining';
      document.getElementById('tblrInstructions').checked = false;
      document.getElementById('tblrInstructionsGroup').style.display = 'none';
      document.getElementById('tblrInstructionsText').value = '';

      // Reset row label column
      document.getElementById('tblrAgencyDefined1').checked = true;
      document.getElementById('tblrHeader1').value = '';
      document.getElementById('tblrRequired1').checked = true;

      // Reset row labels to just 1
      const container = document.getElementById('tblrRowLabelsContainer');
      container.innerHTML = `
        <!-- Row 1 Label -->
        <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 2rem; align-items: start; margin-bottom: 1.5rem;" data-row-number="1">
          <div class="usa-form-group" style="margin: 0;">
            <label class="usa-label" for="tblrRowLabel1">Row 1 Label <span class="field-required">Required</span></label>
            <input class="usa-input" id="tblrRowLabel1" name="tblrRowLabel1" type="text">
          </div>
          <div style="padding-top: 3.2rem;">
            <input class="usa-checkbox__input" id="tblrRowRequired1" type="checkbox" name="tblrRowRequired1">
            <label class="usa-checkbox__label" for="tblrRowRequired1" style="margin: 0;"></label>
          </div>
          <div style="padding-top: 3.2rem;">
            <button type="button" class="tblr-delete-row-btn" style="display: none;" onclick="deleteTblrRow(1)">
              <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
            </button>
          </div>
        </div>
      `;
      tblrRowCount = 1;

      // Reset headers to just Header 2
      const headersContainer = document.getElementById('tblrHeadersContainer');
      headersContainer.innerHTML = `
        <!-- Header 2 -->
        <div class="section-indicator section-indicator--small" data-section="2" data-header-number="2" style="background-color: #fff; padding: 2.4rem 5rem; border: 1px solid #dfe1e2; border-radius: 0.5rem; margin-bottom: 2rem;">
          <!-- Three Column Header Row -->
          <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 2rem; margin-bottom: 1rem;">
            <div style="font-weight: 700; font-size: 1.6rem;">Header 2</div>
            <div style="font-weight: 700; font-size: 1.6rem;">Required</div>
            <div></div>
          </div>

          <hr style="border: none; border-top: 1px solid #dfe1e2; margin-bottom: 2rem;">

          <!-- Three Column Content Row -->
          <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 2rem; align-items: start;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
              <div class="usa-form-group" style="margin: 0;">
                <label class="usa-label" for="tblrHeader2">Header 2 <span class="field-required">Required</span></label>
                <input class="usa-input" id="tblrHeader2" name="tblrHeader2" type="text">
              </div>
              <div class="usa-form-group" style="margin: 0;">
                <label class="usa-label" for="tblrFormat2">Column Format <span class="field-required">Required</span></label>
                <select class="usa-select" id="tblrFormat2" name="tblrFormat2">
                  <option value="">Please Select</option>
                  <option value="alphanumeric">Alpha Numeric</option>
                  <option value="numeric">Numeric</option>
                </select>
              </div>
            </div>
            <div style="padding-top: 3.2rem;">
              <input class="usa-checkbox__input" id="tblrHeaderRequired2" type="checkbox" name="tblrHeaderRequired2" disabled>
              <label class="usa-checkbox__label" for="tblrHeaderRequired2" style="margin: 0;"></label>
            </div>
            <div style="padding-top: 3.2rem;">
              <button type="button" class="tblr-delete-header-btn" style="display: none;" onclick="deleteTblrHeader(2)">
                <img src="assets/icon-delete.png" alt="Delete" style="width: 24px; height: 24px;">
              </button>
            </div>
          </div>
        </div>
      `;
      tblrHeaderCount = 2;

      // Reset row requirements and aggregations
      document.getElementById('tblrRequiredRows').value = '0';
      document.getElementById('tblrColumnAggregations').value = '';
      document.getElementById('tblrRowAggregations').value = '';
      document.getElementById('tblrGrandTotal').checked = false;

      // Reset edit mode flags
      isEditMode = false;
      editQuestionIndex = null;

      // Reset to Question Type dropdown
      document.getElementById('questionType').value = '';
      document.getElementById('tableRowLabelsSection').style.display = 'none';
    });

    // Clear Address button handler
    document.getElementById('clearAddressButton').addEventListener('click', function() {
      // Reset question field
      document.getElementById('addrQuestion').value = '';
      document.getElementById('addrQuestionCounter').textContent = '500 of 500 remaining';
      document.getElementById('addrInstructions').checked = false;
      document.getElementById('addrInstructionsGroup').style.display = 'none';
      document.getElementById('addrInstructionsText').value = '';

      // Reset minimum field-sets
      document.getElementById('addrMinFieldSets').value = '0';

      // Uncheck all displayed and required checkboxes
      document.querySelectorAll('[id^="addr"][id$="Displayed"]').forEach(cb => cb.checked = false);
      document.querySelectorAll('[id^="addr"][id$="Required"]').forEach(cb => {
        cb.checked = false;
        cb.disabled = true;
      });

      // Reset edit mode flags
      isEditMode = false;
      editQuestionIndex = null;

      // Reset to Question Type dropdown
      document.getElementById('questionType').value = '';
      document.getElementById('addressSection').style.display = 'none';
    });

    // Clear Yes/No button handler
    document.getElementById('clearYesNoButton').addEventListener('click', function() {
      // Reset all yes/no fields
      document.getElementById('ynQuestion').value = '';
      document.getElementById('ynQuestionCounter').textContent = '500 of 500 remaining';
      document.getElementById('ynRequired').checked = true;
      document.getElementById('ynInstructions').checked = false;
      document.getElementById('ynInstructionsGroup').style.display = 'none';
      document.getElementById('ynInstructionsText').value = '';
      document.getElementById('ynChoice1').value = '';
      document.getElementById('ynChoice2').value = '';

      // Reset edit mode flags
      isEditMode = false;
      editQuestionIndex = null;

      // Reset to Question Type dropdown
      document.getElementById('questionType').value = '';
      document.getElementById('yesNoSection').style.display = 'none';
    });

    // Clear Free Form button handler
    document.getElementById('clearFreeFormButton').addEventListener('click', function() {
      // Reset all free form fields
      document.getElementById('ffQuestion').value = '';
      document.getElementById('ffQuestionCounter').textContent = '300 of 300 remaining';
      document.getElementById('ffRequired').checked = true;
      document.getElementById('ffInstructions').checked = false;
      document.getElementById('ffInstructionsGroup').style.display = 'none';
      document.getElementById('ffInstructionsText').value = '';
      document.getElementById('ffFormat').value = '';
      document.getElementById('ffResponseLengthGroup').style.display = 'none';
      document.getElementById('ffResponseLength').value = '';
      document.getElementById('ffCustomLengthGroup').style.display = 'none';
      document.getElementById('ffMinLength').value = '';
      document.getElementById('ffMaxLength').value = '';
      document.getElementById('ffFormatOptionsGroup').style.display = 'none';
      document.getElementById('ffFormatOptions').value = '';
      document.getElementById('ffCurrencyGroup').style.display = 'none';
      document.getElementById('ffCurrencyMin').value = '0';
      document.getElementById('ffCurrencyMax').value = '5000';
      document.getElementById('ffDecimalGroup').style.display = 'none';
      document.getElementById('ffDecimalPlaces').value = '';
      document.getElementById('ffDecimalMin').value = '0';
      document.getElementById('ffDecimalMax').value = '5000';
      document.getElementById('ffIntegerGroup').style.display = 'none';
      document.getElementById('ffIntegerMin').value = '0';
      document.getElementById('ffIntegerMax').value = '5000';
      document.getElementById('ffPercentageGroup').style.display = 'none';
      document.getElementById('ffPercentageDecimalPlaces').value = '0';
      document.getElementById('ffPercentageMin').value = '0';
      document.getElementById('ffPercentageMax').value = '5000';

      // Reset edit mode flags
      isEditMode = false;
      editQuestionIndex = null;

      // Reset to Question Type dropdown
      document.getElementById('questionType').value = '';
      document.getElementById('freeFormSection').style.display = 'none';
    });

    // Function to validate and build acknowledgement question
    function buildAcknowledgementQuestion() {
      // Validate required fields
      const question = document.getElementById('ackQuestion').value.trim();
      const hasInstructions = document.getElementById('ackInstructions').checked;

      if (!question) {
        alert('Please enter a question.');
        return null;
      }

      // Validate instructions if checkbox is checked
      if (hasInstructions) {
        const instructionsText = document.getElementById('ackInstructionsText').value.trim();
        if (!instructionsText) {
          alert('Please enter instructions text.');
          return null;
        }
        if (instructionsText.length > 3000) {
          alert('Instructions must be 3000 characters or less.');
          return null;
        }
      }

      // Build question object (always required)
      const questionObj = {
        type: 'ack',
        questionType: 'ack',
        question: question,
        required: 'y', // Always required
        instructions: hasInstructions ? document.getElementById('ackInstructionsText').value.trim() : ''
      };

      return questionObj;
    }

    // Function to validate and build date question
    function buildDateQuestion() {
      // Validate required fields
      const question = document.getElementById('dtQuestion').value.trim();
      const hasInstructions = document.getElementById('dtInstructions').checked;
      const isDateRange = document.getElementById('dtDateRange').checked;

      if (!question) {
        alert('Please enter a question.');
        return null;
      }

      // Validate instructions if checkbox is checked
      if (hasInstructions) {
        const instructionsText = document.getElementById('dtInstructionsText').value.trim();
        if (!instructionsText) {
          alert('Please enter instructions text.');
          return null;
        }
        if (instructionsText.length > 3000) {
          alert('Instructions must be 3000 characters or less.');
          return null;
        }
      }

      // Build question object
      const questionObj = {
        type: 'dt',
        questionType: 'dt',
        question: question,
        required: document.getElementById('dtRequired').checked ? 'y' : 'n',
        instructions: hasInstructions ? document.getElementById('dtInstructionsText').value.trim() : '',
        dateRange: isDateRange ? 'y' : 'n'
      };

      return questionObj;
    }

    // Function to validate and build multiple choice question
    function buildMultipleChoiceQuestion() {
      // Validate required fields
      const question = document.getElementById('mcQuestion').value.trim();
      const hasInstructions = document.getElementById('mcInstructions').checked;

      if (!question) {
        alert('Please enter a question.');
        return null;
      }

      // Validate instructions if checkbox is checked
      if (hasInstructions) {
        const instructionsText = document.getElementById('mcInstructionsText').value.trim();
        if (!instructionsText) {
          alert('Please enter instructions text.');
          return null;
        }
        if (instructionsText.length > 3000) {
          alert('Instructions must be 3000 characters or less.');
          return null;
        }
      }

      // Collect all choices
      const choices = [];
      const choiceElements = document.querySelectorAll('#mcChoicesContainer [data-choice-number]');

      for (let i = 0; i < choiceElements.length; i++) {
        const input = choiceElements[i].querySelector('input');
        const choiceText = input.value.trim();

        if (!choiceText) {
          alert(`Please enter text for Choice ${i + 1}.`);
          return null;
        }

        choices.push(choiceText);
      }

      // Must have at least 2 choices
      if (choices.length < 2) {
        alert('You must have at least 2 choices.');
        return null;
      }

      // Build question object
      const questionObj = {
        type: 'mc',
        questionType: 'mc',
        question: question,
        required: document.getElementById('mcRequired').checked ? 'y' : 'n',
        instructions: hasInstructions ? document.getElementById('mcInstructionsText').value.trim() : '',
        choices: choices
      };

      return questionObj;
    }

    // Function to validate and build multi-select question
    function buildMultiSelectQuestion() {
      // Validate required fields
      const question = document.getElementById('msQuestion').value.trim();
      const hasInstructions = document.getElementById('msInstructions').checked;

      if (!question) {
        alert('Please enter a question.');
        return null;
      }

      // Validate instructions if checkbox is checked
      if (hasInstructions) {
        const instructionsText = document.getElementById('msInstructionsText').value.trim();
        if (!instructionsText) {
          alert('Please enter instructions text.');
          return null;
        }
        if (instructionsText.length > 3000) {
          alert('Instructions must be 3000 characters or less.');
          return null;
        }
      }

      // Collect all choices
      const choices = [];
      const choiceElements = document.querySelectorAll('#msChoicesContainer [data-choice-number]');

      for (let i = 0; i < choiceElements.length; i++) {
        const input = choiceElements[i].querySelector('input');
        const choiceText = input.value.trim();

        if (!choiceText) {
          alert(`Please enter text for Choice ${i + 1}.`);
          return null;
        }

        choices.push(choiceText);
      }

      // Must have at least 2 choices
      if (choices.length < 2) {
        alert('You must have at least 2 choices.');
        return null;
      }

      // Build question object
      const questionObj = {
        type: 'ms',
        questionType: 'ms',
        question: question,
        required: document.getElementById('msRequired').checked ? 'y' : 'n',
        instructions: hasInstructions ? document.getElementById('msInstructionsText').value.trim() : '',
        choices: choices
      };

      return questionObj;
    }

    // Function to validate and build table question
    function buildTableQuestion() {
      // Validate required fields
      const question = document.getElementById('tblQuestion').value.trim();
      const hasInstructions = document.getElementById('tblInstructions').checked;

      if (!question) {
        alert('Please enter a question.');
        return null;
      }

      // Validate instructions if checkbox is checked
      if (hasInstructions) {
        const instructionsText = document.getElementById('tblInstructionsText').value.trim();
        if (!instructionsText) {
          alert('Please enter instructions text.');
          return null;
        }
        if (instructionsText.length > 3000) {
          alert('Instructions must be 3000 characters or less.');
          return null;
        }
      }

      // Collect all headers
      const headers = [];
      const headerElements = document.querySelectorAll('#tblHeadersContainer [data-header-number]');

      for (let i = 0; i < headerElements.length; i++) {
        const headerNumber = i + 1;
        const headerTitle = document.getElementById(`tblHeader${headerNumber}`).value.trim();
        const headerFormat = document.getElementById(`tblFormat${headerNumber}`).value;

        if (!headerTitle) {
          alert(`Please enter Header ${headerNumber}.`);
          return null;
        }

        if (!headerFormat) {
          alert(`Please select Column Format for Header ${headerNumber}.`);
          return null;
        }

        headers.push({
          title: headerTitle,
          format: headerFormat
        });
      }

      // Get required rows
      const requiredRows = document.getElementById('tblRequiredRows').value;

      // Build question object
      const questionObj = {
        type: 'tbl',
        questionType: 'tbl',
        question: question,
        instructions: hasInstructions ? document.getElementById('tblInstructionsText').value.trim() : '',
        headers: headers,
        requiredRows: requiredRows
      };

      return questionObj;
    }

    // Function to validate and build address/repeatable fields question
    function buildAddressQuestion() {
      // Validate required fields
      const question = document.getElementById('addrQuestion').value.trim();
      const hasInstructions = document.getElementById('addrInstructions').checked;

      if (!question) {
        alert('Please enter a question.');
        return null;
      }

      // Validate instructions if checkbox is checked
      if (hasInstructions) {
        const instructionsText = document.getElementById('addrInstructionsText').value.trim();
        if (!instructionsText) {
          alert('Please enter instructions text.');
          return null;
        }
        if (instructionsText.length > 3000) {
          alert('Instructions must be 3000 characters or less.');
          return null;
        }
      }

      // Get minimum field-sets
      const minFieldSets = document.getElementById('addrMinFieldSets').value;

      // Collect all selected fields
      const fields = [];

      // Helper to add field if displayed
      function addFieldIfDisplayed(fieldName, displayedId, requiredId) {
        const displayed = document.getElementById(displayedId).checked;
        if (displayed) {
          const required = document.getElementById(requiredId).checked;
          fields.push({
            name: fieldName,
            required: required ? 'y' : 'n'
          });
        }
      }

      // Business Information
      addFieldIfDisplayed('Business Name', 'addrBusinessNameDisplayed', 'addrBusinessNameRequired');
      addFieldIfDisplayed('Position/Job Title', 'addrPositionDisplayed', 'addrPositionRequired');
      addFieldIfDisplayed('Branch Name/Number', 'addrBranchDisplayed', 'addrBranchRequired');
      addFieldIfDisplayed('Doing Business As', 'addrDbaDisplayed', 'addrDbaRequired');
      addFieldIfDisplayed('Date', 'addrDateDisplayed', 'addrDateRequired');

      // Personal Information
      addFieldIfDisplayed('Prefix', 'addrPrefixDisplayed', 'addrPrefixRequired');
      addFieldIfDisplayed('First Name', 'addrFirstNameDisplayed', 'addrFirstNameRequired');
      addFieldIfDisplayed('Middle Name', 'addrMiddleNameDisplayed', 'addrMiddleNameRequired');
      addFieldIfDisplayed('Last Name', 'addrLastNameDisplayed', 'addrLastNameRequired');
      addFieldIfDisplayed('Suffix', 'addrSuffixDisplayed', 'addrSuffixRequired');
      addFieldIfDisplayed('Maiden Name', 'addrMaidenNameDisplayed', 'addrMaidenNameRequired');

      // ID Information
      addFieldIfDisplayed('Date of Birth', 'addrDobDisplayed', 'addrDobRequired');
      addFieldIfDisplayed('Social Security Number', 'addrSsnDisplayed', 'addrSsnRequired');
      addFieldIfDisplayed('Alias', 'addrAliasDisplayed', 'addrAliasRequired');

      // Address Information
      addFieldIfDisplayed('Address Line 1', 'addrLine1Displayed', 'addrLine1Required');
      addFieldIfDisplayed('Address Line 2', 'addrLine2Displayed', 'addrLine2Required');
      addFieldIfDisplayed('City/APO/DPO/FPO', 'addrCityDisplayed', 'addrCityRequired');
      addFieldIfDisplayed('State', 'addrStateDisplayed', 'addrStateRequired');
      addFieldIfDisplayed('Zip Code', 'addrZipDisplayed', 'addrZipRequired');
      addFieldIfDisplayed('County', 'addrCountyDisplayed', 'addrCountyRequired');

      // Contact Information
      addFieldIfDisplayed('Telephone Number', 'addrTelephoneDisplayed', 'addrTelephoneRequired');
      addFieldIfDisplayed('Alt. Telephone Number', 'addrAltTelephoneDisplayed', 'addrAltTelephoneRequired');
      addFieldIfDisplayed('Email Address', 'addrEmailDisplayed', 'addrEmailRequired');

      // Must have at least one field selected
      if (fields.length === 0) {
        alert('Please select at least one field to display.');
        return null;
      }

      // Build question object
      const questionObj = {
        type: 'addr',
        questionType: 'addr',
        question: question,
        required: minFieldSets === '0' ? 'n' : 'y',
        instructions: hasInstructions ? document.getElementById('addrInstructionsText').value.trim() : '',
        minFieldSets: minFieldSets,
        fields: fields
      };

      return questionObj;
    }

    // Function to validate and build yes/no question
    function buildYesNoQuestion() {
      // Validate required fields
      const question = document.getElementById('ynQuestion').value.trim();
      const choice1 = document.getElementById('ynChoice1').value.trim();
      const choice2 = document.getElementById('ynChoice2').value.trim();
      const hasInstructions = document.getElementById('ynInstructions').checked;

      if (!question) {
        alert('Please enter a question.');
        return null;
      }

      if (!choice1) {
        alert('Please enter Choice 1.');
        return null;
      }

      if (!choice2) {
        alert('Please enter Choice 2.');
        return null;
      }

      // Validate instructions if checkbox is checked
      if (hasInstructions) {
        const instructionsText = document.getElementById('ynInstructionsText').value.trim();
        if (!instructionsText) {
          alert('Please enter instructions text.');
          return null;
        }
        if (instructionsText.length > 3000) {
          alert('Instructions must be 3000 characters or less.');
          return null;
        }
      }

      // Build question object
      const questionObj = {
        type: 'yn',
        questionType: 'yn',
        question: question,
        required: document.getElementById('ynRequired').checked ? 'y' : 'n',
        instructions: hasInstructions ? document.getElementById('ynInstructionsText').value.trim() : '',
        choice1: choice1,
        choice2: choice2
      };

      return questionObj;
    }

    // Function to validate and build free form question
    function buildFreeFormQuestion() {
      // Validate required fields
      const question = document.getElementById('ffQuestion').value.trim();
      const format = document.getElementById('ffFormat').value;
      const hasInstructions = document.getElementById('ffInstructions').checked;

      if (!question) {
        alert('Please enter a question.');
        return null;
      }

      if (!format) {
        alert('Please select a format.');
        return null;
      }

      // Validate instructions if checkbox is checked
      if (hasInstructions) {
        const instructionsText = document.getElementById('ffInstructionsText').value.trim();
        if (!instructionsText) {
          alert('Please enter instructions text.');
          return null;
        }
        if (instructionsText.length > 3000) {
          alert('Instructions must be 3000 characters or less.');
          return null;
        }
      }

      // Build question object
      const questionObj = {
        type: 'question',
        questionType: 'ff',
        question: question,
        required: document.getElementById('ffRequired').checked ? 'y' : 'n',
        instructions: hasInstructions ? document.getElementById('ffInstructionsText').value.trim() : '',
        format: format === 'alphanumeric' ? 'an' : 'num'
      };

      // Handle alphanumeric format
      if (format === 'alphanumeric') {
        const responseLength = document.getElementById('ffResponseLength').value;

        if (!responseLength) {
          alert('Please select a response length.');
          return null;
        }

        questionObj.length = responseLength;

        if (responseLength === 'custom') {
          const maxLength = document.getElementById('ffMaxLength').value;
          if (!maxLength) {
            alert('Please enter a max length.');
            return null;
          }
          questionObj.minLength = document.getElementById('ffMinLength').value || '';
          questionObj.maxLength = maxLength;
        }
      }

      // Handle numeric format
      if (format === 'numeric') {
        const formatOptions = document.getElementById('ffFormatOptions').value;

        if (!formatOptions) {
          alert('Please select format options.');
          return null;
        }

        questionObj.numericFormat = formatOptions;

        if (formatOptions === 'currency') {
          const maxValue = document.getElementById('ffCurrencyMax').value;
          if (!maxValue) {
            alert('Please enter a max value.');
            return null;
          }
          questionObj.minValue = document.getElementById('ffCurrencyMin').value || '0';
          questionObj.maxValue = maxValue;
        } else if (formatOptions === 'decimal') {
          const decimalPlaces = document.getElementById('ffDecimalPlaces').value;
          const maxValue = document.getElementById('ffDecimalMax').value;
          if (!decimalPlaces && decimalPlaces !== '0') {
            alert('Please enter number of decimal places.');
            return null;
          }
          if (!maxValue) {
            alert('Please enter a max value.');
            return null;
          }
          questionObj.decimalPlaces = decimalPlaces;
          questionObj.minValue = document.getElementById('ffDecimalMin').value || '0';
          questionObj.maxValue = maxValue;
        } else if (formatOptions === 'integer') {
          const maxValue = document.getElementById('ffIntegerMax').value;
          if (!maxValue) {
            alert('Please enter a max value.');
            return null;
          }
          questionObj.minValue = document.getElementById('ffIntegerMin').value || '0';
          questionObj.maxValue = maxValue;
        } else if (formatOptions === 'percentage') {
          const decimalPlaces = document.getElementById('ffPercentageDecimalPlaces').value;
          const maxValue = document.getElementById('ffPercentageMax').value;
          if (!decimalPlaces && decimalPlaces !== '0') {
            alert('Please enter number of decimal places.');
            return null;
          }
          if (!maxValue) {
            alert('Please enter a max value.');
            return null;
          }
          questionObj.decimalPlaces = decimalPlaces;
          questionObj.minValue = document.getElementById('ffPercentageMin').value || '0';
          questionObj.maxValue = maxValue;
        }
      }

      return questionObj;
    }

    // Parse button click handler
    document.getElementById('parseButton').addEventListener('click', function() {
      const input = document.getElementById('formBuilderInput').value;
      const result = parseQuickBuilderInput(input);

      parsedQuestions = result.parsed;

      // Show success notification if there are valid questions
      if (result.parsed.length > 0) {
        showSuccessNotification(result.parsed.length, result.errors.length);
      }

      displayErrors(result.errors);
      displayPreview(result.parsed);
    });

    // Save button click handler
    document.getElementById('saveButton').addEventListener('click', function() {
      console.log('Save clicked. parsedQuestions:', parsedQuestions);

      // Check if user is building a question
      const freeFormSection = document.getElementById('freeFormSection');
      const yesNoSection = document.getElementById('yesNoSection');
      const acknowledgementSection = document.getElementById('acknowledgementSection');
      const dateSection = document.getElementById('dateSection');
      const multipleChoiceSection = document.getElementById('multipleChoiceSection');
      const tableSection = document.getElementById('tableSection');
      const addressSection = document.getElementById('addressSection');
      const questionType = document.getElementById('questionType').value;

      let builtQuestion = null;

      // Try to build Free Form question
      if (questionType === 'Free Form' && freeFormSection.style.display !== 'none') {
        builtQuestion = buildFreeFormQuestion();
        if (!builtQuestion) {
          return; // Validation failed
        }
      }

      // Try to build Yes/No question
      if (questionType === 'Yes/No; Either/Or' && yesNoSection.style.display !== 'none') {
        builtQuestion = buildYesNoQuestion();
        if (!builtQuestion) {
          return; // Validation failed
        }
      }

      // Try to build Acknowledgement question
      if (questionType === 'Acknowledgment' && acknowledgementSection.style.display !== 'none') {
        builtQuestion = buildAcknowledgementQuestion();
        if (!builtQuestion) {
          return; // Validation failed
        }
      }

      // Try to build Date question
      if (questionType === 'Date / Date Range' && dateSection.style.display !== 'none') {
        builtQuestion = buildDateQuestion();
        if (!builtQuestion) {
          return; // Validation failed
        }
      }

      // Try to build Multiple Choice question
      if (questionType === 'Multiple Choice' && multipleChoiceSection.style.display !== 'none') {
        builtQuestion = buildMultipleChoiceQuestion();
        if (!builtQuestion) {
          return; // Validation failed
        }
      }

      // Try to build Multi-Select question
      const multiSelectSection = document.getElementById('multiSelectSection');
      if (questionType === 'Multi-Select' && multiSelectSection.style.display !== 'none') {
        builtQuestion = buildMultiSelectQuestion();
        if (!builtQuestion) {
          return; // Validation failed
        }
      }

      // Try to build Table question
      if (questionType === 'Table' && tableSection.style.display !== 'none') {
        builtQuestion = buildTableQuestion();
        if (!builtQuestion) {
          return; // Validation failed
        }
      }

      // Try to build Address question
      if (questionType === 'Addresses / Repeatable Fields' && addressSection.style.display !== 'none') {
        builtQuestion = buildAddressQuestion();
        if (!builtQuestion) {
          return; // Validation failed
        }
      }

      // If we built a question, handle edit or add
      if (builtQuestion) {
        // If in edit mode, update the existing question
        if (isEditMode && editQuestionIndex !== null) {
          // Load existing questions from storage
          const storedQuestions = sessionStorage.getItem('reviewQuestions') || localStorage.getItem('reviewQuestions');
          if (storedQuestions) {
            parsedQuestions = JSON.parse(storedQuestions);
          }
          // Update the question at the edit index
          parsedQuestions[editQuestionIndex] = builtQuestion;

          // Store and set notification flag for edit
          const questionsData = JSON.stringify(parsedQuestions);
          localStorage.setItem('reviewQuestions', questionsData);
          sessionStorage.setItem('reviewQuestions', questionsData);
          sessionStorage.setItem('showQuestionEditedNotification', 'true');

          // Navigate back to review questions
          setTimeout(function() {
            window.location.href = 'review-questions.html';
          }, 100);
          return;
        } else {
          // Add the question to the array
          parsedQuestions.push(builtQuestion);
        }
      } else if (questionType === 'Form Builder') {
        // Form Builder requires Build Questions to be clicked first
        if (parsedQuestions.length === 0) {
          alert('Please build questions before saving. Click "Build Questions" first.');
          return;
        }
      }

      // Check if there are any questions to save
      if (parsedQuestions.length === 0) {
        alert('Please add at least one question before saving.');
        return;
      }

      // Store questions in both localStorage and sessionStorage for reliability
      const questionsData = JSON.stringify(parsedQuestions);
      localStorage.setItem('reviewQuestions', questionsData);
      sessionStorage.setItem('reviewQuestions', questionsData);
      console.log('Saved to storage:', parsedQuestions);

      // Set flag to show success notification on review-questions page
      sessionStorage.setItem('showQuestionCreatedNotification', 'true');

      // Small delay to ensure storage completes, then navigate
      setTimeout(function() {
        window.location.href = 'review-questions.html';
      }, 100);
    });

    // Main preview button
    document.getElementById('mainPreviewButton').addEventListener('click', function() {
      // Check if user is building a question in the UI
      const freeFormSection = document.getElementById('freeFormSection');
      const yesNoSection = document.getElementById('yesNoSection');
      const acknowledgementSection = document.getElementById('acknowledgementSection');
      const dateSection = document.getElementById('dateSection');
      const multipleChoiceSection = document.getElementById('multipleChoiceSection');
      const multiSelectSection = document.getElementById('multiSelectSection');
      const tableSection = document.getElementById('tableSection');
      const addressSection = document.getElementById('addressSection');
      const questionType = document.getElementById('questionType').value;

      let questionsToPreview = [...parsedQuestions]; // Copy existing questions
      let currentQuestion = null;

      // Try to build current question being edited
      if (questionType === 'Free Form' && freeFormSection.style.display !== 'none') {
        currentQuestion = buildFreeFormQuestion();
      } else if (questionType === 'Yes/No; Either/Or' && yesNoSection.style.display !== 'none') {
        currentQuestion = buildYesNoQuestion();
      } else if (questionType === 'Acknowledgment' && acknowledgementSection.style.display !== 'none') {
        currentQuestion = buildAcknowledgementQuestion();
      } else if (questionType === 'Date / Date Range' && dateSection.style.display !== 'none') {
        currentQuestion = buildDateQuestion();
      } else if (questionType === 'Multiple Choice' && multipleChoiceSection.style.display !== 'none') {
        currentQuestion = buildMultipleChoiceQuestion();
      } else if (questionType === 'Multi-Select' && multiSelectSection.style.display !== 'none') {
        currentQuestion = buildMultiSelectQuestion();
      } else if (questionType === 'Table' && tableSection.style.display !== 'none') {
        currentQuestion = buildTableQuestion();
      } else if (questionType === 'Addresses / Repeatable Fields' && addressSection.style.display !== 'none') {
        currentQuestion = buildAddressQuestion();
      }

      // If we built a question, add it to preview
      if (currentQuestion) {
        questionsToPreview.push(currentQuestion);
      }

      showPreviewPage(questionsToPreview);
    });

    // Close preview button
    document.getElementById('closePreviewButton').addEventListener('click', function() {
      hidePreviewPage();
    });

    /**
     * Parse the Quick Builder input
     */
    function parseQuickBuilderInput(input) {
      const lines = input.split(/\r?\n/);
      const parsed = [];
      const errors = [];

      for (let i = 0; i < lines.length; i++) {
        const rowNumber = i + 1;
        const rawLine = lines[i].trim();

        if (!rawLine) continue; // Ignore blank lines

        // Detect question type from first token
        const tokens = rawLine.split("|").map(t => t.trim());
        const questionType = (tokens[0] || "").toLowerCase();

        let result;
        if (questionType === "ff") {
          result = parseFFLine(rawLine, rowNumber);
        } else if (questionType === "yn") {
          result = parseYNLine(rawLine, rowNumber);
        } else if (questionType === "ack") {
          result = parseACKLine(rawLine, rowNumber);
        } else if (questionType === "dt") {
          result = parseDTLine(rawLine, rowNumber);
        } else if (questionType === "mc") {
          result = parseMCLine(rawLine, rowNumber);
        } else if (questionType === "ms") {
          result = parseMSLine(rawLine, rowNumber);
        } else if (questionType === "addr") {
          result = parseADDRLine(rawLine, rowNumber);
        } else if (questionType === "tbl") {
          result = parseTBLLine(rawLine, rowNumber);
        } else if (questionType === "tblr") {
          result = parseTBLRLine(rawLine, rowNumber);
        } else {
          result = fail(rowNumber, `Unknown question type "${tokens[0]}". Supported types: ff, yn, ack, dt, mc, ms, addr, tbl, tblr`);
        }

        if (result.ok) {
          parsed.push(result.data);
        } else {
          errors.push(result.error);
        }
      }

      return { parsed, errors };
    }

    /**
     * Parse a single Free Form line
     * Format: ff | question | y/n | instructions | format(an/num) | length(s/m/l/xl)
     */
    function parseFFLine(line, rowNumber) {
      const tokens = line.split("|").map(t => t.trim());

      // Check for too many fields
      if (tokens.length > 6) {
        return fail(rowNumber, "Too many fields for ff. Expected 6 or fewer.");
      }

      // Validate type
      const type = (tokens[0] || "").toLowerCase();
      if (type !== "ff") {
        return fail(rowNumber, `Unknown type "${tokens[0]}". Expected ff.`);
      }

      // Validate question text
      const question = tokens[1] || "";
      if (!question) {
        return fail(rowNumber, "Question text is required for ff.");
      }

      // Validate and normalize required field (defaults to false)
      const requiredRaw = (tokens[2] || "").toLowerCase();
      let required;
      if (requiredRaw === "n" || requiredRaw === "no") {
        required = false;
      } else if (requiredRaw === "y" || requiredRaw === "yes") {
        required = true;
      } else if (requiredRaw === "") {
        required = false; // Default to false
      } else {
        return fail(rowNumber, "Required must be y or n.");
      }

      // Instructions (optional, default to empty string)
      const instructions = tokens[3] || "";

      // Validate format (default to "an")
      const formatRaw = tokens[4] || "";
      const format = formatRaw ? formatRaw.toLowerCase() : "an";
      if (format && !["an", "num"].includes(format)) {
        return fail(rowNumber, "Format must be an or num.");
      }

      // Validate length (default to "m")
      const lengthRaw = tokens[5] || "";
      const length = lengthRaw ? lengthRaw.toLowerCase() : "m";
      if (length && !["s", "m", "l", "xl"].includes(length)) {
        return fail(rowNumber, "Length must be s, m, l, or xl.");
      }

      // Normalize to internal format for compatibility with rest of app
      const data = {
        type: "ff",
        question,
        required: required ? "y" : "n", // Convert boolean to internal format
        instructions,
        format,
        length,
        rowNumber
      };

      // If format is numeric, add default numeric format details for UI compatibility
      if (format === "num") {
        data.numericFormat = "integer";
        data.minValue = "0";
        data.maxValue = "5000";
      }

      return {
        ok: true,
        data
      };
    }

    /**
     * Parse a single Acknowledgement line
     */
    /**
     * Parse a single Acknowledgment line
     * Format: ack | statement | y/n | instructions
     */
    function parseACKLine(line, rowNumber) {
      const tokens = line.split("|").map(t => t.trim());

      // Check for too many fields
      if (tokens.length > 4) {
        return fail(rowNumber, "Too many fields for ack. Expected 4 or fewer.");
      }

      // Validate type
      const type = (tokens[0] || "").toLowerCase();
      if (type !== "ack") {
        return fail(rowNumber, `Unknown type "${tokens[0]}". Expected ack.`);
      }

      // Validate statement text
      const question = tokens[1] || "";
      if (!question) {
        return fail(rowNumber, "Statement text is required for ack.");
      }

      // Validate and normalize required field (defaults to false)
      const requiredRaw = (tokens[2] || "").toLowerCase();
      let required;
      if (requiredRaw === "n" || requiredRaw === "no") {
        required = false;
      } else if (requiredRaw === "y" || requiredRaw === "yes") {
        required = true;
      } else if (requiredRaw === "") {
        required = false; // Default to false
      } else {
        return fail(rowNumber, "Required must be y or n.");
      }

      // Instructions (optional, default to empty string)
      const instructions = tokens[3] || "";

      return {
        ok: true,
        data: {
          type: "ack",
          question,
          required: required ? "y" : "n", // Convert boolean to internal format
          instructions,
          rowNumber
        }
      };
    }

    /**
     * Parse a single Yes/No; Either/Or line
     */
    /**
     * Parse a single Yes/No; Either/Or line
     * Format: yn | question | y/n | labels(option1,option2) | instructions
     */
    function parseYNLine(line, rowNumber) {
      const tokens = line.split("|").map(t => t.trim());

      // Check for too many fields
      if (tokens.length > 5) {
        return fail(rowNumber, "Too many fields for yn. Expected 5 or fewer.");
      }

      // Validate type
      const type = (tokens[0] || "").toLowerCase();
      if (type !== "yn") {
        return fail(rowNumber, `Unknown type "${tokens[0]}". Expected yn.`);
      }

      // Validate question text
      const question = tokens[1] || "";
      if (!question) {
        return fail(rowNumber, "Question text is required for yn.");
      }

      // Validate and normalize required field (defaults to required/y)
      const requiredRaw = (tokens[2] || "y").toLowerCase();
      let required;
      if (requiredRaw === "n" || requiredRaw === "no") {
        required = "n";
      } else if (requiredRaw === "y" || requiredRaw === "yes" || requiredRaw === "") {
        required = "y";
      } else {
        return fail(rowNumber, "Required must be y or n.");
      }

      // Parse labels (format: labels(option1,option2))
      let choice1 = "Yes";
      let choice2 = "No";

      if (tokens[3]) {
        const labelsRaw = tokens[3];
        const labelsMatch = labelsRaw.match(/^labels\((.*)\)$/i);

        if (!labelsMatch) {
          return fail(rowNumber, "Invalid labels format. Expected: labels(option1,option2)");
        }

        const labelParts = labelsMatch[1].split(',').map(l => l.trim()).filter(l => l);

        if (labelParts.length !== 2) {
          return fail(rowNumber, "Exactly 2 labels are required for yn. Format: labels(Yes,No)");
        }

        choice1 = labelParts[0];
        choice2 = labelParts[1];
      }

      // Instructions (optional, default to empty string)
      const instructions = tokens[4] || "";

      return {
        ok: true,
        data: {
          type: "yn",
          question,
          required,
          choice1,
          choice2,
          instructions,
          rowNumber
        }
      };
    }

    /**
     * Parse a single Date / Date Range line
     */
    /**
     * Parse a single Date / Date Range line
     * Format: dt | question | y/n | type(single/range) | instructions
     */
    function parseDTLine(line, rowNumber) {
      const tokens = line.split("|").map(t => t.trim());

      // Check for too many fields
      if (tokens.length > 5) {
        return fail(rowNumber, "Too many fields for dt. Expected 5 or fewer.");
      }

      // Validate type
      const type = (tokens[0] || "").toLowerCase();
      if (type !== "dt") {
        return fail(rowNumber, `Unknown type "${tokens[0]}". Expected dt.`);
      }

      // Validate question text
      const question = tokens[1] || "";
      if (!question) {
        return fail(rowNumber, "Question text is required for dt.");
      }

      // Validate and normalize required field (defaults to false)
      const requiredRaw = (tokens[2] || "").toLowerCase();
      let required;
      if (requiredRaw === "n" || requiredRaw === "no") {
        required = false;
      } else if (requiredRaw === "y" || requiredRaw === "yes") {
        required = true;
      } else if (requiredRaw === "") {
        required = false; // Default to false
      } else {
        return fail(rowNumber, "Required must be y or n.");
      }

      // Parse date type (default to single)
      let dateType = "single";

      if (tokens[3]) {
        const dateTypeRaw = tokens[3];
        const dateTypeMatch = dateTypeRaw.match(/^type\((single|range)\)$/i);

        if (!dateTypeMatch) {
          return fail(rowNumber, "Date type must use type(single) or type(range).");
        }

        dateType = dateTypeMatch[1].toLowerCase();
      }

      // Instructions (optional, default to empty string)
      const instructions = tokens[4] || "";

      return {
        ok: true,
        data: {
          type: "dt",
          question,
          required: required ? "y" : "n", // Convert boolean to internal format
          dateRange: dateType === "range" ? "y" : "n", // Convert to internal format
          instructions,
          rowNumber
        }
      };
    }

    /**
     * Parse a single Multiple Choice line
     * Format: mc | question | y/n | choices(option1,option2,option3,...) | instructions
     */
    function parseMCLine(line, rowNumber) {
      const tokens = line.split("|").map(t => t.trim());

      // Check for too many fields
      if (tokens.length > 5) {
        return fail(rowNumber, "Too many fields for mc. Expected 5 or fewer.");
      }

      // Validate type
      const type = (tokens[0] || "").toLowerCase();
      if (type !== "mc") {
        return fail(rowNumber, `Unknown type "${tokens[0]}". Expected mc.`);
      }

      // Validate question text
      const question = tokens[1] || "";
      if (!question) {
        return fail(rowNumber, "Question text is required for mc.");
      }

      // Validate and normalize required field (defaults to false)
      const requiredRaw = (tokens[2] || "").toLowerCase();
      let required;
      if (requiredRaw === "n" || requiredRaw === "no") {
        required = false;
      } else if (requiredRaw === "y" || requiredRaw === "yes") {
        required = true;
      } else if (requiredRaw === "") {
        required = false; // Default to false
      } else {
        return fail(rowNumber, "Required must be y or n.");
      }

      // Parse choices (must use choices(...) format)
      const choicesRaw = tokens[3] || "";
      if (!choicesRaw) {
        return fail(rowNumber, "Choices are required for mc.");
      }

      // Enforce choices(...) wrapper
      const choicesMatch = choicesRaw.match(/^choices\((.*)\)$/i);
      if (!choicesMatch) {
        return fail(rowNumber, "Choices must use choices(option1,option2,...).");
      }

      // Extract choices from inside the parentheses
      const choicesContent = choicesMatch[1];
      if (!choicesContent || choicesContent.trim() === "") {
        return fail(rowNumber, "Multiple Choice must include at least 2 choices.");
      }

      const choices = choicesContent.split(',').map(c => c.trim());

      // Check for blank choices
      if (choices.some(c => c === "")) {
        return fail(rowNumber, "Choices cannot contain blank values.");
      }

      // Check for minimum 2 choices
      if (choices.length < 2) {
        return fail(rowNumber, "Multiple Choice must include at least 2 choices.");
      }

      // Instructions (optional, default to empty string)
      const instructions = tokens[4] || "";

      return {
        ok: true,
        data: {
          type: "mc",
          question,
          required: required ? "y" : "n", // Convert boolean to internal format
          choices,
          instructions,
          rowNumber
        }
      };
    }

    /**
     * Parse a single Multi-Select line
     * Format: ms | question | y/n | choices | instructions
     */
    /**
     * Parse a single Multi-Select line
     * Format: ms | question | y/n | choices(option1,option2,option3,...) | instructions
     */
    /**
     * Parse a Multi-Select line from Quick Builder
     * Format: ms | question | y/n | choices(option1,option2,option3,...) | min/max(x/y) | instructions
     */
    function parseMSLine(line, rowNumber) {
      const tokens = line.split("|").map(t => t.trim());

      // Check for too many fields
      if (tokens.length > 6) {
        return fail(rowNumber, "Too many fields for ms. Expected 6 or fewer.");
      }

      // Validate type
      const type = (tokens[0] || "").toLowerCase();
      if (type !== "ms") {
        return fail(rowNumber, `Unknown type "${tokens[0]}". Expected ms.`);
      }

      // Validate question text
      const question = tokens[1] || "";
      if (!question) {
        return fail(rowNumber, "Question text is required for ms.");
      }

      // Validate and normalize required field (defaults to false)
      const requiredRaw = (tokens[2] || "").toLowerCase();
      let required;
      if (requiredRaw === "n" || requiredRaw === "no") {
        required = false;
      } else if (requiredRaw === "y" || requiredRaw === "yes") {
        required = true;
      } else if (requiredRaw === "") {
        required = false; // Default to false
      } else {
        return fail(rowNumber, "Required must be y or n.");
      }

      // Parse choices (must use choices(...) format)
      const choicesRaw = tokens[3] || "";
      if (!choicesRaw) {
        return fail(rowNumber, "Choices are required for ms.");
      }

      // Enforce choices(...) wrapper
      const choicesMatch = choicesRaw.match(/^choices\((.*)\)$/i);
      if (!choicesMatch) {
        return fail(rowNumber, "Choices must use choices(option1,option2,...).");
      }

      // Extract choices from inside the parentheses
      const choicesContent = choicesMatch[1];
      if (!choicesContent || choicesContent.trim() === "") {
        return fail(rowNumber, "Multi-Select must include at least 2 choices.");
      }

      const choices = choicesContent.split(',').map(c => c.trim());

      // Check for blank choices
      if (choices.some(c => c === "")) {
        return fail(rowNumber, "Choices cannot contain blank values.");
      }

      // Check for minimum 2 choices
      if (choices.length < 2) {
        return fail(rowNumber, "Multi-Select must include at least 2 choices.");
      }

      // Parse min/max (optional, format: min/max(x/y))
      let minSelections = null;
      let maxSelections = null;
      const minMaxRaw = tokens[4] || "";
      if (minMaxRaw) {
        const minMaxMatch = minMaxRaw.match(/^min\/max\((\d+)\/(\d+)\)$/i);
        if (!minMaxMatch) {
          return fail(rowNumber, "Min/max must use min/max(x/y).");
        }

        const minValue = minMaxMatch[1];
        const maxValue = minMaxMatch[2];

        const minNum = parseInt(minValue, 10);
        const maxNum = parseInt(maxValue, 10);

        if (isNaN(minNum) || isNaN(maxNum)) {
          return fail(rowNumber, "Min/max values must be whole numbers.");
        }

        if (minNum < 0) {
          return fail(rowNumber, "Minimum selections cannot be less than 0.");
        }

        if (maxNum < 1) {
          return fail(rowNumber, "Maximum selections must be at least 1.");
        }

        if (minNum > maxNum) {
          return fail(rowNumber, "Minimum selections cannot exceed maximum selections.");
        }

        if (maxNum > choices.length) {
          return fail(rowNumber, "Maximum selections cannot exceed the number of choices.");
        }

        minSelections = minNum;
        maxSelections = maxNum;
      }

      // Instructions (optional, default to empty string)
      const instructions = tokens[5] || "";

      return {
        ok: true,
        data: {
          type: "ms",
          question,
          required: required ? "y" : "n", // Convert boolean to internal format
          choices,
          minSelections,
          maxSelections,
          instructions,
          rowNumber
        }
      };
    }

    /**
     * Parse an Address / Repeatable Fields line from Quick Builder
     * Format: addr | question | y/n | repeat(y/n) | instructions
     *
     * Maps to builder format with default field set for compatibility
     */
    function parseADDRLine(line, rowNumber) {
      const tokens = line.split("|").map(t => t.trim());

      // Check for too many fields
      if (tokens.length > 5) {
        return fail(rowNumber, "Too many fields for addr. Expected 5 or fewer.");
      }

      // Validate type
      const type = (tokens[0] || "").toLowerCase();
      if (type !== "addr") {
        return fail(rowNumber, `Unknown type "${tokens[0]}". Expected addr.`);
      }

      // Validate question text
      const question = tokens[1] || "";
      if (!question) {
        return fail(rowNumber, "Question text is required for addr.");
      }

      // Validate and normalize required field (defaults to false)
      const requiredRaw = (tokens[2] || "").toLowerCase();
      let required;
      if (requiredRaw === "n" || requiredRaw === "no") {
        required = false;
      } else if (requiredRaw === "y" || requiredRaw === "yes") {
        required = true;
      } else if (requiredRaw === "") {
        required = false; // Default to false
      } else {
        return fail(rowNumber, "Required must be y or n.");
      }

      // Parse repeat (format: repeat(y) or repeat(n))
      let repeatable = false;
      const repeatRaw = tokens[3] || "";
      if (repeatRaw) {
        const repeatMatch = repeatRaw.match(/^repeat\((y|n)\)$/i);
        if (!repeatMatch) {
          return fail(rowNumber, "Repeat must use repeat(y) or repeat(n).");
        }
        repeatable = repeatMatch[1].toLowerCase() === 'y';
      }

      // Instructions (optional, default to empty string)
      const instructions = tokens[4] || "";

      // Compatibility layer: provide default field set for UI builder
      // Quick Builder uses simplified syntax, so we map to standard address fields
      const defaultFields = [
        { name: 'First Name', required: 'n' },
        { name: 'Last Name', required: 'n' },
        { name: 'Address Line 1', required: 'n' },
        { name: 'Address Line 2', required: 'n' },
        { name: 'City/APO/DPO/FPO', required: 'n' },
        { name: 'State', required: 'n' },
        { name: 'Zip Code', required: 'n' }
      ];

      // Set minFieldSets based on whether question is required
      // If required, at least 1 address set must be provided
      const minFieldSets = required ? "1" : "0";

      return {
        ok: true,
        data: {
          type: "addr",
          question,
          required: required ? "y" : "n", // Convert boolean to internal format
          repeatable,
          instructions,
          fields: defaultFields, // For UI builder compatibility
          minFieldSets, // For UI builder compatibility
          rowNumber
        }
      };
    }

    /**
     * Parse a single Table line
     * Format: tbl | question | y/n | columns(Name,Age,Relationship) | rows(3) | instructions
     */
    function parseTBLLine(line, rowNumber) {
      const tokens = line.split("|").map(t => t.trim());

      // Check for too many fields
      if (tokens.length > 6) {
        return fail(rowNumber, "Too many fields for tbl. Expected 6 or fewer.");
      }

      // Validate type
      const type = (tokens[0] || "").toLowerCase();
      if (type !== "tbl") {
        return fail(rowNumber, `Unknown type "${tokens[0]}". Expected tbl.`);
      }

      // Validate question text
      const question = tokens[1] || "";
      if (!question) {
        return fail(rowNumber, "Question text is required for tbl.");
      }

      // Validate and normalize required field (defaults to false)
      const requiredRaw = (tokens[2] || "").toLowerCase();
      let required;
      if (requiredRaw === "n" || requiredRaw === "no") {
        required = false;
      } else if (requiredRaw === "y" || requiredRaw === "yes") {
        required = true;
      } else if (requiredRaw === "") {
        required = false; // Default to false
      } else {
        return fail(rowNumber, "Required must be y or n.");
      }

      // Parse columns (format: columns(Name,Age,Relationship))
      const columnsRaw = tokens[3] || "";
      if (!columnsRaw) {
        return fail(rowNumber, "Columns are required for tbl.");
      }

      // Enforce columns(...) wrapper
      const columnsMatch = columnsRaw.match(/^columns\((.*)\)$/i);
      if (!columnsMatch) {
        return fail(rowNumber, "Columns must use columns(column1,column2,...).");
      }

      // Extract column names from inside the parentheses
      const columnsContent = columnsMatch[1];
      if (!columnsContent || columnsContent.trim() === "") {
        return fail(rowNumber, "Table must include at least 2 columns.");
      }

      const columnNames = columnsContent.split(',').map(c => c.trim());

      // Check for blank column names
      if (columnNames.some(c => c === "")) {
        return fail(rowNumber, "Columns cannot contain blank values.");
      }

      // Check for minimum 2 columns
      if (columnNames.length < 2) {
        return fail(rowNumber, "Table must include at least 2 columns.");
      }

      // Build headers array with default format of alphanumeric
      const headers = columnNames.map(name => ({
        title: name,
        format: 'alphanumeric'
      }));

      // Parse rows (optional, format: rows(3))
      let requiredRows = null;
      if (tokens[4]) {
        const rowsRaw = tokens[4];
        const rowsMatch = rowsRaw.match(/^rows\((\d+)\)$/i);
        if (!rowsMatch) {
          return fail(rowNumber, "Rows must use rows(n).");
        }

        const rowsValue = rowsMatch[1];
        const requiredRowsNum = parseInt(rowsValue, 10);

        if (isNaN(requiredRowsNum)) {
          return fail(rowNumber, "Row count must be a whole number.");
        }

        if (requiredRowsNum < 1) {
          return fail(rowNumber, "Row count must be at least 1.");
        }

        requiredRows = requiredRowsNum;
      }

      // Instructions (optional, default to empty string)
      const instructions = tokens[5] || "";

      return {
        ok: true,
        data: {
          type: "tbl",
          question,
          required: required ? "y" : "n", // Convert boolean to internal format
          headers,
          requiredRows: requiredRows !== null ? requiredRows.toString() : "0",
          instructions,
          rowNumber
        }
      };
    }

    /**
     * Parse a TBLR (Table Row Labels) line from Quick Builder
     * Format: tblr | question | y/n | rows(Label1,Label2,Label3) | columns(Header2,Header3) | instructions
     * Maps to UI builder with default settings for edit mode compatibility
     */
    function parseTBLRLine(line, rowNumber) {
      const tokens = line.split("|").map(t => t.trim());

      // Check for too many fields (max 6: type, question, required, rows, columns, instructions)
      if (tokens.length > 6) {
        return fail(rowNumber, "Too many fields for tblr. Expected 6 or fewer.");
      }

      // Validate type
      const type = (tokens[0] || "").toLowerCase();
      if (type !== "tblr") {
        return fail(rowNumber, `Unknown type "${tokens[0]}". Expected tblr.`);
      }

      // Validate question text
      const question = tokens[1] || "";
      if (!question) {
        return fail(rowNumber, "Question text is required for tblr.");
      }

      // Validate and normalize required field (defaults to false)
      const requiredRaw = (tokens[2] || "").toLowerCase();
      let required;
      if (requiredRaw === "n" || requiredRaw === "no") {
        required = false;
      } else if (requiredRaw === "y" || requiredRaw === "yes") {
        required = true;
      } else if (requiredRaw === "") {
        required = false; // Default to false
      } else {
        return fail(rowNumber, "Required must be y or n.");
      }

      // Parse rows (format: rows(Label1,Label2,Label3))
      const rowsRaw = tokens[3] || "";
      if (!rowsRaw) {
        return fail(rowNumber, "Rows are required for tblr.");
      }

      // Enforce rows(...) wrapper
      const rowsMatch = rowsRaw.match(/^rows\((.*)\)$/i);
      if (!rowsMatch) {
        return fail(rowNumber, "Rows must use rows(label1,label2,...).");
      }

      // Extract row labels from inside the parentheses
      const rowsContent = rowsMatch[1];
      if (!rowsContent || rowsContent.trim() === "") {
        return fail(rowNumber, "Table must include at least 1 row label.");
      }

      const rowLabelNames = rowsContent.split(',').map(r => r.trim());

      // Check for blank row labels
      if (rowLabelNames.some(r => r === "")) {
        return fail(rowNumber, "Row labels cannot contain blank values.");
      }

      // Check for minimum 1 row label
      if (rowLabelNames.length < 1) {
        return fail(rowNumber, "Table must include at least 1 row label.");
      }

      // Build row labels array with required: false default
      const rowLabels = rowLabelNames.map(label => ({
        label: label,
        required: false
      }));

      // Parse columns (format: columns(Header2,Header3))
      const columnsRaw = tokens[4] || "";
      if (!columnsRaw) {
        return fail(rowNumber, "Columns are required for tblr.");
      }

      // Enforce columns(...) wrapper
      const columnsMatch = columnsRaw.match(/^columns\((.*)\)$/i);
      if (!columnsMatch) {
        return fail(rowNumber, "Columns must use columns(header1,header2,...).");
      }

      // Extract column headers from inside the parentheses
      const columnsContent = columnsMatch[1];
      if (!columnsContent || columnsContent.trim() === "") {
        return fail(rowNumber, "Table must include at least 1 column header.");
      }

      const columnHeaderNames = columnsContent.split(',').map(c => c.trim());

      // Check for blank column headers
      if (columnHeaderNames.some(c => c === "")) {
        return fail(rowNumber, "Column headers cannot contain blank values.");
      }

      // Check for minimum 1 column header
      if (columnHeaderNames.length < 1) {
        return fail(rowNumber, "Table must include at least 1 column header.");
      }

      // Build column headers array with default format of alphanumeric
      const columnHeaders = columnHeaderNames.map(name => ({
        title: name,
        format: 'alphanumeric'
      }));

      // Instructions (optional, default to empty string)
      const instructions = tokens[5] || "";

      // Return data structure compatible with UI builder
      // This ensures edit mode behaves like a manually created Table (Row Labels) question
      return {
        ok: true,
        data: {
          type: "tblr",
          question,
          required: required ? "y" : "n", // Convert boolean to internal format
          agencyDefined: true, // Always true for Quick Builder
          rowLabelHeader: "Row Label", // Default Header 1 text
          rowLabels, // Parsed from rows(...)
          submitterDefined: false, // Always false when agencyDefined is true
          columnHeaders, // Parsed from columns(...) with alphanumeric format
          requiredRows: "0", // Default
          columnAggregations: "none", // Default
          rowAggregations: "none", // Default
          grandTotal: false, // Default
          instructions,
          rowNumber
        }
      };
    }

    /**
     * Create error result
     */
    function fail(rowNumber, message) {
      return {
        ok: false,
        error: `Row ${rowNumber}: ${message}`,
        rowNumber
      };
    }

    /**
     * Show success notification with fly-in animation
     */
    function showSuccessNotification(parsedCount, errorCount) {
      const notification = document.getElementById('successNotification');
      const notificationText = document.getElementById('notificationText');

      let message = `${parsedCount} question${parsedCount !== 1 ? 's' : ''} built successfully!`;
      if (errorCount > 0) {
        message += ` ${errorCount} error${errorCount !== 1 ? 's' : ''} found below.`;
      }

      notificationText.textContent = message;

      // Show notification
      notification.classList.add('show');

      // Hide after 4 seconds
      setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');

        // Reset after animation completes
        setTimeout(() => {
          notification.classList.remove('hide');
        }, 400);
      }, 4000);
    }

    /**
     * Display validation errors as individual alert boxes
     */
    function displayErrors(errors) {
      const errorSection = document.getElementById('errorSection');
      const errorList = document.getElementById('errorList');

      if (errors.length === 0) {
        errorSection.style.display = 'none';
        return;
      }

      errorSection.style.display = 'block';
      errorList.innerHTML = errors.map(error => `
        <div class="usa-alert usa-alert--error" style="margin-bottom: 1rem;">
          <div class="usa-alert__body">
            <p class="usa-alert__text" style="margin: 0;">${escapeHtml(error)}</p>
          </div>
        </div>
      `).join('');
    }

    /**
     * Display preview of parsed questions as rendered form fields
     */
    function displayPreview(questions) {
      const previewSection = document.getElementById('previewSection');
      const previewList = document.getElementById('previewList');

      if (questions.length === 0) {
        previewSection.style.display = 'none';
        return;
      }

      previewSection.style.display = 'block';

      previewList.innerHTML = questions.map((q, index) => {
        return renderFormField(q, index);
      }).join('');
    }

    /**
     * Render a form field based on parsed question data
     */
    function renderFormField(q, index, bordered = false) {
      const isRequired = q.required === 'y';
      const borderStyle = bordered ? 'border: 1px solid #dfe1e2; border-radius: 0.5rem; padding: 2rem;' : 'padding: 1rem;';

      // Handle Acknowledgement questions
      if (q.type === 'ack') {
        let fieldHtml = `
          <div style="${borderStyle} margin-bottom: 2rem; background-color: #fff;">
        `;

        // Add instructions if present (ABOVE the question)
        if (q.instructions) {
          fieldHtml += `
            <div style="margin-bottom: 1.6rem;">
              <p style="margin: 0 0 0.4rem 0; font-weight: 700; font-size: 1.6rem;">Instructions</p>
              <p style="margin: 0; font-size: 1.6rem; color: #71767a;">${escapeHtml(q.instructions)}</p>
            </div>
          `;
        }

        // Add checkbox for acknowledgement (always required)
        fieldHtml += `
          <div class="usa-checkbox">
            <input class="usa-checkbox__input" id="ack-${index}" type="checkbox" name="ack-${index}" required>
            <label class="usa-checkbox__label" for="ack-${index}">
              ${escapeHtml(q.question)}
              <span class="field-required">Required</span>
            </label>
          </div>
        `;

        fieldHtml += `</div>`;
        return fieldHtml;
      }

      // Handle Yes/No questions
      if (q.type === 'yn') {
        let fieldHtml = `
          <div style="${borderStyle} margin-bottom: 2rem; background-color: #fff;">
        `;

        // Add instructions if present (ABOVE the question label)
        if (q.instructions) {
          fieldHtml += `
            <div style="margin-bottom: 1.6rem;">
              <p style="margin: 0 0 0.4rem 0; font-weight: 700; font-size: 1.6rem;">Instructions</p>
              <p style="margin: 0; font-size: 1.6rem; color: #71767a;">${escapeHtml(q.instructions)}</p>
            </div>
          `;
        }

        // Add label for yes/no question
        const choice1 = q.choice1 || 'Yes';
        const choice2 = q.choice2 || 'No';

        fieldHtml += `
          <label class="usa-label">
            ${escapeHtml(q.question)}
            ${isRequired ? '<span class="field-required">Required</span>' : ''}
          </label>
          <div class="usa-radio">
            <input class="usa-radio__input" id="yn-choice1-${index}" type="radio" name="yn-${index}" value="${escapeHtml(choice1)}" ${isRequired ? 'required' : ''}>
            <label class="usa-radio__label" for="yn-choice1-${index}">${escapeHtml(choice1)}</label>
          </div>
          <div class="usa-radio">
            <input class="usa-radio__input" id="yn-choice2-${index}" type="radio" name="yn-${index}" value="${escapeHtml(choice2)}" ${isRequired ? 'required' : ''}>
            <label class="usa-radio__label" for="yn-choice2-${index}">${escapeHtml(choice2)}</label>
          </div>
        `;

        fieldHtml += `</div>`;
        return fieldHtml;
      }

      // Handle Date / Date Range questions
      if (q.type === 'dt') {
        let fieldHtml = `
          <div style="${borderStyle} margin-bottom: 2rem; background-color: #fff;">
        `;

        // Add instructions if present (ABOVE the question label)
        if (q.instructions) {
          fieldHtml += `
            <div style="margin-bottom: 1.6rem;">
              <p style="margin: 0 0 0.4rem 0; font-weight: 700; font-size: 1.6rem;">Instructions</p>
              <p style="margin: 0; font-size: 1.6rem; color: #71767a;">${escapeHtml(q.instructions)}</p>
            </div>
          `;
        }

        // Add label for date question
        fieldHtml += `
          <label class="usa-label" for="dt-${index}">
            ${escapeHtml(q.question)}
            ${isRequired ? '<span class="field-required">Required</span>' : ''}
          </label>
        `;

        // Show single date or date range based on dateRange property
        if (q.dateRange === 'y') {
          fieldHtml += `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label class="usa-label" for="dt-start-${index}" style="margin-top: 0.5rem; font-size: 1.4rem;">Start Date</label>
                <input class="usa-input" id="dt-start-${index}" name="dt-start-${index}" type="date" ${isRequired ? 'required' : ''}>
              </div>
              <div>
                <label class="usa-label" for="dt-end-${index}" style="margin-top: 0.5rem; font-size: 1.4rem;">End Date</label>
                <input class="usa-input" id="dt-end-${index}" name="dt-end-${index}" type="date" ${isRequired ? 'required' : ''}>
              </div>
            </div>
          `;
        } else {
          fieldHtml += `
            <input class="usa-input" id="dt-${index}" name="dt-${index}" type="date" ${isRequired ? 'required' : ''}>
          `;
        }

        fieldHtml += `</div>`;
        return fieldHtml;
      }

      // Handle Multiple Choice questions
      if (q.type === 'mc') {
        let fieldHtml = `
          <div style="${borderStyle} margin-bottom: 2rem; background-color: #fff;">
        `;

        // Add instructions if present (ABOVE the question label)
        if (q.instructions) {
          fieldHtml += `
            <div style="margin-bottom: 1.6rem;">
              <p style="margin: 0 0 0.4rem 0; font-weight: 700; font-size: 1.6rem;">Instructions</p>
              <p style="margin: 0; font-size: 1.6rem; color: #71767a;">${escapeHtml(q.instructions)}</p>
            </div>
          `;
        }

        // Add label for multiple choice question
        fieldHtml += `
          <label class="usa-label">
            ${escapeHtml(q.question)}
            ${isRequired ? '<span class="field-required">Required</span>' : ''}
          </label>
        `;

        // Render each choice as a radio button
        q.choices.forEach((choice, choiceIndex) => {
          fieldHtml += `
            <div class="usa-radio">
              <input class="usa-radio__input" id="mc-choice${choiceIndex}-${index}" type="radio" name="mc-${index}" value="${escapeHtml(choice)}" ${isRequired ? 'required' : ''}>
              <label class="usa-radio__label" for="mc-choice${choiceIndex}-${index}">${escapeHtml(choice)}</label>
            </div>
          `;
        });

        fieldHtml += `</div>`;
        return fieldHtml;
      }

      // Handle Multi-Select questions
      if (q.type === 'ms') {
        let fieldHtml = `
          <div style="${borderStyle} margin-bottom: 2rem; background-color: #fff;">
        `;

        // Add instructions if present (ABOVE the question label)
        if (q.instructions) {
          fieldHtml += `
            <div style="margin-bottom: 1.6rem;">
              <p style="margin: 0 0 0.4rem 0; font-weight: 700; font-size: 1.6rem;">Instructions</p>
              <p style="margin: 0; font-size: 1.6rem; color: #71767a;">${escapeHtml(q.instructions)}</p>
            </div>
          `;
        }

        // Add label for multi-select question
        fieldHtml += `
          <label class="usa-label">
            ${escapeHtml(q.question)}
            ${isRequired ? '<span class="field-required">Required</span>' : ''}
          </label>
        `;

        // Render each choice as a checkbox
        q.choices.forEach((choice, choiceIndex) => {
          fieldHtml += `
            <div class="usa-checkbox">
              <input class="usa-checkbox__input" id="ms-choice${choiceIndex}-${index}" type="checkbox" name="ms-${index}" value="${escapeHtml(choice)}" ${isRequired && choiceIndex === 0 ? 'required' : ''}>
              <label class="usa-checkbox__label" for="ms-choice${choiceIndex}-${index}">${escapeHtml(choice)}</label>
            </div>
          `;
        });

        fieldHtml += `</div>`;
        return fieldHtml;
      }

      // Handle Address / Repeatable Fields questions
      if (q.type === 'addr') {
        let fieldHtml = `
          <div style="${borderStyle} margin-bottom: 2rem; background-color: #fff;">
        `;

        // Add instructions if present (ABOVE the question label)
        if (q.instructions) {
          fieldHtml += `
            <div style="margin-bottom: 1.6rem;">
              <p style="margin: 0 0 0.4rem 0; font-weight: 700; font-size: 1.6rem;">Instructions</p>
              <p style="margin: 0; font-size: 1.6rem; color: #71767a;">${escapeHtml(q.instructions)}</p>
            </div>
          `;
        }

        // Add question label
        fieldHtml += `
          <h3 style="font-size: 1.8rem; margin-bottom: 1.5rem; font-weight: 700;">
            ${escapeHtml(q.question)}
            ${isRequired ? '<span class="field-required">Required</span>' : ''}
          </h3>
        `;

        // Show repeatable indicator if applicable
        if (q.repeatable) {
          fieldHtml += `
            <p style="font-size: 1.4rem; color: #71767a; margin-bottom: 1.5rem;">
              <em>This question allows multiple address entries.</em>
            </p>
          `;
        }

        // Render standard address fields (preview only)
        const standardFields = [
          'First Name',
          'Last Name',
          'Address Line 1',
          'Address Line 2',
          'City',
          'State',
          'ZIP Code'
        ];

        standardFields.forEach((fieldName, fieldIndex) => {
          const fieldId = `addr-field-${index}-${fieldIndex}`;
          const fieldRequired = fieldName !== 'Address Line 2'; // Address Line 2 typically optional

          fieldHtml += `
            <div class="usa-form-group" style="margin-bottom: 1.5rem;">
              <label class="usa-label" for="${fieldId}">
                ${escapeHtml(fieldName)}
                ${fieldRequired && isRequired ? '<span class="field-required">Required</span>' : ''}
              </label>
              <input class="usa-input" id="${fieldId}" name="${fieldId}" type="text" disabled aria-disabled="true">
            </div>
          `;
        });

        // Add buttons
        fieldHtml += `
          <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="button" class="usa-button" disabled aria-disabled="true">Add</button>
            <button type="button" class="usa-button usa-button--accent-cool" disabled aria-disabled="true">Clear</button>
          </div>
        `;

        fieldHtml += `</div>`;
        return fieldHtml;
      }

      // Handle Table questions
      if (q.type === 'tbl') {
        let fieldHtml = `
          <div style="${borderStyle} margin-bottom: 2rem; background-color: #fff;">
        `;

        // Add question label
        fieldHtml += `
          <h3 style="font-size: 1.8rem; margin-bottom: 1.5rem; font-weight: 700;">
            ${escapeHtml(q.question)}
          </h3>
        `;

        // Add instructions if present (below the question)
        if (q.instructions) {
          fieldHtml += `
            <div style="margin-bottom: 1.6rem;">
              <p style="margin: 0 0 0.4rem 0; font-weight: 700; font-size: 1.6rem;">Instructions</p>
              <p style="margin: 0; font-size: 1.6rem; color: #71767a;">${escapeHtml(q.instructions)}</p>
            </div>
          `;
        }

        // Container with background color
        fieldHtml += `
          <div style="background-color: #f3f6f8; border: 1px solid #dfe1e2; border-radius: 0.5rem; padding: 4rem;">
        `;

        // Icon key
        fieldHtml += `
          <div style="background-color: #fff; padding: 1.6rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
            <p style="font-weight: 700; margin: 0 0 1rem 0; font-size: 1.6rem;">Options and Control Types</p>
            <div class="icon-key-grid">
              <div class="icon-key-item">
                <img src="assets/edit-icon.png" alt="" width="24" height="24">
                <span>- Edit</span>
              </div>
              <div class="icon-key-item">
                <img src="assets/icon-delete.png" alt="" width="24" height="24">
                <span>- Delete</span>
              </div>
            </div>
          </div>
        `;

        // Calculate column width percentage
        const headerCount = q.headers.length;
        const columnWidth = (100 / headerCount).toFixed(2);

        // Build table
        fieldHtml += `
          <table class="usa-table usa-table--borderless" style="background-color: #fff; margin-bottom: 1.5rem;">
            <thead>
              <tr>
        `;

        // Add header columns
        q.headers.forEach(header => {
          fieldHtml += `
                <th style="width: ${columnWidth}%;">${escapeHtml(header.title)}</th>
          `;
        });

        fieldHtml += `
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="${headerCount}" style="text-align: center; padding: 2rem; color: #71767a;">No entries</td>
              </tr>
            </tbody>
          </table>
        `;

        // Form inputs for adding rows (below the table)
        q.headers.forEach((header, headerIndex) => {
          const fieldId = `tbl-input-${index}-${headerIndex}`;

          // Check if this column is a document upload
          if (header.format === 'document') {
            fieldHtml += `
              <div class="usa-form-group" style="margin-bottom: 1.5rem;">
                <label class="usa-label" for="${fieldId}">${escapeHtml(header.title)}</label>
                <p style="font-size: 1.4rem; color: #71767a; margin-bottom: 1rem;">File size and type limitations per attachment: 50 MB for txt, csv, png, jpg, jpeg, pdf, doc, xls, docx, xlsx</p>
                <input class="usa-file-input" id="${fieldId}" name="${fieldId}" type="file" disabled aria-disabled="true">
              </div>
            `;
          } else if (header.format === 'date') {
            fieldHtml += `
              <div class="usa-form-group" style="margin-bottom: 1.5rem;">
                <label class="usa-label" for="${fieldId}">${escapeHtml(header.title)}</label>
                <input class="usa-input date-input-custom" id="${fieldId}" name="${fieldId}" type="date" disabled aria-disabled="true">
              </div>
            `;
          } else {
            fieldHtml += `
              <div class="usa-form-group" style="margin-bottom: 1.5rem;">
                <label class="usa-label" for="${fieldId}">${escapeHtml(header.title)}</label>
                <input class="usa-input" id="${fieldId}" name="${fieldId}" type="text" disabled aria-disabled="true">
              </div>
            `;
          }
        });

        // Add buttons (disabled for preview)
        fieldHtml += `
          <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="button" class="usa-button" disabled aria-disabled="true">Save & Add More</button>
            <button type="button" class="usa-button" disabled aria-disabled="true">Save & Finish</button>
          </div>
        `;

        // Close the background container
        fieldHtml += `
          </div>
        `;

        fieldHtml += `</div>`;
        return fieldHtml;
      }

      // Handle Table (Row Labels) questions
      if (q.type === 'tblr') {
        let fieldHtml = `
          <div style="${borderStyle} margin-bottom: 2rem; background-color: #fff;">
        `;

        // Add question label with subtle required indicator
        fieldHtml += `
          <h3 style="font-size: 1.8rem; margin-bottom: 1.5rem; font-weight: 700;">
            ${escapeHtml(q.question)}
            ${isRequired ? '<span style="font-size: 1.4rem; font-weight: 400; color: #71767a; margin-left: 0.5rem;">(Required)</span>' : ''}
          </h3>
        `;

        // Add instructions if present (below the question)
        if (q.instructions) {
          fieldHtml += `
            <div style="margin-bottom: 1.6rem;">
              <p style="margin: 0 0 0.4rem 0; font-weight: 700; font-size: 1.6rem;">Instructions</p>
              <p style="margin: 0; font-size: 1.6rem; color: #71767a;">${escapeHtml(q.instructions)}</p>
            </div>
          `;
        }

        // Container with background color
        fieldHtml += `
          <div style="background-color: #f3f6f8; border: 1px solid #dfe1e2; border-radius: 0.5rem; padding: 4rem;">
        `;

        // Calculate column widths - varied based on column count for better readability
        const firstColumnWidth = 20; // Row labels column
        const remainingWidth = 100 - firstColumnWidth;
        const dataColumnWidth = (remainingWidth / q.columnHeaders.length).toFixed(2);

        // Build table with improved borders
        fieldHtml += `
          <table class="usa-table" style="background-color: #fff; border: 2px solid #565c65; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #e7f2f5;">
                <th style="width: ${firstColumnWidth}%; background-color: #e7f2f5; border: 1px solid #a9aeb1; padding: 1.2rem; font-weight: 700;"></th>
        `;

        // Add column headers
        q.columnHeaders.forEach(header => {
          fieldHtml += `
                <th style="width: ${dataColumnWidth}%; border: 1px solid #a9aeb1; padding: 1.2rem; font-weight: 700; text-align: left;">${escapeHtml(header.title)}</th>
          `;
        });

        fieldHtml += `
              </tr>
            </thead>
            <tbody>
        `;

        // Add rows with labels and input fields
        q.rowLabels.forEach((row, rowIndex) => {
          fieldHtml += `
              <tr>
                <td style="background-color: #f0f0f0; font-weight: 600; border: 1px solid #a9aeb1; padding: 1.2rem;">${escapeHtml(row.label)}</td>
          `;

          // Add input field for each column
          q.columnHeaders.forEach((header, colIndex) => {
            const fieldId = `tblr-${index}-row${rowIndex}-col${colIndex}`;
            fieldHtml += `
                <td style="border: 1px solid #a9aeb1; padding: 0.8rem;">
                  <input class="usa-input" id="${fieldId}" name="${fieldId}" type="text" disabled aria-disabled="true" style="margin: 0; width: 85%;">
                </td>
            `;
          });

          fieldHtml += `
              </tr>
          `;
        });

        fieldHtml += `
            </tbody>
          </table>
        `;

        // Close the background container
        fieldHtml += `
          </div>
        `;

        fieldHtml += `</div>`;
        return fieldHtml;
      }

      // Handle Free Form questions
      const isTextarea = q.length === 'xl' || q.length === 'custom';
      const inputType = q.format === 'num' ? 'number' : 'text';

      // Get max length based on size
      const maxLengthMap = {
        's': 70,      // Small
        'm': 300,     // Medium
        'l': 1000,    // Large
        'xl': 5000    // X-Large
      };

      let minLength = 0;
      let maxLength;

      if (q.length === 'custom') {
        minLength = q.minLength || 0;
        maxLength = q.maxLength || 1000;
      } else {
        maxLength = maxLengthMap[q.length] || 300;
      }

      // Build the form field HTML with optional border for preview
      let fieldHtml = `
        <div style="${borderStyle} margin-bottom: 2rem; background-color: #fff;">
      `;

      // Add instructions if present (ABOVE the question label)
      if (q.instructions) {
        fieldHtml += `
          <div style="margin-bottom: 1.6rem;">
            <p style="margin: 0 0 0.4rem 0; font-weight: 700; font-size: 1.6rem;">Instructions</p>
            <p style="margin: 0; font-size: 1.6rem; color: #71767a;">${escapeHtml(q.instructions)}</p>
          </div>
        `;
      }

      // Add the question label
      fieldHtml += `
          <label class="usa-label" for="preview-field-${index}">
            ${escapeHtml(q.question)}
            ${isRequired ? '<span class="field-required">Required</span>' : ''}
          </label>
      `;

      // Add the input field with character counter
      const uniqueId = `preview-field-${index}`;
      const counterId = `counter-${index}`;

      if (isTextarea) {
        fieldHtml += `
          <textarea
            class="usa-textarea"
            id="${uniqueId}"
            name="${uniqueId}"
            minlength="${minLength}"
            maxlength="${maxLength}"
            rows="6"
            ${isRequired ? 'required' : ''}
            oninput="updateCharCounter('${uniqueId}', '${counterId}', ${maxLength})"
          ></textarea>
          <div id="${counterId}" class="character-counter">${maxLength} of ${maxLength} remaining</div>
        `;
      } else {
        fieldHtml += `
          <input
            class="usa-input"
            id="${uniqueId}"
            name="${uniqueId}"
            type="${inputType}"
            minlength="${minLength}"
            maxlength="${maxLength}"
            ${isRequired ? 'required' : ''}
            oninput="updateCharCounter('${uniqueId}', '${counterId}', ${maxLength})"
          />
          <div id="${counterId}" class="character-counter">${maxLength} of ${maxLength} remaining</div>
        `;
      }

      fieldHtml += `</div>`;

      return fieldHtml;
    }

    /**
     * Update character counter as user types
     */
    function updateCharCounter(fieldId, counterId, maxLength) {
      const field = document.getElementById(fieldId);
      const counter = document.getElementById(counterId);
      if (field && counter) {
        const remaining = maxLength - field.value.length;
        counter.textContent = `${remaining} of ${maxLength} remaining`;
      }
    }

    /**
     * Show preview page with questions in bordered format
     */
    function showPreviewPage(questions) {
      if (questions.length === 0) {
        alert('No questions to preview. Please build or import questions first.');
        return;
      }

      const mainContent = document.getElementById('mainBuilderContent');
      const previewContent = document.getElementById('previewPageContent');
      const previewQuestionsContainer = document.getElementById('previewPageQuestions');

      // Render all questions inside one bordered container
      const questionsHtml = questions.map((q, index) =>
        renderFormField(q, `preview-${index}`, false)
      ).join('');

      previewQuestionsContainer.innerHTML = `
        <div style="border: 1px solid #dfe1e2; border-radius: 0.5rem; padding: 2rem; background-color: #fff;">
          ${questionsHtml}
        </div>
      `;

      // Hide main content, show preview
      mainContent.style.display = 'none';
      previewContent.style.display = 'block';

      // Scroll to top
      window.scrollTo(0, 0);
    }

    /**
     * Hide preview page and return to builder
     */
    function hidePreviewPage() {
      const mainContent = document.getElementById('mainBuilderContent');
      const previewContent = document.getElementById('previewPageContent');

      mainContent.style.display = 'block';
      previewContent.style.display = 'none';

      // Scroll to top
      window.scrollTo(0, 0);
    }


    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
