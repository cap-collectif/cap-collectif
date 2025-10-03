<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\AppLogExporter;
use Capco\AppBundle\Command\Service\FilePathResolver\AppLogFilePathResolver;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Exception\LocaleConfigurationException;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Stopwatch\Stopwatch;

class ExportAppLogCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    final public const EXPORT_FOLDER = 'app_logs/';

    private const CAPCO_EXPORT_APP_LOG = 'capco:export:app-logs';
    /** @phpstan-ignore-next-line */
    private readonly string $projectRootDir;

    public function __construct(
        ExportUtils $exportUtils,
        private readonly Manager $toggleManager,
        private readonly Stopwatch $stopwatch,
        private readonly AppLogExporter $logAdminExporter,
        private readonly AppLogFilePathResolver $appLogFilePathResolver,
        string $projectRootDir
    ) {
        $this->projectRootDir = $projectRootDir;
        parent::__construct($exportUtils);
    }

    /**
     * @throws LocaleConfigurationException
     */
    public function execute(InputInterface $input, OutputInterface $output): int
    {
        $style = new SymfonyStyle($input, $output);

        if (!$input->getOption('force') && !$this->toggleManager->isActive('export')) {
            $style->error('Please enable "export" feature to run this command');

            return 1;
        }

        $style->note('Starting the export.');
        $this->stopwatch->start('export_app_logs');
        $this->logAdminExporter->exportLogs($input->getOption('delimiter') ?? AppLogExporter::CSV_DELIMITER, $style);

        $this->executeSnapshot(
            $input,
            $output,
            self::EXPORT_FOLDER . $this->appLogFilePathResolver->getFileName()
        );

        $this->stopwatch->stop('export_app_logs');

        $monitorMemoryAndTime = $this->stopwatch
            ->getEvent('export_app_logs')
            ->__toString()
        ;

        $style->success(sprintf(
            "Command '%s' ended successfully. %s",
            self::CAPCO_EXPORT_APP_LOG,
            $monitorMemoryAndTime
        ));

        return 0;
    }

    public function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this
            ->setName(self::CAPCO_EXPORT_APP_LOG)
            ->setDescription('Export log admin')
        ;
    }
}
