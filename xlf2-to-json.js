import parser from 'xml2json';
import fs from 'fs';

const locales = ['fr-FR', 'es-ES', 'en-GB'];

for (const locale of locales) {
  const xml = fs.readFileSync(`translations/CapcoAppBundle.${locale}.xlf`, 'utf8');
  // Fix to add Sonata bundles
  fs.writeFileSync(`translations/SonataAdminBundle.${locale}.xlf`, xml);
  fs.writeFileSync(`translations/SonataMediaBundle.${locale}.xlf`, xml);
  fs.writeFileSync(`translations/SonataUserBundle.${locale}.xlf`, xml);
  fs.writeFileSync(`translations/SonataCoreBundle.${locale}.xlf`, xml);

  // Create JSON translations for JS
  const json = JSON.parse(parser.toJson(xml));
  let translations = {};
  if (Array.isArray(json.xliff.file.unit)) {
    translations = json.xliff.file.unit.reduce((acc, trad) => {
      acc[trad.segment.source] = trad.segment.target;
      return acc;
    }, {});
  }

  const bundlePath = `translations/messages.${locale}.json`;
  fs.writeFileSync(bundlePath, JSON.stringify(translations, null, 2));

  // Generate a file for test env without traduction
  if (locale === 'fr-FR') {
    let testTranslations = {};
    if (Array.isArray(json.xliff.file.unit)) {
      testTranslations = json.xliff.file.unit.reduce((acc, trad) => {
        acc[trad.segment.source] = trad.segment.source;
        return acc;
      }, {});
    }
    const bundlePath = `translations/messages.test.json`;
    fs.writeFileSync(bundlePath, JSON.stringify(testTranslations, null, 2));
  }
}
