const express = require("express");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
// const fs = require("fs");
// const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).send("URL parameter is missing");
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    } catch (gotoError) {
      console.error("Error navigating to URL:", gotoError);
      await browser.close();
      return res.status(500).send("Failed to navigate to the URL");
    }

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "1cm",
        bottom: "1cm",
        left: "1cm",
        right: "1cm",
      },
    });

    await browser.close();

    //fs.writeFileSync(path.join(__dirname, 'test.pdf'), pdfBuffer);

    console.log(`PDF Buffer size: ${pdfBuffer.length}`);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=generated.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);

  } catch (error) {
    console.error("Overall error:", error);
    res.status(500).send("An error occurred");
  }
});

app.get("/download", async (req, res) => {
    try {
      const url = req.query.url;
  
      if (!url) {
        return res.status(400).send("URL parameter is missing");
      }
  
      const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
  
      const page = await browser.newPage();
  
      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      } catch (gotoError) {
        console.error("Error navigating to URL:", gotoError);
        await browser.close();
        return res.status(500).send("Failed to navigate to the URL");
      }
  
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "1cm",
          bottom: "1cm",
          left: "1cm",
          right: "1cm",
        },
      });
  
      await browser.close();
  
      //fs.writeFileSync(path.join(__dirname, 'test.pdf'), pdfBuffer);
  
      console.log(`PDF Buffer size: ${pdfBuffer.length}`);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=generated.pdf',
        'Content-Length': pdfBuffer.length,
      });
      res.end(pdfBuffer);

    } catch (error) {
      console.error("Overall error:", error);
      res.status(500).send("An error occurred");
    }
  });

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});