import fs from 'fs';
import cp from 'child_process';

const locoKey = 'Kh235TDAO5xH5bGdOkrrXrmajHjPXhPG';
for (const locale of ['fr-FR', 'es-ES', 'en-GB', 'de-DE', 'nl-NL']) {
    const assetCommand = `curl "https://localise.biz:443/api/export/locale/${locale}.xlf?format=symfony&no-comments=true&key=${locoKey}"`;
    console.log(assetCommand);
    const xlf = cp.execSync(assetCommand).toString();
    // // We duplicate file for each translation domain used
    fs.writeFileSync(`translations/CapcoAppBundle.${locale}.xlf`, xlf);
    fs.writeFileSync(`translations/SonataAdminBundle.${locale}.xlf`, xlf);
    fs.writeFileSync(`translations/SonataMediaBundle.${locale}.xlf`, xlf);
    fs.writeFileSync(`translations/SonataUserBundle.${locale}.xlf`, xlf);
    fs.writeFileSync(`translations/SonataCoreBundle.${locale}.xlf`, xlf);
    fs.writeFileSync(`translations/messages.${locale}.xlf`, xlf);

    const dir = 'web/js';
    const bundlePath = `${dir}/${locale}.js`;
    const assetJsCommand = `curl "https://localise.biz:443/api/export/locale/${locale}.json?&no-folding=true&no-comments=true&key=${locoKey}"`;
    console.log(assetJsCommand);
    const jsonObject = JSON.parse(cp.execSync(assetJsCommand).toString());

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    fs.writeFileSync(bundlePath, `window.intl_messages=${JSON.stringify(jsonObject, null, 2)};`);

    fs.writeFileSync(
        `${dir}/${locale}-es6.js`,
        `export default ${JSON.stringify(jsonObject, null, 2)};`,
    );
}
