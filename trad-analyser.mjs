import fs from 'fs';
import readline from 'readline';
import cp from 'child_process';

const map = new Map();
const unusedMap = new Map();
const usedMap = new Map();
const searchDirectories = ['./src', './app/Resources/js'];
const file = './web/js/fr-FR-es6.js';

function insertIntoOrderedMap(entry) {
    if (usedMap.has(entry.count)) {
        usedMap.set(entry.count, usedMap.get(entry.count).concat([entry]));
    } else {
        usedMap.set(entry.count, [entry]);
    }
}

function treatLines(stdout, newObject, files) {
    if (stdout == null) {
        return null;
    }
    const lines = stdout.match(/^.*([\n\r]+|$)/gm).filter(Boolean);
    if (lines.length > 0) {
        lines.forEach((line) => {
            if (line != null) {
                if (line.match(/.*twig/)) {
                    newObject.twig += 1;
                } else if (line.match(/.*php/)) {
                    newObject.php += 1;
                } else if (line.match(/.*js/)) {
                    newObject.js += 1;
                } else {
                    newObject.other += 1;
                }
                files.push(line.slice(0, -1));
            }
        });
    }
    return newObject;
}

function addOrUpdateCountObject(value, key) {
    var newObject;
    var files = [];

    if (map.has(value)) {
        const oldMap = map.get(value);

        oldMap.keys.push(key);
        newObject = {
            'keys': oldMap.keys,
            'count': oldMap.count + 1,
            'twig': oldMap.twig,
            'php': oldMap.php,
            'js': oldMap.js,
            'other': oldMap.other,
        };
        files = oldMap.files;
    } else {
        newObject = {
            'count': 1,
            'keys': [key],
            'js': 0,
            'php': 0,
            'twig': 0,
            'other': 0,
        };
    }

    searchDirectories.forEach((dir) => {
        try {
            newObject = treatLines(cp.execSync(`ag -l "${key}" ${dir} --ignore={"*snapshot*","*generated*"}`).toString(), newObject, files);
        } catch (err) {
            // no match found
        }
    });

    newObject.files = files;

    map.set(value, newObject);
}


const rl = readline.createInterface({
    input: fs.createReadStream(file),
    crlfDelay: Infinity
});


var value;
var key;

rl.on('line', (line) => {
    if (line != null) {
        key = line.match(/".*":/g);
        value = line.match(/: ?".*"/g);

        if (value && key) {
            value = value[0].substring(3, value[0].length - 1);
            key = key[0].substring(1, key[0].length - 2);
            addOrUpdateCountObject(value, key);
        }
    }


})
    .on('close', () => {
        map.forEach((entry) => {
            if (entry.count === 0) {
                unusedMap.push(entry);
            } else if (entry.count !== 1) {
                insertIntoOrderedMap(entry);
            }
        });

        console.log('Used');

        usedMap.forEach((item, itemKey) => {
            console.log(`${itemKey} occurrences`, item);
        });

        console.log("\nUnused\n");

        unusedMap.forEach((item, itemKey) => {
            console.log(`${itemKey} occurrences`, item);
        });
    });

