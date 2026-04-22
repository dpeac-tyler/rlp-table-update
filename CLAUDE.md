This project is for rapid HTML/CSS prototypes based on the RLP agency dashboard.

Important context:
- The visual language should match the existing live RLP product.
- The UI uses a custom USWDS-based design system.
- Reuse existing classes, structure, and patterns whenever possible.
- Do not invent a new design style.
- Prefer simple static HTML prototypes over complex frameworks.
- Keep files easy for a non-developer to understand.
- Avoid unnecessary JavaScript unless explicitly needed.
- Prioritize visual similarity and speed over technical perfection.

Working style:
- Explain changes simply.
- Keep edits small and safe.
- When adding code, say which file changed.
- Do not refactor everything unless asked.

## Question Builder - Table Questions

The question builder (`create-questions.html` + `js/question-builder.js`) supports creating Table questions with various column formats.

### Table Column Formats (Alphabetical):
- **Alpha Numeric** - Text input field
- **Date Field** - Date picker input
- **Document** - Upload button that opens file upload modal
- **Numeric** - Number input field

### Document Upload Feature
When a column format is set to "Document", the table preview shows an "Upload" button instead of a text input. Clicking this button opens a modal with:
- Field name label (shows column header)
- File name input (auto-populates when file selected)
- File browser (50 MB max, types: txt, csv, png, jpg, jpeg, pdf, doc, xls, docx, xlsx)
- Document notes textarea (100 char max)
- Save/Cancel buttons

File validation happens on submit with alerts for size/type violations.

### Key Files:
- `create-questions.html` - Question builder form UI
- `js/question-builder.js` - Question building logic, preview rendering, edit handlers
- `review-questions.html` - Question list and preview functionality with document upload modal
- `css/styles.css` - Shared styling including modal styles

### Local Development:
Run `npm run dev` to start Vite dev server at http://localhost:5173/
Changes auto-reload via hot module replacement.