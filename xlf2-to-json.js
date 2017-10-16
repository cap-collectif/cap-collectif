import parser from 'xml2json';
import fs from 'fs';

for (const locale of ['fr-FR', 'es-SP', 'en-GB']) {
  const xml = fs.readFileSync(`translations/CapcoAppBundle.${locale}.xlf`, 'utf8');
  const json = JSON.parse(parser.toJson(xml));

  const translations = json.xliff.file.unit.reduce((acc, trad) => {
    acc[trad.segment.source] = trad.segment.target;
    return acc;
  }, {});

  const bundlePath = `translations/messages.${locale}.json`;
  fs.writeFileSync(bundlePath, JSON.stringify(translations, null, 2));
}
