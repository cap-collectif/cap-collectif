<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Utils\ExportUtils;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

abstract class BaseExportCommand extends Command
{
    protected $snapshot;
    protected $exportUtils;

    public function __construct(ExportUtils $exportUtils)
    {
        parent::__construct();
        $this->exportUtils = $exportUtils;
    }

    protected function configure(): void
    {
        $this->addOption(
            'snapshot',
            's',
            InputOption::VALUE_NONE,
            'Use the export for a snapshot, by replacing dynamic data with placeholders.'
        );
    }

    protected function initialize(InputInterface $input, OutputInterface $output): void
    {
        $this->snapshot = $input->getOption('snapshot') ?: false;
        $this->snapshot
            ? $this->exportUtils->enableSnapshotMode()
            : $this->exportUtils->disableSnapshotMode();
    }
}
