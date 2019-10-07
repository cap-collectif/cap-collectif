<?php

namespace Capco\AppBundle\Traits;

use Symfony\Component\Process\Process;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

trait SnapshotCommandTrait
{
    private function executeSnapshot(
        InputInterface &$input,
        OutputInterface &$output,
        string $id
    ): void {
        if (true === $input->getOption('updateSnapshot')) {
            self::updateSnapshot($id);
            $output->writeln('<info>Snapshot has been written !</info>');
        }
    }

    private function configureSnapshot(): void
    {
        $this->setDescription('Create csv file from entity data')->addOption(
            'updateSnapshot',
            'u',
            InputOption::VALUE_NONE,
            '/!\ Dev only. This will re-generate snapshot artifacts for current RGPD archive.'
        );
    }

    private function updateSnapshot(string $id): void
    {
        $generatedDirectory = "/var/www/web/export/${id}";
        $gitDirectory = "/var/www/__snapshots__/exports/${id}";

        (new Process('rm -rf ' . $gitDirectory))->mustRun();

        chmod($generatedDirectory, 0755);

        (new Process("mv ${generatedDirectory} ${gitDirectory}"))->mustRun();
    }
}
