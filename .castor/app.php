<?php

declare(strict_types=1);

namespace Local\App;

use Capco\Castor\App as Shared;
use Castor\Attribute\AsArgsAfterOptionEnd;
use Castor\Attribute\AsArgument;
use Castor\Attribute\AsTask;

#[AsTask(description: 'Clear the Symfony cache in the application container.', aliases: ['cc'])]
function clearCache(string $environment = 'dev'): void
{
    Shared\clearCache($environment);
}

/** @param list<string> $arguments */
#[AsTask(description: 'Run a Symfony command in the local application container.', aliases: ['console'])]
function console(
    string $commandName = '',
    string $environment = 'dev',
    #[AsArgsAfterOptionEnd] array $arguments = [],
): void {
    Shared\console($commandName, $environment, $arguments);
}

#[AsTask(description: 'Enable a feature flag locally.', aliases: ['enable'])]
function toggleEnable(#[AsArgument] string $toggle, string $environment = 'test'): void
{
    Shared\toggleEnable($toggle, $environment);
}

#[AsTask(description: 'Disable a feature flag locally.', aliases: ['disable'])]
function toggleDisable(#[AsArgument] string $toggle, string $environment = 'test'): void
{
    Shared\toggleDisable($toggle, $environment);
}

#[AsTask(description: 'Erase and recreate the local RabbitMQ vhost and queues.', aliases: ['rabbitmq'])]
function rabbitmqQueues(): void
{
    Shared\rabbitmqQueues();
}

#[AsTask(description: 'Start local application consumers.')]
function startConsumers(): void
{
    Shared\startConsumers();
}

#[AsTask(description: 'Stop local application consumers.')]
function stopConsumers(): void
{
    Shared\stopConsumers();
}

#[AsTask(description: 'Consume a Swarrot queue in the local application container.')]
function swarrotConsume(string $name): void
{
    Shared\swarrotConsume($name);
}

#[AsTask(description: 'Generate the default local environment file.')]
function setupDefaultEnvVars(): void
{
    Shared\setupDefaultEnvVars();
}

/** @param list<string> $arguments */
#[AsTask(description: 'Run Composer in the application container; defaults to installing dependencies with project options.', aliases: ['composer'])]
function composer(#[AsArgsAfterOptionEnd] array $arguments = []): void
{
    Shared\composer($arguments);
}

#[AsTask(description: 'Install Symfony assets in the application container.', aliases: ['assets'])]
function installAssets(string $environment = 'dev'): void
{
    Shared\installAssets($environment);
}

#[AsTask(description: 'Clear Symfony cache and generate PHP GraphQL classes, schemas and both Relay frontends.', aliases: ['graphql'])]
function generateGraphql(string $environment = 'dev', bool $backendOnly = false): void
{
    Shared\generateGraphql($environment, $backendOnly);
}
