# Backend debt audit and priority plan

Audited 10 September 2026 at commit `a57220a707`. Scope: production Composer dependencies, runtime definitions, GraphQL configuration, authentication, exports, queues, static analysis and backend test infrastructure. This is an audit and proposed backlog, not an implementation.

Start with dependency security patches and recoverable exports. Then update unsupported runtimes and remove the dependencies that block framework upgrades. Keep the existing Symfony application and migrate incrementally.

The container audit reported **50 advisories across 14 production packages: 1 critical, 14 high, 23 medium, 10 low and 2 without severity**. These are package advisory matches, not 50 demonstrated application exploits. Composer also reported 15 abandoned production packages, including transitive packages.

Priority is an engineering judgment, not CVSS. P0 means investigate and contain immediately; P1 means the next delivery cycle; P2 means planned modernization; P3 means opportunistic cleanup. Scores rate urgency and impact from 1 to 10. Effort estimates are engineer-days including focused verification, exclude rollout waiting time, and require refinement after dependency resolution and production inventory. Rows overlap and should not be summed as independent projects.

| Rank | Work | Priority / criticality | Rating | Rough effort |
| --- | --- | --- | --- | --- |
| 1 | Patch production dependency advisories, starting with Twig, GraphQL and SSO | P0 / critical triage | 10/10 | 1–2 days triage; 5–15+ days remediation |
| 2 | Make failed exports retryable and recoverable | P1 / high | 9/10 | 2–4 days |
| 3 | Move PHP 8.1 to a supported runtime | P1 / high | 9/10 | 5–15 days after blockers |
| 4 | Enforce GraphQL execution budgets | P1 / high | 8/10 | 3–5 days |
| 5 | Move Elasticsearch 7.17 to a supported line | P1 / high | 8/10 | 10–20 days plus rollout |
| 6 | Run dependency security checks before merge | P1 / high | 8/10 | 1–2 days |
| 7 | Replace Swiftmailer and custom legacy transports | P2 / medium | 7/10 | 5–10 days |
| 8 | Modernize Symfony security and reach Symfony 7.4 LTS | P2 / medium | 7/10 | 15–30+ days after blockers |
| 9 | Upgrade Doctrine and remove old persistence APIs | P2 / medium | 6/10 | 10–20 days |
| 10 | Finish Swarrot to Messenger migration | P2 / medium | 6/10 | 10–20+ days, queue by queue |
| 11 | Reduce analysis suppressions and consolidate legacy tests | P2 / medium | 6/10 | 2–3 days to establish policy, then incremental |
| 12 | Replace abandoned export/provider packages; retire unused schemas | P3 / low to medium | 4/10 | 3–8 days per bounded slice |

1. **Patch dependency security first.** See the P0 investigation below for confirmed blockers, exposure distinctions and the revised patch batches. The lockfile contains Twig 2.16.1, Guzzle 7.3.0, graphql-php 14.11.10, SimpleSAMLphp 1.19.8 and SAML2 4.17.0. Twig's critical advisory concerns PHP code injection through a crafted template, and requires checking who can supply template source. Do not treat ordinary template variables as equivalent to template source. The [maintainer advisory](https://symfony.com/cve-2026-46633) fixes that issue in 3.26.0; select a release that clears *all* current advisories. Replace `twig/extensions` and the registered legacy extension services when moving to Twig 3. Patch Symfony components within 5.4 immediately where possible. Upgrade the GraphQL parser and its compatible Overblog bundle together. Trace SAML binding and IdP configuration against the SSO advisories. Replace abandoned `jasig/phpcas` with its declared successor `apereo/phpcas`, preserving the existing certificate verification in production. First acceptance gate: critical/high matches resolved or individually documented with an owner, exposure evidence and expiry; verify SSO login/logout, template rendering and representative GraphQL operations. Remaining lower-severity matches stay on the backlog.

   Evidence: [composer.json](/Users/alextea/Web/cap-collectif/platform/composer.json:15); [config/packages/twig.yaml](/Users/alextea/Web/cap-collectif/platform/config/packages/twig.yaml:95); [src/Capco/UserBundle/Handler/CasHandler.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/UserBundle/Handler/CasHandler.php:35); full advisory snapshot below. Reachability is unverified.

2. **Fix export failure handling before migrating more queues.** `ExportOnDemandManager` dispatches the export after a synchronous timeout. The asynchronous handler logs and returns when the process throws, exits unsuccessfully or produces no file. Messenger sees a normal return, so the configured retries do not run for these failures. The email handler similarly logs failed recipients and returns. The async transport has three retries but no repository-configured failure transport. Throw on retryable failures, route exhausted messages to a retained failure queue using the existing broker, and define an operator replay procedure. Bound process execution using observed export durations. Acceptance: a deliberately failed export retries, exhausted work is inspectable and replayable, and successful work produces a valid file and notification. Review duplicate processing and partial-file handling before enabling replay. This finding follows directly from source; it was not reproduced against a live worker. [Messenger failure handling](https://symfony.com/doc/5.x/messenger.html#saving-retrying-failed-messages).

   Evidence: [src/Capco/AppBundle/Service/ExportOnDemandManager.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/AppBundle/Service/ExportOnDemandManager.php:33); [src/Capco/AppBundle/MessageHandler/ExportOnDemandMessageHandler.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/AppBundle/MessageHandler/ExportOnDemandMessageHandler.php:46); [src/Capco/AppBundle/MessageHandler/ExportReadyEmailMessageHandler.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/AppBundle/MessageHandler/ExportReadyEmailMessageHandler.php:59); [config/packages/messenger.yaml](/Users/alextea/Web/cap-collectif/platform/config/packages/messenger.yaml:1).

3. **Update PHP independently of the major framework migration.** Both application Dockerfiles specify PHP 8.1, Composer resolves against 8.1, and the local container reports PHP 8.1.34. PHP 8.1's upstream support ended in December 2025. Target PHP 8.4 or 8.5 after a compatibility check; prefer 8.5 if the required packages and extensions support it. A distributor backport contract could change immediate exposure but was not established here. Update images, Composer platform settings, CI and worker runtimes together. Acceptance: application boot, backend/API tests, login and worker smoke tests on the same runtime, with a tested image rollback. [PHP lifecycle](https://www.php.net/eol.php), [supported versions](https://www.php.net/supported-versions.php).

   Evidence: [infrastructure/services/remote/Dockerfile](/Users/alextea/Web/cap-collectif/platform/infrastructure/services/remote/Dockerfile:3); [composer.json](/Users/alextea/Web/cap-collectif/platform/composer.json:15).

4. **Set GraphQL execution budgets.** Query depth and complexity are explicitly disabled. The shared forward-connection argument builder supplies a default of 100, which is not a maximum. Anonymous GraphQL access is configured. Enable limits based on observed legitimate queries and enforce page-size bounds at shared request/resolver boundaries. Preserve intentional count-only calls using `first: 0` and account for server-side export queries. Parser/validation advisories need dependency patches too; execution complexity limits do not replace them. Acceptance: existing frontend and API queries pass; over-budget depth, alias breadth and page-size requests are rejected before expensive resolver work. Actual production rate limits, resolver-specific caps and denial-of-service impact were not measured.

   Evidence: [config/packages/graphql.yaml](/Users/alextea/Web/cap-collectif/platform/config/packages/graphql.yaml:18); [src/Capco/AppBundle/GraphQL/Args/RelayForwardConnection.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/AppBundle/GraphQL/Args/RelayForwardConnection.php:11); [config/packages/security.yaml](/Users/alextea/Web/cap-collectif/platform/config/packages/security.yaml:58).

5. **Upgrade Elasticsearch with a migration rehearsal.** The repository image is 7.17.27 and Elastica is constrained to major 7. Elastic ended 7.17 support on 15 January 2026. Inventory the deployed cluster first, then choose a supported destination and compatible Elastica version using the vendor's required intermediate upgrade path. Rehearse with restored data; compare mappings, search results, aggregations and indexation. Acceptance: restore tested, result parity checked and alias cutover/rollback rehearsed. No evidence here justifies replacing Elasticsearch with a different search product. [Elastic lifecycle](https://www.elastic.co/support/eol), [upgrade guidance](https://www.elastic.co/docs/deploy-manage/upgrade/deployment-or-cluster/upgrade-717).

   Evidence: [infrastructure/services/elasticsearch/Dockerfile](/Users/alextea/Web/cap-collectif/platform/infrastructure/services/elasticsearch/Dockerfile:1); [composer.json](/Users/alextea/Web/cap-collectif/platform/composer.json:15).

6. **Move the existing security check earlier.** CircleCI already defines Symfony security checks and Composer audit, but `security-php` runs only on `preprod`. The monthly dependency issue workflow explicitly covers JavaScript. Run the production lockfile audit on PRs as well, initially preventing new critical/high exposure while the existing backlog is cleared. Assign backend patch ownership and response times. Reuse the existing job; no new scanner is needed. Acceptance: a PR introducing a known vulnerable dependency fails before merge. Whether this job is a required repository check was not inspected.

   Evidence: [.circleci/config.yml](/Users/alextea/Web/cap-collectif/platform/.circleci/config.yml:1202); [.github/workflows/monthly-security-issue.yml](/Users/alextea/Web/cap-collectif/platform/.github/workflows/monthly-security-issue.yml:21).

7. **Replace Swiftmailer with Symfony Mailer.** Swiftmailer 6.3.0 and its Symfony bundle are abandoned. The code includes custom Mandrill transport and fallback transport behavior, so this is more than a package rename. Preserve sender selection, provider fallback, attachments, locale and failed-recipient handling behind the existing mail boundary. Acceptance: representative transactional messages render and send through each supported provider, failures propagate to retry handling, and no `Swift_*` production references remain. [Swiftmailer end of maintenance](https://symfony.com/blog/the-end-of-swiftmailer).

   Evidence: [src/Capco/AppBundle/Mailer/Transport/MandrillTransport.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/AppBundle/Mailer/Transport/MandrillTransport.php:19); [src/Capco/AppBundle/MessageHandler/ExportReadyEmailMessageHandler.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/AppBundle/MessageHandler/ExportReadyEmailMessageHandler.php:59); [composer.json](/Users/alextea/Web/cap-collectif/platform/composer.json:15).

8. **Modernize framework integration in stages.** Symfony packages are pinned to 5.4; authentication uses Guard, `anonymous` and `encoders`, with FOSUserBundle/HWI integrations. Patch 5.4 first, remove deprecated integrations, use 6.4 as a migration checkpoint, and target 7.4 LTS. Replace Guard with Symfony authenticators and encoders with password hashers. Keep password hashes, sessions, remember-me behavior and public API tokens compatible. Do not bundle wholesale user-model or Sonata replacement into this work. Symfony 5.4 still has security support until February 2029, while bug fixes ended in November 2024. That makes this planned modernization rather than the main security emergency. Acceptance: login, logout, SSO, password reset, API keys and role checks pass across the transition. [Symfony 5.4 support](https://symfony.com/releases/5.4), [7.4 LTS](https://symfony.com/releases/7.4).

   Evidence: [config/packages/security.yaml](/Users/alextea/Web/cap-collectif/platform/config/packages/security.yaml:58); [composer.json](/Users/alextea/Web/cap-collectif/platform/composer.json:15).

9. **Upgrade Doctrine through compatible checkpoints.** The lockfile has ORM 2.10.0 and DBAL 2.13.9, with annotations/cache dependencies and older statement APIs still used. First update within compatible lines and remove deprecated API calls, then resolve the supported ORM/DBAL target against the chosen Symfony/Sonata versions. Migrate mapping metadata only where required by that target. Acceptance: no unintended schema diff, fixture loading and migrations pass, and representative write/export transactions preserve results. This is upgrade friction and maintenance debt, not a demonstrated data-corruption bug.

   Evidence: [composer.json](/Users/alextea/Web/cap-collectif/platform/composer.json:15); [src/Capco/UserBundle/Repository/UserRepository.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/UserBundle/Repository/UserRepository.php:1451); [src/Capco/AppBundle/Entity/Proposal.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/AppBundle/Entity/Proposal.php:58).

10. **Converge on Messenger without changing the broker.** There are 56 PHP files in `Processor`, five message classes and five handler files, with only three message classes explicitly routed async in Messenger configuration. These counts describe implementation inventory, not traffic or percentage migrated. Migrate one message family at a time after failure recovery is sound. Keep payload compatibility during deployment, drain old queues, then remove that family's Swarrot config and worker. Acceptance per family: retries, duplicate delivery and failure replay pass; old queue is empty and no producer uses it. A full migration estimate needs queue usage and ownership data.

   Evidence: [config/packages/swarrot.yaml](/Users/alextea/Web/cap-collectif/platform/config/packages/swarrot.yaml:1); [config/packages/messenger.yaml](/Users/alextea/Web/cap-collectif/platform/config/packages/messenger.yaml:1).

11. **Make the existing quality checks more useful.** PHPStan is already level 7, but its committed baseline has 8,551 entries covering 9,315 suppressed occurrences; unmatched ignored errors are not reported. Those are baseline counts, not a fresh run or a count of confirmed bugs. There are 103 PHP files under tests and 242 under spec, not a coverage ratio. Prevent baseline growth, remove stale suppressions after a measured run, and fix warnings in code touched by the other work. Write new backend checks in PHPUnit. Migrate PHPSpec/Behat only when behavior is being changed, preserving backend scenarios rather than moving all of them into browser tests. Acceptance: no new suppressions for migrated code and equivalent scenario coverage before deleting a legacy suite. The frontend-test ADR already calls for cleaning up suite configuration and CI together.

   Evidence: [phpstan.neon](/Users/alextea/Web/cap-collectif/platform/phpstan.neon:21); [phpstan-baseline.neon](/Users/alextea/Web/cap-collectif/platform/phpstan-baseline.neon:1); [ADR/001-frontend_tests.md](/Users/alextea/Web/cap-collectif/platform/ADR/001-frontend_tests.md:1).

12. **Replace smaller abandoned integrations and remove proven-unused code.** Box/Spout is used across import/export paths. Keep the existing writer boundary and migrate to a maintained compatible [OpenSpout](https://github.com/openspout/openspout) release; use native CSV functions only for isolated CSV-only cases. Preserve XLSX/ODS capabilities. The P0 investigation below promotes Sendinblue SDK replacement into security remediation because its Guzzle upper bound blocks security updates. Four GraphQL schemas are still configured. Retire public/preview/dev only after identifying consumers and deployment uses, with a deprecation window where required. Acceptance: file-format compatibility and provider contract checks pass; no remaining consumer or build depends on a retired schema. These are separate small tickets, not one cleanup PR.

   Evidence: [src/Capco/AppBundle/Command/WriterFactory.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/AppBundle/Command/WriterFactory.php:20); [composer.json](/Users/alextea/Web/cap-collectif/platform/composer.json:15); [config/packages/graphql.yaml](/Users/alextea/Web/cap-collectif/platform/config/packages/graphql.yaml:18).

Suggested delivery sequence:

| Window | Deliverable | Owner role | Exit gate |
| --- | --- | --- | --- |
| First 48 hours | Triage critical/high advisories, confirm deployed versions, identify Twig/SSO exposure, open bounded patch PRs | Backend lead + operations | Exposure decisions and owners recorded; feasible patches ready |
| First two weeks | Patch compatible dependencies, repair export failure handling, enable PR security checks, establish GraphQL budgets | Backend team | Focused regression checks pass; failed exports recoverable; new vulnerable dependencies blocked |
| Following 2–6 weeks | Upgrade PHP; rehearse search upgrade separately; remove Twig/mail/auth compatibility blockers | Backend + operations | Supported runtime deployed; search parity and rollback proven |
| Following 6–12+ weeks | Stage framework/Doctrine upgrades, migrate queue families and affected tests | Backend team | Each migration passes its own exit gate before the next |

These are scheduling bands, not a promise to finish every workstream in twelve weeks. Security-sensitive SSO/Twig upgrades may pull prerequisite work forward. Re-estimate after the first dependency-resolution spike. Baseline cleanup should accompany each phase.

Do not prioritize a framework rewrite, microservices, a broker replacement, blanket entity/repository splitting, or wholesale test conversion. Large files identify places to inspect, not defects by themselves. The 2,430-line UserRepository and 1,866-line proposal CSV command warrant focused changes when they block the work above.

Verification and limits:

- Ran `docker exec -w /var/www capco_application_1 composer audit --locked --no-dev --format=json` and inspected every package result.
- Verified identical host/container lockfile SHA-256: `490b7ce6d16aed0626c40253848829852254e80a3b392bf206bf5094e81e13b8`.
- Ran container PHP version inspection, source/configuration searches and file/baseline inventory. Traced export dispatch into both async handlers.
- Checked current vendor lifecycle pages and the critical Twig advisory. No application code, dependency or service configuration was changed.
- Did not run the application test suites, exploit requests, load tests, Composer update simulation or a production inventory. No production incident or actual exploitability is claimed.
- Production MySQL/Redis/RabbitMQ versions, backup recovery, traffic, queue metrics, query plans and CI timings remain unverified. Those need operational evidence before additional replacement recommendations.

Dependency advisory snapshot follows. It is time-sensitive; rerun Composer audit before implementing.

| Production package | Locked version | Advisory matches | Highest reported severity |
| --- | --- | --- | --- |
| firebase/php-jwt | v6.11.0 | 1 | low |
| guzzlehttp/guzzle | 7.3.0 | 14 | high |
| guzzlehttp/psr7 | 2.6.2 | 4 | medium |
| nesbot/carbon | 2.72.5 | 1 | medium |
| simplesamlphp/saml2 | v4.17.0 | 2 | high |
| simplesamlphp/simplesamlphp | 1.19.8 | 1 | high |
| symfony/cache | v5.4.46 | 1 | medium |
| symfony/dom-crawler | v5.4.48 | 1 | low |
| symfony/http-client | v5.4.49 | 1 | medium |
| symfony/process | v5.4.47 | 1 | medium |
| symfony/routing | v5.4.48 | 2 | medium |
| symfony/yaml | v5.4.45 | 3 | low |
| twig/twig | v2.16.1 | 15 | critical |
| webonyx/graphql-php | v14.11.10 | 3 | high |

Advisory references returned by Composer:

- `firebase/php-jwt`: [CVE-2025-45769](https://github.com/advisories/GHSA-2x45-7fc3-mxwq), low. php-jwt contains weak encryption
- `guzzlehttp/guzzle`: [CVE-2026-69246](https://github.com/advisories/GHSA-v5mv-p594-2x33), high. Guzzle: Noncanonical host can bypass host-based checks
- `guzzlehttp/guzzle`: [CVE-2026-69245](https://github.com/advisories/GHSA-f7vp-7xgx-4w4r), medium. Guzzle: Noncanonical cookie domain keeps subdomain scope
- `guzzlehttp/guzzle`: [CVE-2026-67354](https://github.com/advisories/GHSA-h95v-h523-3mw8), medium. Guzzle: URI fragments disclosed in redirect Referer headers
- `guzzlehttp/guzzle`: [CVE-2026-67355](https://github.com/advisories/GHSA-wm3w-8rrp-j577), medium. Guzzle: Host-only cookie scope is not preserved
- `guzzlehttp/guzzle`: [CVE-2026-67353](https://github.com/advisories/GHSA-f283-ghqc-fg79), medium. Guzzle: Unbounded response cookies risk denial of service
- `guzzlehttp/guzzle`: [CVE-2026-59883](https://github.com/advisories/GHSA-g446-98w2-8p5w), medium. Guzzle: Cookie Disclosure and Injection via IP-Address Domains
- `guzzlehttp/guzzle`: [CVE-2026-67339](https://github.com/advisories/GHSA-94pj-82f3-465w), medium. Guzzle: Proxy-Authorization headers can be sent to origin servers
- `guzzlehttp/guzzle`: [CVE-2026-55767](https://github.com/guzzle/guzzle/security/advisories/GHSA-cwxw-98qj-8qjx), medium. Dot-only cookie domains match all hosts
- `guzzlehttp/guzzle`: [CVE-2026-55568](https://github.com/guzzle/guzzle/security/advisories/GHSA-wpwq-4j6v-78m3), medium. Silent HTTPS proxy downgrade to cleartext
- `guzzlehttp/guzzle`: [CVE-2022-31091](https://github.com/guzzle/guzzle/security/advisories/GHSA-q559-8m2m-g699), high. Change in port should be considered a change in origin
- `guzzlehttp/guzzle`: [CVE-2022-31090](https://github.com/guzzle/guzzle/security/advisories/GHSA-25mq-v84q-4j7r), high. CURLOPT_HTTPAUTH option not cleared on change of origin
- `guzzlehttp/guzzle`: [CVE-2022-31043](https://github.com/guzzle/guzzle/security/advisories/GHSA-w248-ffj2-4v5q), high. Fix failure to strip Authorization header on HTTP downgrade
- `guzzlehttp/guzzle`: [CVE-2022-31042](https://github.com/guzzle/guzzle/security/advisories/GHSA-f2wf-25xc-69c9), high. Failure to strip the Cookie header on change in host or HTTP downgrade
- `guzzlehttp/guzzle`: [CVE-2022-29248](https://github.com/guzzle/guzzle/security/advisories/GHSA-cwmx-hcrq-mhc3), high. Cross-domain cookie leakage
- `guzzlehttp/psr7`: [CVE-2026-59882](https://github.com/advisories/GHSA-c2w2-prh8-qm98), medium. guzzlehttp/psr7: Host Confusion via Weak URI Host Validation
- `guzzlehttp/psr7`: [CVE-2026-55766](https://github.com/guzzle/psr7/security/advisories/GHSA-vm85-hxw5-5432), medium. CRLF injection in HTTP start-line serialization
- `guzzlehttp/psr7`: [CVE-2026-49214](https://github.com/guzzle/psr7/security/advisories/GHSA-hq7v-mx3g-29hw), medium. CRLF injection via URI host component
- `guzzlehttp/psr7`: [CVE-2026-48998](https://github.com/guzzle/psr7/security/advisories/GHSA-34xg-wgjx-8xph), medium. Host confusion via authority reinterpretation
- `nesbot/carbon`: [CVE-2025-22145](https://github.com/advisories/GHSA-j3f9-p6hm-5w6q), medium. Carbon has an arbitrary file include via unvalidated input passed to Carbon::setLocale
- `simplesamlphp/saml2`: [CVE-2026-49289](https://github.com/advisories/GHSA-5cjr-mxj5-wmrx), high. SimpleSAMLphp has Possible DoS via XPath Transform
- `simplesamlphp/saml2`: [CVE-2026-49283](https://github.com/advisories/GHSA-6929-8p9f-26jx), high. SimpleSAMLphp HTTP-Artifact TLS validator confusion allows cross-IdP authentication bypass
- `simplesamlphp/simplesamlphp`: [CVE-2026-49284](https://github.com/advisories/GHSA-q8r6-xj3f-wrrm), high. SimpleSAMLphp SP accepts a response from an unexpected IdP when unsigned `Response/InResponseTo` is combined with a signed assertion lacking `SubjectConfirmationData/InResponseTo`
- `symfony/cache`: [CVE-2026-45073](https://symfony.com/cve-2026-45073), medium. CVE-2026-45073: SQL Injection in PdoAdapter::doClear() via Unsanitized $prefix
- `symfony/dom-crawler`: [CVE-2026-45071](https://symfony.com/cve-2026-45071), low. CVE-2026-45071: XXE (Local File Disclosure) in DomCrawler::addXmlContent() via validateOnParse = true
- `symfony/http-client`: [CVE-2026-48736](https://symfony.com/cve-2026-48736), medium. CVE-2026-48736: IpUtils::PRIVATE_SUBNETS Omits IPv6 Transition Forms (6to4, NAT64, Teredo, IPv4-compatible): SSRF Bypass in NoPrivateNetworkHttpClient
- `symfony/process`: [CVE-2026-24739](https://github.com/advisories/GHSA-r39x-jcww-82v6), medium. Symfony's incorrect argument escaping under MSYS2/Git Bash can lead to destructive file operations on Windows
- `symfony/routing`: [CVE-2026-48784](https://symfony.com/cve-2026-48784), medium. CVE-2026-48784: UrlGenerator Dot-Segment Encoding Skips Every Other Chained `../` or `./` → Generated URL Collapses Off-Route Under RFC 3986 Normalization
- `symfony/routing`: [CVE-2026-45065](https://symfony.com/cve-2026-45065), medium. CVE-2026-45065: UrlGenerator Route-Requirement Bypass via Unanchored Regex Alternation → Off-Site //host URL Injection
- `symfony/yaml`: [CVE-2026-45304](https://symfony.com/cve-2026-45304), low. CVE-2026-45304: YAML Parser Exponential Memory Allocation via Recursive Collection-Alias Expansion ("Billion Laughs")
- `symfony/yaml`: [CVE-2026-45305](https://symfony.com/cve-2026-45305), low. CVE-2026-45305: YAML Parser ReDoS via Catastrophic Backtracking in Parser::cleanup() Regex
- `symfony/yaml`: [CVE-2026-45133](https://symfony.com/cve-2026-45133), low. CVE-2026-45133: YAML Parser Stack Exhaustion via Unbounded Recursion in Nested Blocks, Sequences, and Mappings
- `twig/twig`: [CVE-2026-49981](https://github.com/advisories/GHSA-529h-vh3j-85hq), high. Twig: Sandbox filter, tag and function allow-list bypass when sandbox state changes between renders for a cached `Template`
- `twig/twig`: [CVE-2026-48808](https://symfony.com/blog/cve-2026-48808-sandbox-property-allowlist-bypass-via-the-column-filter-under-sourcepolicyinterface), medium. Sandbox property allowlist bypass via the `column` filter under `SourcePolicyInterface`
- `twig/twig`: [CVE-2026-48805](https://symfony.com/blog/cve-2026-48805-sandbox-state-regression-in-deprecated-internal-wrappers-in-src-resources-core-php), low. Sandbox state regression in deprecated internal wrappers in `src/Resources/core.php`
- `twig/twig`: [CVE-2026-46636](https://symfony.com/blog/cve-2026-46636-sandbox-filter-tag-and-function-allow-list-bypass-when-sandbox-state-changes-between-renders), severity unspecified. Sandbox filter, tag and function allow-list bypass when sandbox state changes between renders
- `twig/twig`: [CVE-2026-48806](https://symfony.com/blog/cve-2026-48806-sandbox-tostring-policy-bypass-via-dynamic-mapping-keys), medium. Sandbox `__toString()` policy bypass via dynamic mapping keys
- `twig/twig`: [CVE-2026-48807](https://symfony.com/blog/cve-2026-48807-sandbox-tostring-policy-bypass-via-traversable-in-join-replace-and-in-not-in-operators), medium. Sandbox `__toString()` policy bypass via `Traversable` in `join`/`replace` and `in`/`not in` operators
- `twig/twig`: [CVE-2026-46628](https://symfony.com/cve-2026-46628), low. The `spaceless` filter implicitly marks its output as safe
- `twig/twig`: [CVE-2026-46633](https://symfony.com/cve-2026-46633), critical. PHP code injection via `{% use %}` template name
- `twig/twig`: [CVE-2026-46627](https://symfony.com/cve-2026-46627), severity unspecified. Sandbox does not protect against resource exhaustion
- `twig/twig`: [CVE-2026-46635](https://symfony.com/cve-2026-46635), low. Sandbox property allowlist bypass via the `column` filter (array_column on objects)
- `twig/twig`: [CVE-2026-46638](https://symfony.com/cve-2026-46638), medium. `{% sandbox %}{% include %}` skips checkSecurity() on cached templates (incomplete fix for CVE-2024-45411)
- `twig/twig`: [CVE-2026-24425](https://symfony.com/cve-2026-24425), high. Possible sandbox bypass when using a source policy
- `twig/twig`: [CVE-2026-47732](https://symfony.com/cve-2026-47732), high. Sandbox: multiple `__toString()` policy bypasses via unguarded string coercion points
- `twig/twig`: [CVE-2024-51754](https://symfony.com/blog/cve-2024-51754-unguarded-calls-to-tostring-in-a-sandbox-when-an-object-is-in-an-array-or-an-argument-list), low. Unguarded calls to __toString() when nesting an object into an array
- `twig/twig`: [CVE-2024-51755](https://symfony.com/blog/cve-2024-51755-unguarded-calls-to-isset-and-to-array-accesses-in-a-sandbox), low. Unguarded calls to __isset() and to array-accesses when the sandbox is enabled
- `webonyx/graphql-php`: [PKSA-xwpn-zs9j-6wy5](https://github.com/advisories/GHSA-r7cg-qjjm-xhqq), high. webonyx/graphql-php has unbounded recursion in parser that causes stack overflow on crafted nested input
- `webonyx/graphql-php`: [PKSA-sf9j-1gs7-xzvx](https://github.com/advisories/GHSA-fc86-6rv6-2jpm), high. webonyx/graphql-php has quadratic validation cost in OverlappingFieldsCanBeMerged via inline fragments
- `webonyx/graphql-php`: [CVE-2026-40476](https://github.com/advisories/GHSA-68jq-c3rv-pcrr), medium. graphql-php is affected by a Denial of Service via quadratic complexity in OverlappingFieldsCanBeMerged validation


## P0 investigation, 10 September 2026

The P0 item is a security remediation workstream. It does not mean every advisory is an equally urgent application exploit. The deeper investigation changes the original plan: Sendinblue replacement belongs in the security work because it prevents Guzzle patches; SimpleSAMLphp modernization is also a prerequisite for Twig 3. A separate TLS verification defect was found in the CAPEB integration.

| Workstream | Practical urgency / 10 | Exposure evidence | Recommended action |
| --- | --- | --- | --- |
| GraphQL parser and validator | 9 | Anonymous API configuration, controller passes queries to affected parser; production perimeter unverified | Patch parser and compatible Overblog bundle first; deploy temporary request controls if delayed |
| CAPEB TLS verification | 9 on an active affected instance | Credentialed request explicitly disables certificate verification; only new CAPEB CAS users reach this filter | Fix certificate trust and require verification; reject unexpected redirects |
| SAML authentication | 9 if affected bindings/trust configuration is deployed | Application maps SAML attributes to local accounts; exact IdP metadata unknown | Inventory enabled tenants, patch SAML2 and migrate SimpleSAMLphp; test rejection paths |
| Guzzle credential handling | 8 | Local mock reproduction confirmed header leakage across port change | Remove SDK version constraint and patch Guzzle/PSR-7 together |
| Twig template execution | 8 pending exposure confirmation; 10 if untrusted template source is accepted | Affected version confirmed; no application-owned dynamic-template construction found | Resolve SAML/Twig extension blockers and upgrade Twig; inspect deployment-supplied templates |

These are prioritization scores, not CVSS. A confirmed untrusted Twig template path or vulnerable SAML federation changes the order immediately. No production compromise is established.

**GraphQL: the most broadly reachable candidate.** The installed lockfile version is `webonyx/graphql-php` 14.11.10. Two high advisories concern parser recursion and expensive validation. The public firewall permits anonymous access, the production Nginx template forwards `/graphql` and `/graphql/internal`, and the application controller calls the request executor. The inspected batch path loops over submitted operations without an application-level batch-count check. No `limit_req` was found in the inspected Nginx templates; an external gateway may provide additional controls.

The parser issue occurs before execution-depth/complexity validation. A valid field permission model does not prevent it. The maintainer identifies 15.32.3 as the parser fix. Select a current compatible release that clears the full audit. No crash payload was sent to this application. [Parser advisory](https://github.com/webonyx/graphql-php/security/advisories/GHSA-r7cg-qjjm-xhqq).

Blocker: locked `overblog/graphql-bundle` 0.14.4 requires `webonyx/graphql-php ^14.5`, so updating Webonyx alone cannot select major 15. Choose a released compatible Overblog version and check custom controller, promise adapters, DataLoaders, schema compilation and generated types. The upstream development manifest supports Symfony 5.4, suggesting a Symfony major upgrade may not be necessary; that is not proof that a particular release solves this repository's full dependency set. [Upstream manifest](https://github.com/overblog/GraphQLBundle/blob/master/composer.json).

Temporary containment should bound request bytes, request rate and batch count at the entry point, using legitimate traffic to set thresholds. These controls reduce exposure and do not establish that the parser is fixed. Do not rely on introspection being disabled, CORS, or a blanket requirement to log in, since public participation needs anonymous queries.

Acceptance: compile all currently configured schemas, run API query/mutation tests and DataLoader regressions, and exercise parser/validation rejection cases in an isolated process with a time/memory bound. Verify ordinary anonymous browsing and participation still work. Rough effort: 3–7 engineer-days after dependency resolution, potentially longer if Overblog integration changes are extensive.

Evidence: [src/Capco/AppBundle/Controller/Api/GraphQLController.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/AppBundle/Controller/Api/GraphQLController.php:168); [config/packages/security.yaml](/Users/alextea/Web/cap-collectif/platform/config/packages/security.yaml:58); [infrastructure/services/remote/nginx/nginx.conf](/Users/alextea/Web/cap-collectif/platform/infrastructure/services/remote/nginx/nginx.conf:124); [config/packages/graphql.yaml](/Users/alextea/Web/cap-collectif/platform/config/packages/graphql.yaml:18); [composer.lock](/Users/alextea/Web/cap-collectif/platform/composer.lock:7647).

**Guzzle: a demonstrated library defect and a concrete blocker.** Version 7.3.0 is used by mail/provider integrations. A local reproduction using Guzzle's MockHandler returned a redirect from `https://audit.invalid` to the same host on port 8443. The follow-up request retained Authorization. All credentials were synthetic and no socket was opened. This proves the installed library behavior, not a production credential leak. An attacker still needs a relevant redirect or network/endpoint influence in a credentialed request path. [Maintainer advisory](https://github.com/guzzle/guzzle/security/advisories/GHSA-q559-8m2m-g699).

`composer why --locked --tree` confirms `sendinblue/api-v3-sdk` 7.4.4 requires `guzzlehttp/guzzle <=7.3.0`. This is why a generic Guzzle update is insufficient. Upgrade that SDK if a maintained compatible release removes the bound, or replace it with its declared successor `getbrevo/brevo-php`. Preserve the existing ContactsApi wrapper and update actual SDK model/API usages. This package is used for newsletter contact creation, updates, deletion and transactional email; deleting it merely because it is abandoned would break features.

Then update Guzzle and `guzzlehttp/psr7` together. The audit snapshot contains later advisories than the original 2022 redirect fixes, so stopping at Guzzle 7.4.5 is insufficient. Use a current release that clears the complete audit. Review custom authentication headers such as provider API keys separately; upgrading a client is not permission to send those headers to arbitrary redirects. The simplest policy for fixed provider endpoints is to reject unexpected redirects, after verifying provider contracts.

Acceptance: the same mock redirect no longer forwards Authorization across origins; contact subscribe/update/unsubscribe and transactional email tests pass; Mailjet credentialed requests and FranceConnect JWKS fetching remain functional. Rough effort: 2–5 days for the SDK/client change, depending on API model differences.

Evidence: [composer.lock](/Users/alextea/Web/cap-collectif/platform/composer.lock:10487); [src/Capco/AppBundle/Mailer/SendInBlue/ContactsApi.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/AppBundle/Mailer/SendInBlue/ContactsApi.php:29); [src/Capco/AppBundle/Mailer/Transport/MailjetTransport.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/AppBundle/Mailer/Transport/MailjetTransport.php:131); [src/Capco/UserBundle/FranceConnect/FranceConnectResourceOwner.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/UserBundle/FranceConnect/FranceConnectResourceOwner.php:182).

**CAPEB: TLS validation is explicitly disabled.** This is an additional application finding, outside Composer's 50 advisories. `CapebUserFilter` sends HTTP Basic credentials to its configured URL with `verify => false` and uses the returned role to choose a user type. A network attacker able to intercept the connection could impersonate the service, receive credentials or alter that role response. This is conditional on deployment/network access, not an Internet-wide unauthenticated bypass.

The caller narrows the scope: it runs when creating a new CAS user and `SYMFONY_INSTANCE_NAME` equals `capcapeb`; an empty integration URL exits early. Verify the configured endpoint is HTTPS, repair the certificate chain or supply the intended CA bundle, and restore certificate and hostname verification. Avoid silently breaking onboarding by changing the flag while leaving an invalid certificate in place. Keep failure behavior closed. The production CAS server validation in `CasHandler` is already enabled; the defect is in the separate role-lookup HTTP client.

Acceptance: the valid service certificate succeeds, an untrusted/mismatched certificate fails, role lookup failure denies onboarding and unexpected redirects are rejected. Use synthetic accounts and local test certificates. Rough effort: 0.5–2 days plus any provider certificate coordination.

Evidence: [src/Capco/UserBundle/Security/Service/CapebUserFilter.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/UserBundle/Security/Service/CapebUserFilter.php:48); [src/Capco/UserBundle/Security/Core/User/CasUserProvider.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/UserBundle/Security/Core/User/CasUserProvider.php:40).

**SAML: account mapping increases the consequence of assertion acceptance bugs.** `SamlAuthenticator` delegates authentication to SimpleSAMLphp and selects an identity attribute. `SamlUserProvider` searches by `samlId`, then links an existing account by email. Thus acceptance of an inappropriate assertion could authenticate as an existing local identity, subject to the IdP trust setup and attributes. The provider code does not establish a bypass on its own.

The HTTP-Artifact advisory concerns crossing trust boundaries between IdPs. The separate response-correlation advisory concerns accepting a different trusted IdP than the one selected for login. Inventory bindings, trusted IdPs, expected issuer checks, response/assertion signing rules and account linkage before assigning tenant-specific severity. [Artifact advisory](https://github.com/simplesamlphp/saml2/security/advisories/GHSA-6929-8p9f-26jx), [response-correlation advisory](https://github.com/simplesamlphp/simplesamlphp/security/advisories/GHSA-q8r6-xj3f-wrrm).

The XPath-transform denial-of-service advisory is a separate concern and does not depend on proving the multi-IdP authentication scenario. Its documented fixes are SAML2 4.19.3 or 4.20.3. SimpleSAMLphp's response-correlation fixes are 2.4.7 or 2.5.2. These are advisory-specific minimums, not a tested combined target. Patch the compatible SAML2 line while resolving the SimpleSAMLphp major migration. [XPath advisory](https://github.com/simplesamlphp/saml2/security/advisories/GHSA-5cjr-mxj5-wmrx).

A disabled Symfony SAML flag is insufficient evidence that all SAML code is unreachable: the compiler removes application services, but Nginx independently aliases `/simplesaml` to the vendor application's `www` directory. Verify deployed routing and disable unused vendor endpoints. When upgrading SimpleSAMLphp, explicitly check its supported web-root layout and adapt the Nginx alias; changing Composer alone can break callbacks.

Acceptance: valid login/logout and existing account linking work; wrong-issuer, invalid-signature, expired and replayed responses are rejected; disallowed XPath transforms fail with bounded resource use. Test each deployed IdP configuration, not every hard-coded name as if it were an active customer. Rough effort: 1 day inventory; 4–10+ days combined SAML/Twig migration with IdP testing.

Evidence: [src/Capco/UserBundle/Authenticator/SamlAuthenticator.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/UserBundle/Authenticator/SamlAuthenticator.php:34); [src/Capco/UserBundle/Security/Core/User/SamlUserProvider.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/UserBundle/Security/Core/User/SamlUserProvider.php:24); [src/Capco/AppBundle/DependencyInjection/Compiler/SimpleSAMLServicePass.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/AppBundle/DependencyInjection/Compiler/SimpleSAMLServicePass.php:27); [infrastructure/services/remote/nginx/nginx.conf](/Users/alextea/Web/cap-collectif/platform/infrastructure/services/remote/nginx/nginx.conf:211); [composer.lock](/Users/alextea/Web/cap-collectif/platform/composer.lock:10996).

**Twig: highest potential impact, weaker evidence of application reachability.** Twig 2.16.1 matches the critical PHP code-injection advisory. Exploitation requires a crafted template source to reach compilation. Ordinary content supplied as template variables is not the same input. Searches across application source, configuration and templates found no `createTemplate`, `ArrayLoader`, `StringLoader`, `template_from_string` or `SandboxExtension` usage. Inspected mail/controller paths render named templates. This is useful negative evidence, not proof that customer custom code, vendor templates or deployed theme mechanisms cannot expose it. [Critical advisory](https://symfony.com/cve-2026-46633).

Two confirmed blockers prevent Twig 3: SimpleSAMLphp 1.19.8 requires `twig/twig ^2.15.3`; `twig/extensions` 1.5.4 accepts only Twig 1/2. SimpleSAMLphp's configurable-i18n dependency also pulls the old extension package. The application registers legacy text/intl classes and type-hints the intl extension in ThemeRuntime. Update the SAML dependency family and migrate those extensions to compatible supported equivalents, preserving locale/date/number formatting.

Twig 3.26.0 fixes the critical advisory, but a later high-severity sandbox advisory is fixed in 3.27.0. Therefore do not stop at the critical advisory's first fixed version. Resolve to an audited current Twig 3 release. [Later sandbox advisory](https://github.com/twigphp/Twig/security/advisories/GHSA-529h-vh3j-85hq).

Acceptance: compile templates, test localized dates/numbers, transactional emails, legacy pages and SAML views; rebuild template caches and restart long-lived workers during deployment. Use a harmless maintainer regression case in isolation to verify rejection of malicious template syntax. No Twig exploit was executed in this audit. Effort overlaps the SAML migration above.

Evidence: [config/packages/twig.yaml](/Users/alextea/Web/cap-collectif/platform/config/packages/twig.yaml:95); [src/Capco/AppBundle/Twig/ThemeRuntime.php](/Users/alextea/Web/cap-collectif/platform/src/Capco/AppBundle/Twig/ThemeRuntime.php:27); [composer.lock](/Users/alextea/Web/cap-collectif/platform/composer.lock:10996); [composer.lock](/Users/alextea/Web/cap-collectif/platform/composer.lock:20114).

Recommended patch batches, with exposure investigation starting immediately for all:

| Batch | Scope | Completion gate |
| --- | --- | --- |
| A | Verify deployment exposure; repair CAPEB TLS if active; block unused `/simplesaml` paths; apply measured temporary API controls where needed | Deployment evidence recorded and affected feature smoke tests pass |
| B | Brevo/Sendinblue compatibility fix + Guzzle/PSR-7 patches | Mock redirect regression passes and provider workflows work |
| C | Overblog + graphql-php + required Symfony 5.4 patch updates | Schema/API tests pass and bounded parser rejection demonstrated |
| D | SimpleSAMLphp/SAML2 + Twig 3 + legacy extension replacement | Each active IdP and template regression gate passes |
| E | Remaining compatible dependency security patches and PR audit enforcement | Current audit reviewed with no unexplained critical/high matches |

B and C are independently deliverable. D should move ahead of them if exposure investigation confirms untrusted templates or an affected SAML trust setup. The plan should be split into small reviewable PRs within each batch, but dependencies must resolve to a working final lockfile before any batch is deployed. Do not postpone compatible Symfony patch releases until the full Symfony migration.

Verification notes for this deeper pass:

- Read advisory conditions and patch versions from maintainer sources; examined the locked dependency graph and traced GraphQL, SAML, CAS/CAPEB and mail-client callers.
- Confirmed Guzzle 7.3.0 behavior with an isolated MockHandler check. No actual provider request, production request or credential was used.
- `composer why guzzlehttp/guzzle --locked --tree` succeeded. `composer prohibits` target checks could not complete because the container could not authenticate/fetch a configured GitHub repository and lacked git for its fallback. No exact complete upgrade solution is claimed; dependency blockers above are directly present in the lockfile.
- No source, configuration or dependency changes were made. No production reachability, IdP metadata, installed deployment versions or successful attack was verified.
