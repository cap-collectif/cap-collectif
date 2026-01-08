<?php

declare(strict_types=1);

namespace Capco\AppBundle\Antivirus;

use Psr\Log\LoggerInterface;

class ClamdManager
{
    public function __construct(
        private readonly LoggerInterface $logger
    ) {
    }

    public function start(): bool
    {
        exec('supervisorctl start clamd 2>&1', $output, $exitCode);
        $this->logger->info('ClamdManager: Starting clamd', [
            'exitCode' => $exitCode,
            'output' => implode("\n", $output),
        ]);

        return 0 === $exitCode || str_contains(implode('', $output), 'already started');
    }

    public function stop(): bool
    {
        exec('supervisorctl stop clamd 2>&1', $output, $exitCode);
        $this->logger->info('ClamdManager: Stopping clamd', [
            'exitCode' => $exitCode,
            'output' => implode("\n", $output),
        ]);

        return 0 === $exitCode || str_contains(implode('', $output), 'not running');
    }

    public function isRunning(): bool
    {
        exec('supervisorctl status clamd 2>&1', $output, $exitCode);

        return str_contains(implode('', $output), 'RUNNING');
    }
}
