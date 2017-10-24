import parser from 'xml2json';
import fs from 'fs';

const locales = ['fr-FR', 'es-ES', 'en-GB'];

for (const locale of locales) {
  const xml = fs.readFileSync(`translations/CapcoAppBundle.${locale}.xlf`, 'utf8');
  // We duplicate file for each translation domain used
  fs.writeFileSync(`translations/SonataAdminBundle.${locale}.xlf`, xml);
  fs.writeFileSync(`translations/SonataMediaBundle.${locale}.xlf`, xml);
  fs.writeFileSync(`translations/SonataUserBundle.${locale}.xlf`, xml);
  fs.writeFileSync(`translations/SonataCoreBundle.${locale}.xlf`, xml);

  // Create messages.{locale}.json used to translate JavaScript using react-intl
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
}
