# Investigating CircleCI failures

Use the installed CircleCI CLI first when a user provides a pipeline or job URL.
The CLI may already be authenticated even when the browser is not. Commands vary
between CLI versions: inspect local help before assuming a subcommand exists.

```bash
command -v circleci
circleci help
circleci auth me
circleci workflow get <workflow-id> --json
circleci job get <job-id> --json
circleci job output get <job-id> --step-num <step-number> --execution <index>
```

Use the UUID in the URL's `workflowId` or `job` parameter. A pipeline number or
`buildNumber` is not a job UUID. Workflow details list job UUIDs. Job details list
each parallel execution and its steps; read `num` from the failing step rather
than assuming that a browser `#step-...` fragment is the API step number.

Inspect all failed executions. To compare with a passing workflow, find the same
job and the execution that actually ran the test: timing-based splitting can move
a file to a different executor. Save full logs in a temporary directory and read
the failure and surrounding context. Condensed output is optional and may omit
useful evidence. Use `circleci testresult --help` and `circleci artifact --help`
when test reports or screenshots are needed.

If the CLI fails before starting with `getting boot time: operation not permitted`,
retry the same read-only command through the tool's sandbox escalation mechanism.
This is not an authentication error. Network restrictions may also require that
mechanism. Do not print the CLI configuration or tokens to diagnose authentication;
use `circleci auth me`. If authentication really is missing, ask the user to log in
with `circleci auth login`, then resume the investigation.

Reading logs does not require rerunning, cancelling, approving, or triggering jobs.
Keep those state-changing operations scoped to the user's request. Compare exact
errors, revisions, test inputs, and execution order before concluding that a test
is flaky. Reproduce locally with the relevant test guide and keep temporary logs
and diagnostic scripts outside the repository.
