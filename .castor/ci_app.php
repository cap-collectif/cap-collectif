<?php

declare(strict_types=1);

namespace Ci\App;

use function Capco\Castor\application;
use Castor\Attribute\AsArgsAfterOptionEnd;
use Castor\Attribute\AsTask;
use function Local\App\cmd as localCmd;
use function Local\App\deploy as localDeploy;
use function Local\App\preparePhp as localPreparePhp;
use function Local\App\rabbitmqQueues as localRabbitmqQueues;
use function Local\App\sql as localSql;
use function Local\App\startConsumers as localStartConsumers;
use function Local\App\swarrotConsume as localSwarrotConsume;
use function Local\App\toggleDisable as localToggleDisable;
use function Local\App\toggleEnable as localToggleEnable;

#[AsTask(description: 'Deploy the application in CI.')]
function deploy(): void
{
    localDeploy();
    application('chmod -R 777 /var/www/public', 'root');
}

/** @param list<string> $arguments */
#[AsTask(description: 'Run a Symfony command in CI.')]
function cmd(
    string $commandName = '',
    string $environment = 'test',
    #[AsArgsAfterOptionEnd] array $arguments = [],
): void {
    localCmd($commandName, $environment, $arguments);
}

#[AsTask(description: 'Run a SQL query in CI.')]
function sql(string $sql = '', string $environment = 'test'): void
{
    localSql($sql, $environment);
}

#[AsTask(description: 'Prepare PHP dependencies in CI.')]
function preparePhp(string $environment = 'dev'): void
{
    localPreparePhp($environment);
}

#[AsTask(description: 'Create RabbitMQ queues in CI.')]
function rabbitmqQueues(): void
{
    localRabbitmqQueues();
}

#[AsTask(description: 'Start application consumers in CI.')]
function startConsumers(): void
{
    localStartConsumers();
}

#[AsTask(description: 'Consume a Swarrot queue in CI.')]
function swarrotConsume(string $name): void
{
    localSwarrotConsume($name);
}

#[AsTask(description: 'Disable a feature flag in CI.')]
function toggleDisable(string $toggle = 'public_api', string $environment = 'test'): void
{
    localToggleDisable($toggle, $environment);
}

#[AsTask(description: 'Enable a feature flag in CI.')]
function toggleEnable(string $toggle = 'public_api', string $environment = 'test'): void
{
    localToggleEnable($toggle, $environment);
}
