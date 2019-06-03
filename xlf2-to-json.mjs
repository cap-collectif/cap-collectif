import parser from 'xml2json';
import fs from 'fs';
import config from './webpack/config';

for (const locale of config.locales) {
    const xml = fs.readFileSync(`translations/CapcoAppBundle.${locale}.xlf`, 'utf8');
    // We duplicate file for each translation domain used
    fs.writeFileSync(`translations/SonataAdminBundle.${locale}.xlf`, xml);
    fs.writeFileSync(`translations/SonataMediaBundle.${locale}.xlf`, xml);
    fs.writeFileSync(`translations/SonataUserBundle.${locale}.xlf`, xml);
    fs.writeFileSync(`translations/SonataCoreBundle.${locale}.xlf`, xml);
    fs.writeFileSync(`translations/messages.${locale}.xlf`, xml);

    // Create JS locale files used to translate JavaScript using react-intl
    const json = JSON.parse(parser.toJson(xml));
    let translations = {};
    if (Array.isArray(json.xliff.file.unit)) {
        translations = json.xliff.file.unit.reduce((acc, trad) => {
            acc[trad.segment.source] = trad.segment.target;
            return acc;
        }, {});
    }

    const dir = 'web/js';
    const bundlePath = `${dir}/${locale}.js`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    fs.writeFileSync(bundlePath, `window.intl_messages=${JSON.stringify(translations, null, 2)};`);

    fs.writeFileSync(`${dir}/${locale}-es6.js`, `export default ${JSON.stringify(translations, null, 2)};`);
}
