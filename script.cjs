const fs = require('fs');
const HTMLtoDOCX = require('html-to-docx');
const path = 'C:/Users/bhuva/.gemini/antigravity/brain/0db71d27-50ef-44bc-bbde-c3f11f22bbe7/original_paper_with_screenshots.html';
const outPath = 'C:/Users/bhuva/.gemini/antigravity/brain/0db71d27-50ef-44bc-bbde-c3f11f22bbe7/SmartParking_Paper.docx';

const htmlString = fs.readFileSync(path, 'utf-8');

(async () => {
  const fileBuffer = await HTMLtoDOCX(htmlString, null, {
    table: { row: { cantSplit: true } },
    footer: true,
    pageNumber: true,
  });
  fs.writeFileSync(outPath, fileBuffer);
  console.log('DOCX generated successfully');
})();
