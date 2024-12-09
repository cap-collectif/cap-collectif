<?php

namespace Capco\AppBundle\Traits;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
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
        if (true === $input->getOption('updateSnapshot')) {
            self::updateSnapshot($id, $import, $customPath);
            $output->writeln('<info>Snapshot has been written !</info>');
        }
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
