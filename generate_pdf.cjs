const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    const filePath = 'file:///C:/Users/bhuva/.gemini/antigravity/brain/0db71d27-50ef-44bc-bbde-c3f11f22bbe7/original_paper_with_screenshots.html';
    
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: 'C:/Users/bhuva/.gemini/antigravity/brain/0db71d27-50ef-44bc-bbde-c3f11f22bbe7/SmartParking_Paper.pdf',
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
        right: '0.75in'
      }
    });

    await browser.close();
    console.log('PDF generated successfully');
  } catch (err) {
    console.error('Error generating PDF:', err);
    process.exit(1);
  }
})();
