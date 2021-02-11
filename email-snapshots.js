const playwright = require('playwright');
const fs = require('fs');
const path = require('path');
const parser = require('fast-xml-parser');

const snapshotsPath = './__snapshots__/emails/';
const translationsPath = './translations/';
const directoryPath = path.join(__dirname, snapshotsPath);

const appendVariables = (vars, json) => {
  let text = json.target;
  for (const i in vars) {
    text = text.replace(i, vars[i]);
  }
  return text;
};

const replaceWithVar = (text, jsonObj) => {
  return new Promise((resolve, reject) => {
    if (text.includes(jsonObj.source)) {
      const startIdx = text.indexOf(jsonObj.source) + jsonObj.source.length;
      if (text.substring(startIdx, startIdx + 3) === ' {"') {
        try {
          const vars = JSON.parse(text.substring(startIdx, 2 + text.indexOf('"}\n', startIdx)));
          text = text.replace(
            text.substring(text.indexOf(jsonObj.source), 2 + text.indexOf('"}\n', startIdx)),
            appendVariables(vars, jsonObj),
          );
        } catch (e) {
          console.log('Error in the translation key / In the variables. Keep going');
        }
      } else {
        text = text.replace(jsonObj.source, jsonObj.target);
      }
    }
    resolve(text);
  });
};

const applyTranslations = (text, locale) => {
  return new Promise((resolve, reject) => {
    text = text.replace(/&quot;/gi, '"');
    text = text.replace(/"}</gi, '"}\n<');
    fs.readFile(`${translationsPath}messages+intl-icu.${locale}.xlf`, 'utf8', async (err, data) => {
      const jsonObj = parser
        .parse(data)
        .xliff.file.body['trans-unit'].sort((a, b) => b.source.length - a.source.length);
      for (const i in jsonObj) {
        text = await replaceWithVar(text, jsonObj[i]);
      }
      text = text.replace(/&lt;/gi, '<');
      text = text.replace(/&gt;/gi, '>');
      resolve(text);
    });
  });
};

const readFile = file => {
  return new Promise((resolve, reject) => {
    if (!file.endsWith('.html')) {
      resolve(file);
      return;
    }
    console.log(`Opening file ${file}`);
    fs.readFile(`${snapshotsPath}${file}`, 'utf8', async (err, data) => {
      if (err) throw err;
      if (data.endsWith('"}')) {
        console.log(`File is not html`);
        resolve(file);
        return;
      }
      const browser = await playwright['chromium'].launch();
      const context = await browser.newContext();
      const page = await context.newPage();

      const translatedData = await applyTranslations(
        data,
        file.endsWith('English.html') ? 'en-GB' : 'fr-FR',
      );
      await page.setContent(translatedData);
      console.log(`Saving Web view for ${file}`);
      await page.screenshot({ path: `${snapshotsPath}${file}-web.png` });

      const pixel2 = playwright.devices['Pixel 2'];
      const mobileContext = await browser.newContext({
        ...pixel2,
      });
      const mobilePage = await mobileContext.newPage();
      await mobilePage.setContent(translatedData);
      console.log(`Saving Mobile view for ${file}`);
      await mobilePage.screenshot({ path: `${snapshotsPath}${file}-mobile.png` });
      console.log('\x1b[32m%s\x1b[0m', 'Done');
      await browser.close();
      resolve(file);
    });
  });
};

fs.readdir(directoryPath, async (err, files) => {
  if (err) {
    return console.log('\x1b[31m%s\x1b[0m', `Unable to scan directory: ${err}`);
  }

  for (const i in files) {
    await readFile(files[i]);
  }
  console.log('\x1b[32m%s\x1b[0m', 'Terminated');
});
