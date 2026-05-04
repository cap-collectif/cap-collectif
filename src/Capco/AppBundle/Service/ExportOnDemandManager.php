<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Message\ExportOnDemandMessage;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

final class ExportOnDemandManager
{
    private const SYNC_TIMEOUT_SECONDS = 5;

    public function __construct(
        private readonly KernelInterface $kernel,
        private readonly MessageBusInterface $bus,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function ensureExportAvailable(ExportOnDemandRequest $request): ExportOnDemandAvailability
    {
        $process = new Process(
            $this->buildCommand($request->getCommandName(), $request->getCommandOptions()),
            $this->kernel->getProjectDir()
        );
        $process->setTimeout(self::SYNC_TIMEOUT_SECONDS);

        try {
            $process->run();
        } catch (ProcessTimedOutException $exception) {
            $this->logger->warning('Export on-demand sync attempt timed out', [
                'command' => $request->getCommandName(),
                'timeout' => self::SYNC_TIMEOUT_SECONDS,
                'exception' => $exception->getMessage(),
            ]);

            if (file_exists($request->getFilePath())) {
                $removed = @unlink($request->getFilePath());
                if ($removed) {
                    $this->logger->info('Export on-demand sync cleanup removed file after timeout', [
                        'file_path' => $request->getFilePath(),
                    ]);
                } else {
                    $this->logger->warning('Export on-demand sync cleanup failed to remove file after timeout', [
                        'file_path' => $request->getFilePath(),
                    ]);
                }
            }

            $this->dispatchAsync($request);

            return ExportOnDemandAvailability::REQUESTED;
        } catch (\Throwable $exception) {
            $this->logger->warning('Export on-demand sync attempt failed', [
                'command' => $request->getCommandName(),
                'exception' => $exception->getMessage(),
            ]);

            return ExportOnDemandAvailability::FAILED;
        }

        if (!$process->isSuccessful()) {
            $this->logger->warning('Export on-demand sync attempt failed', [
                'command' => $request->getCommandName(),
                'exit_code' => $process->getExitCode(),
                'exit_code_text' => $process->getExitCodeText(),
                'error_output' => $process->getErrorOutput(),
                'output' => $process->getOutput(),
            ]);

            return ExportOnDemandAvailability::FAILED;
        }

        if (file_exists($request->getFilePath())) {
            return ExportOnDemandAvailability::AVAILABLE;
        }

        $this->logger->warning('Export on-demand sync finished but file missing', [
            'command' => $request->getCommandName(),
            'file_path' => $request->getFilePath(),
        ]);

        return ExportOnDemandAvailability::EMPTY;
    }

    private function dispatchAsync(ExportOnDemandRequest $request): void
    {
        $user = $request->getUser();
        $this->bus->dispatch(new ExportOnDemandMessage(
            commandName: $request->getCommandName(),
            commandOptions: $request->getCommandOptions(),
            filePath: $request->getFilePath(),
            downloadUrl: $request->getDownloadUrl(),
            userId: (string) $user->getId(),
            userEmail: $user->getEmail(),
            username: $user->getUsername(),
            userLocale: $user->getLocale(),
            fileName: $request->getFileName(),
        ));
    }

    /**
     * @param array<string, mixed> $commandOptions
     *
     * @return string[]
     */
    private function buildCommand(string $commandName, array $commandOptions): array
    {
        $command = [
            'php',
            'bin/console',
            $commandName,
            '--no-interaction',
        ];

        foreach ($commandOptions as $name => $value) {
            if (true === $value) {
                $command[] = sprintf('--%s', $name);

                continue;
            }

            if (null === $value || false === $value) {
                continue;
            }

            $command[] = sprintf('--%s=%s', $name, $value);
        }

        return $command;
    }
}
