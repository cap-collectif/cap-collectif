<?php

declare(strict_types=1);

namespace Ci\App;

use function Capco\Castor\App\console as sharedCmd;
use function Capco\Castor\App\dumpGraphqlSchemas as sharedDumpGraphqlSchemas;
use function Capco\Castor\App\generateGraphql as sharedGenerateGraphql;
use function Capco\Castor\App\rabbitmqQueues as sharedRabbitmqQueues;
use function Capco\Castor\App\startConsumers as sharedStartConsumers;
use function Capco\Castor\App\swarrotConsume as sharedSwarrotConsume;
use function Capco\Castor\App\toggleDisable as sharedToggleDisable;
use function Capco\Castor\App\toggleEnable as sharedToggleEnable;
use Castor\Attribute\AsArgsAfterOptionEnd;
use Castor\Attribute\AsArgument;
use Castor\Attribute\AsTask;

/** @param list<string> $arguments */
#[AsTask(description: 'Run a Symfony command in CI.')]
function console(
    string $commandName = '',
    string $environment = 'test',
    #[AsArgsAfterOptionEnd] array $arguments = [],
): void {
    sharedCmd($commandName, $environment, $arguments);
}

#[AsTask(description: 'Create RabbitMQ queues in CI.')]
function rabbitmqQueues(): void
{
    sharedRabbitmqQueues();
}

#[AsTask(description: 'Start application consumers in CI.')]
function startConsumers(): void
{
    sharedStartConsumers();
}

#[AsTask(description: 'Consume a Swarrot queue in CI.')]
function swarrotConsume(string $name): void
{
    sharedSwarrotConsume($name);
}

#[AsTask(description: 'Disable a feature flag in CI.')]
function toggleDisable(#[AsArgument] string $toggle, string $environment = 'test'): void
{
    sharedToggleDisable($toggle, $environment);
}

#[AsTask(description: 'Enable a feature flag in CI.')]
function toggleEnable(#[AsArgument] string $toggle, string $environment = 'test'): void
{
    sharedToggleEnable($toggle, $environment);
}

#[AsTask(description: 'Export the four GraphQL schemas in CI; optionally fail if committed schemas change.')]
function dumpGraphqlSchemas(bool $checkSame = false, string $environment = 'test'): void
{
    sharedDumpGraphqlSchemas($checkSame, $environment);
}

#[AsTask(description: 'Clear Symfony cache and generate PHP GraphQL classes, schemas and both Relay frontends in CI.')]
function generateGraphql(string $environment = 'test', bool $backendOnly = false): void
{
    sharedGenerateGraphql($environment, $backendOnly);
}
