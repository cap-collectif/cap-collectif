<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Toggle\Manager as ToggleManager;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Process\Process;

trait SnapshotCommandTrait
{
    private function executeSnapshot(
        InputInterface &$input,
        OutputInterface &$output,
        string $id,
        bool $import = false,
        bool $customPath = false
    ): void {
        $io = new SymfonyStyle($input, $output);
        if (true !== $input->getOption('updateSnapshot')) {
            return;
        }

        // To prevent a warning saying that $this->toggleManager is not defined
        // @phpstan-ignore-next-line
        if (!$this->toggleManager->isActive(ToggleManager::multilangue)) {
            $io->warning(
                'You probably will have to enable multilangue feature to run this command, ' .
                'otherwise you will have links that are followed by _locale=fr_FR (for instance) ' .
                'and it will wrongly update snapshots. ' .
                'Also, you probably want to enable it in test env : capco:toggle:enable multilangue --env=test'
            );
        }

        $this->updateSnapshot($id, $import, $customPath);
        $io->info('Snapshot has been written !');
    }

    private function configureSnapshot(): void
    {
        $this->addOption(
            'updateSnapshot',
            'u',
            InputOption::VALUE_NONE,
            '/!\ Dev only. This will re-generate snapshot artifacts for current RGPD archive.'
        );
    }

    private function updateSnapshot(
        string $id,
        bool $import = false,
        bool $customPath = false
    ): void {
        $generatedDirectory = $this->projectRootDir . "/public/export/{$id}";
        $gitDirectory = $import
            ? $this->projectRootDir . "/__snapshots__/imports/{$id}"
            : $this->projectRootDir . "/__snapshots__/exports/{$id}";

        if ($customPath) {
            $generatedDirectory = "/tmp/{$id}";
        }

        if (!file_exists($generatedDirectory)) {
            return;
        }

        Process::fromShellCommandline('rm -rf ' . $gitDirectory)->mustRun();
        if (!$customPath) {
            chmod($generatedDirectory, 0755);
        }

        Process::fromShellCommandline("mv {$generatedDirectory} {$gitDirectory}")->mustRun();
    }
}
