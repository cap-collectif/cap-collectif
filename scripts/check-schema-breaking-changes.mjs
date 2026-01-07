#!/usr/bin/env node
/**
 * Schema Breaking Changes Checker
 *
 * Compares GraphQL schemas between the current branch and a base branch
 * to detect breaking and dangerous changes.
 *
 * Usage: node scripts/check-schema-breaking-changes.mjs [base-branch]
 *
 * Exit codes:
 *   0 - No breaking changes (warnings are OK)
 *   1 - Breaking changes detected
 *   2 - Script error (git issues, invalid branch, etc.)
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { buildSchema, findBreakingChanges, findDangerousChanges } from 'graphql';

const SCHEMAS = ['public', 'preview', 'internal'];
const BASE_BRANCH = process.argv[2] || 'preprod';

const colors = {
    red: text => `\x1b[31m${text}\x1b[0m`,
    yellow: text => `\x1b[33m${text}\x1b[0m`,
    green: text => `\x1b[32m${text}\x1b[0m`,
    bold: text => `\x1b[1m${text}\x1b[0m`,
    dim: text => `\x1b[2m${text}\x1b[0m`,
};

/**
 * Validate and fetch base branch once at startup
 */
function fetchBaseBranch(baseBranch) {
    // Validate branch name (alphanumeric, dashes, underscores, slashes)
    if (!/^[\w\-/]+$/.test(baseBranch)) {
        console.error(colors.red(`Invalid branch name: ${baseBranch}`));
        process.exit(2);
    }

    try {
        execSync(`git fetch origin ${baseBranch}`, { stdio: 'pipe' });
        // Verify branch exists on origin
        execSync(`git rev-parse origin/${baseBranch}`, { stdio: 'pipe' });
    } catch (err) {
        console.error(colors.red(`Failed to fetch branch '${baseBranch}': ${err.message}`));
        process.exit(2);
    }
}

function getBaseSchema(schemaFile, baseBranch) {
    try {
        return execSync(`git show origin/${baseBranch}:${schemaFile}`, {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe'],
        });
    } catch {
        return null;
    }
}

function getCurrentSchema(schemaFile) {
    try {
        if (!existsSync(schemaFile)) {
            return null;
        }
        return readFileSync(schemaFile, 'utf8');
    } catch (err) {
        console.error(colors.red(`Failed to read ${schemaFile}: ${err.message}`));
        return null;
    }
}

function checkSchema(schemaName) {
    const schemaFile = `schema.${schemaName}.graphql`;
    console.log(`\n${colors.bold(`━━━ ${schemaFile} ━━━`)}`);

    const oldContent = getBaseSchema(schemaFile, BASE_BRANCH);
    if (!oldContent) {
        console.log(colors.dim(`  Skipped (not found in ${BASE_BRANCH})`));
        return { breaking: [], dangerous: [] };
    }

    const newContent = getCurrentSchema(schemaFile);
    if (!newContent) {
        console.log(colors.dim('  Skipped (not found in current branch)'));
        return { breaking: [], dangerous: [] };
    }

    try {
        const oldSchema = buildSchema(oldContent);
        const newSchema = buildSchema(newContent);

        const breaking = findBreakingChanges(oldSchema, newSchema);
        const dangerous = findDangerousChanges(oldSchema, newSchema);

        if (breaking.length === 0 && dangerous.length === 0) {
            console.log(colors.green('  ✓ No breaking or dangerous changes'));
            return { breaking: [], dangerous: [] };
        }

        if (breaking.length > 0) {
            console.log(colors.red(`\n  BREAKING CHANGES (${breaking.length}):`));
            breaking.forEach(c => console.log(colors.red(`    ✖ ${c.description}`)));
        }

        if (dangerous.length > 0) {
            console.log(colors.yellow(`\n  Dangerous changes (${dangerous.length}):`));
            dangerous.forEach(c => console.log(colors.yellow(`    ⚠ ${c.description}`)));
        }

        return { breaking, dangerous };
    } catch (err) {
        console.log(colors.red(`  Error parsing schema: ${err.message}`));
        return { breaking: [{ description: err.message }], dangerous: [] };
    }
}

// Main
console.log(colors.bold(`\nSchema Breaking Changes Check`));
console.log(colors.dim(`Comparing against: ${BASE_BRANCH}\n`));

// Fetch base branch once at the start
fetchBaseBranch(BASE_BRANCH);

let totalBreaking = 0;
let totalDangerous = 0;

for (const schema of SCHEMAS) {
    const { breaking, dangerous } = checkSchema(schema);
    totalBreaking += breaking.length;
    totalDangerous += dangerous.length;
}

console.log('\n' + '━'.repeat(50));

if (totalBreaking > 0) {
    console.log(colors.red(`\n✖ ${totalBreaking} breaking change(s) detected`));
    console.log(colors.red('  CI will fail - review required before merge\n'));
    process.exit(1);
}

if (totalDangerous > 0) {
    console.log(colors.yellow(`\n⚠ ${totalDangerous} dangerous change(s) detected (warnings only)`));
}

console.log(colors.green('\n✓ All schema changes are backwards compatible\n'));
process.exit(0);
