<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Utils\ExportUtils;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

abstract class BaseExportCommand extends Command
{
    public const DEFAULT_CSV_DELIMITER = ';';
    protected bool $snapshot;
    protected ExportUtils $exportUtils;

    public function __construct(ExportUtils $exportUtils)
    {
        parent::__construct();
        $this->exportUtils = $exportUtils;
    }

    public static function getShortenedFilename(
        string $filename,
        string $extension = '.csv',
        bool $projectAdmin = false,
        ?bool $isSimplifiedExport = false
    ): string {
        //If filename is too long (> 255) it will cause an error since it includes path, we check for 230 characters
        if (\strlen($filename) >= 230) {
            $filename = md5($filename);
        }

        if ($projectAdmin) {
            return "{$filename}-project-admin{$extension}";
        }

        if ($isSimplifiedExport) {
            return "{$filename}_simplified{$extension}";
        }

        return $filename . $extension;
    }

    protected function configure(): void
    {
        $this->addOption(
            'snapshot',
            's',
            InputOption::VALUE_NONE,
            'Use the export for a snapshot, by replacing dynamic data with placeholders.'
        )->addOption(
            'delimiter',
            'd',
            InputOption::VALUE_OPTIONAL,
            'Define the delimiter used in the CSV file.',
            self::DEFAULT_CSV_DELIMITER
        )->addOption(
            'force',
            false,
            InputOption::VALUE_NONE,
            'Set this option to force export even if feature toggle "export" is disabled.'
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
