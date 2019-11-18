import fs from 'fs';
import readline from 'readline';
import cp from 'child_process';
import Table from 'cli-table3';
import program from 'commander';
import chalk from 'chalk';


const map = new Map();
const unused = [];
const used = [];
const searchDirectories = ['./src', './app/Resources/js'];
const ignoreDirectories = ["\"*snapshot*\"", "\"*generated*\""];
const file = './web/js/fr-FR-es6.js';
const usedHeaders = ['Value', 'Keys', 'Count', 'PHP', 'Twig', 'JS', 'Files'];
const unusedHeaders = ['Value', 'Keys'];
const DEFAULT_MAX_SAME = 2;


program
    .option('-r, --rewrite', `rewrite using one key only for same values.\n By default, ${DEFAULT_MAX_SAME} is the number max of keys with same value.`)
    .option('-u, --max-unused <type>', 'number max of unused keys')
    .option('-k, --key <type>', 'specified a key to use for replacement')
    .option('-d, --debug <type>', 'Enable debug and print more logs')
    .option('-v, --value <type>', 'look for a specific value')
    .option('-s, --max-same <type>', 'number max of keys with same value')
;

program.parse(process.argv);

const rewriteFilePromise = function rewriteFile(path, keys, chosenKey = null) {
    var i;
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                return console.log(err);
            }
            if (chosenKey == null) {
                chosenKey = keys[0];
            }
            keys.forEach((key) => {
                if (key !== chosenKey) {
                    console.log(`Changing ${key} into ${chosenKey} in ${path}`);
                    const re = new RegExp(`'${key}'`, "g");
                    if (data.match(re)) {
                        const result = data.replace(re, `'${chosenKey}'`);
                        fs.writeFile(path, result, 'utf8', (success, error) => {
                            if (error) {
                                reject(error);
                            }
                        });
                        resolve();
                    }
                }
            });
            resolve();
        });
    });
};

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
                    newObject.count += 1;
                } else if (line.match(/.*php/)) {
                    newObject.php += 1;
                    newObject.count += 1;
                } else if (line.match(/.*js/)) {
                    newObject.js += 1;
                    newObject.count += 1;
                } else {
                    newObject.other += 1;
                    newObject.count += 1;
                }
                const path = line.slice(0, -1);
                files.push(path);
            }
        });
    }
    return newObject;
}

function addOrUpdateCountObject(value, key) {
    var newObject;
    var oldMap;
    var files = [];

    if (map.has(value)) {
        oldMap = map.get(value);

        oldMap.keys.push(key);
        newObject = {
            'keys': oldMap.keys,
            'count': oldMap.count,
            'value': value,
            'twig': oldMap.twig,
            'php': oldMap.php,
            'js': oldMap.js,
            'other': oldMap.other,
        };
        files = oldMap.files;
    } else {
        newObject = {
            'count': 0,
            'value': value,
            'keys': [key],
            'js': 0,
            'php': 0,
            'twig': 0,
            'other': 0,
        };
    }

    searchDirectories.forEach((dir) => {
        try {
            newObject = treatLines(cp.execSync(`ag -l "${key}" ${dir} --ignore={${ignoreDirectories.join(',')}}`).toString(), newObject, files);
        } catch (err) {
            // no match found
        }
    });

    newObject.files = files;

    map.set(value, newObject);
}

function printTable(titre, headers, data) {
    console.log(chalk.yellow(titre));
    const usedTable = new Table({
        head: headers,
        colWidths: titre === 'Used' ? [70, 40, 10, 10, 10, 10, 80] : [70, 40]
    });
    usedTable.push(...data);
    console.log(usedTable.toString());
}


const rl = readline.createInterface({
    input: fs.createReadStream(file),
    crlfDelay: Infinity
});


function replaceAll() {
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
            var hasError = 0;
            var hasTooMuchSame = 0;
            var promises = [];
            map.forEach((entry) => {
                if (entry.count === 0) {
                    unused.push([entry.value, entry.keys.join("\n")]);
                } else if (entry.count !== 1) {
                    if (program.maxSame != null || program.rewrite) {

                        if (program.maxSame && entry.keys.length >= program.maxSame ||
                            entry.keys.length >= DEFAULT_MAX_SAME) {
                            entry.files.forEach((path) => {
                                try {
                                    promises.push(rewriteFilePromise(path, entry.keys));
                                } catch (e) {
                                    console.log(`Exception: ${e}`)
                                }
                            });
                            hasTooMuchSame++;
                        }
                    }
                    used.push([entry.value, entry.keys.join("\n"), entry.count, entry.php, entry.twig, entry.js, entry.files.join("\n")]);
                }
            });
            if (program.rewrite) {
                console.log('Rewriting files...');
                Promise.all(promises).then(() => {
                    console.log('Done.');
                });

            } else {
                printTable('Used', usedHeaders, used);
                printTable('Unused', unusedHeaders, unused);
                if (program.maxSame != null && program.maxSame <= hasTooMuchSame) {
                    console.log(`Too many keys with same values: ${hasTooMuchSame} >= ${program.maxSame}`);
                    hasError++;
                }
                if (program.maxUnused != null && program.maxUnused <= unused.length) {
                    console.log(`Too many unused keys: ${unused.length} >= ${program.maxUnused}`);
                    hasError++;
                }
                process.exit(hasError);
            }
        });
}

function findByValue(searchValue) {
    const keyFiles = new Map();
    var value;
    var key;
    var i;

    return new Promise((resolve) => {
        rl.on('line', (line) => {
            if (line != null) {
                key = line.match(/".*":/g);
                value = line.match(/: ?".*"/g);

                if (value && key) {
                    value = value[0].substring(3, value[0].length - 1);
                    key = key[0].substring(1, key[0].length - 2);
                    if (program.debug) {
                        console.log(`Comparing ${value} ${searchValue}`);
                    }
                    if (value === searchValue) {
                        searchDirectories.forEach((dir) => {

                            try {
                                const stdout = cp.execSync(`ag -l "${key}" ${dir} --ignore={${ignoreDirectories.join(',')}}`).toString();
                                if (stdout == null) {
                                    return null;
                                }
                                const lines = stdout.match(/^.*([\n\r]+|$)/gm).filter(Boolean);
                                if (lines.length > 0) {
                                    keyFiles.set(key, [lines[0].slice(0, -1)]);
                                    for (i = 1; i < lines.length; i++) {
                                        const keyFileMap = keyFiles.get(key);
                                        keyFileMap.push(lines[i].slice(0, -1));
                                        keyFiles.set(key, keyFileMap);
                                    }
                                }
                            } catch (err) {
                                // no match found
                            }
                        });

                    }
                }
            }
        })
            .on('close', () => {
                console.log(keyFiles);
                resolve(keyFiles);
            });
    });
}

function replaceWithSpecificKey(value, key) {
    console.log('Looking for keys with same value...');
    findByValue(value).then((keyFiles) => {
        const promises = [];
        console.log('Replacing...');
        const keys = Array.from(keyFiles.keys());
        keyFiles.forEach((v, k) => {
            if (k !== key) {
                keyFiles.get(k).forEach((path) => {
                    promises.push(rewriteFilePromise(path, keys, key));
                });
            }
        });
        Promise.all(promises).then(() => {
            console.log('Done.');
        });
    });
}

function main() {
    if (program.key && program.value) {
        replaceWithSpecificKey(program.value, program.key);
    } else if (program.value) {
        findByValue(program.value);
    } else {
        replaceAll();
    }
}

main();


