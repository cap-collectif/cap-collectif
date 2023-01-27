import fs from 'fs';
import fetch from 'node-fetch';
import chalk from 'chalk';

// This key provides read-only access to our translations.
// It's suitable for deployment scripts and sharing download links with colleagues.
// So we can keep it here.
const LOCO_READ_ONLY_KEY = 'UdTAAZySXEx3EYrJfvD8byxPgOX76Vvf';

const locales = ['fr-FR', 'es-ES', 'en-GB', 'de-DE', 'nl-NL', 'sv-SE', 'eu-EU', 'oc-OC', 'ur-IN'];
const domains = [
    'CapcoAppBundle',
    'SonataAdminBundle',
    'messages',
];

async function main() {
    for (const locale of locales) {
        console.log(`[${chalk.green(locale)}]: Downloading up to date xlf and JSON files…`);

        await fetch(
            `https://localise.biz:443/api/export/locale/${locale}.xlf?format=symfony&no-comments=true&key=${LOCO_READ_ONLY_KEY}`,
        ).then(res => {
            for (const domain of domains) {
                const xlf = fs.createWriteStream(`translations/${domain}+intl-icu.${locale}.xlf`);
                res.body.pipe(xlf);
            }
        });

        await fetch(
            `https://localise.biz:443/api/export/locale/${locale}.json?&no-folding=true&no-comments=true&key=${LOCO_READ_ONLY_KEY}`,
        )
            .then(res => res.json())
            .then(json => {
                const dir = 'public/js';
                const bundlePath = `${dir}/${locale}.js`;
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                const messages = JSON.stringify(json, null, 2);
                fs.writeFileSync(`translations/${locale}.json`, messages);
                fs.writeFileSync(bundlePath, `window.intl_messages=${messages};`);
                fs.writeFileSync(`${dir}/${locale}-es6.js`, `export default ${messages};`);
            });
    }
}
main();
