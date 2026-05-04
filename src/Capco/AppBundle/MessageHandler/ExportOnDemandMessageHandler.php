<?php

namespace Capco\AppBundle\MessageHandler;

use Capco\AppBundle\Message\ExportOnDemandMessage;
use Capco\AppBundle\Message\ExportReadyEmailMessage;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Process\Process;

#[AsMessageHandler(fromTransport: 'async', handles: ExportOnDemandMessage::class)]
class ExportOnDemandMessageHandler
{
    public function __construct(
        private readonly KernelInterface $kernel,
        private readonly MessageBusInterface $bus,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function __invoke(ExportOnDemandMessage $message): void
    {
        if (file_exists($message->getFilePath())) {
            $this->bus->dispatch(new ExportReadyEmailMessage(
                userEmail: $message->getUserEmail(),
                downloadUrl: $message->getDownloadUrl(),
                username: $message->getUsername(),
                userLocale: $message->getUserLocale(),
                fileName: $message->getFileName(),
            ));

            return;
        }

        $process = new Process(
            $this->buildCommand($message->getCommandName(), $message->getCommandOptions()),
            $this->kernel->getProjectDir()
        );
        $process->setTimeout(null);

        try {
            $this->logger->info('RUNNING ' . $message->getCommandName());
            $process->run();
        } catch (\Throwable $exception) {
            $this->logger->error('Export on-demand async process failed to start', [
                'command' => $message->getCommandName(),
                'exception' => $exception->getMessage(),
            ]);

            return;
        }

        if ($process->isSuccessful()) {
            $this->logger->info('EXPORTING SUCCESSFUL');
        }

        if ($process->isTerminated()) {
            $this->logger->info('EXPORTING TERMINATED');
        }

        if (!$process->isSuccessful()) {
            $this->logger->error('Export on-demand async generation failed', [
                'command' => $message->getCommandName(),
                'exit_code' => $process->getExitCode(),
                'output' => $process->getOutput(),
                'error_output' => $process->getErrorOutput(),
            ]);

            return;
        }
        if (!file_exists($message->getFilePath())) {
            $this->logger->error('Export on-demand file missing after generation', [
                'file_path' => $message->getFilePath(),
                'command' => $message->getCommandName(),
            ]);

            return;
        }

        $this->bus->dispatch(new ExportReadyEmailMessage(
            userEmail: $message->getUserEmail(),
            downloadUrl: $message->getDownloadUrl(),
            username: $message->getUsername(),
            userLocale: $message->getUserLocale(),
            fileName: $message->getFileName(),
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
