<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\FilePathResolver\UserGroupsFilePathResolver;
use Capco\AppBundle\Command\Service\UserGroupsExporter;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Stopwatch\Stopwatch;

class ExportUserGroupsCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    public const EXPORT_FOLDER = 'user-groups/';

    private const CAPCO_EXPORT_USER_GROUPS = 'capco:export:user-groups';
    private string $projectRootDir;

    public function __construct(
        ExportUtils $exportUtils,
        private readonly Manager $toggleManager,
        private readonly Stopwatch $stopwatch,
        private readonly UserGroupsExporter $userGroupsExporter,
        private readonly UserGroupsFilePathResolver $userGroupsFilePathResolver,
        string $projectRootDir
    ) {
        $this->projectRootDir = $projectRootDir;
        parent::__construct($exportUtils);
    }

    public function execute(InputInterface $input, OutputInterface $output): int
    {
        $style = new SymfonyStyle($input, $output);

        if (!$input->getOption('force') && !$this->toggleManager->isActive('export')) {
            $style->error('Please enable "export" feature to run this command');

            return 1;
        }

        $style->note('Starting the export.');
        $this->stopwatch->start('export_user_groups');
        $this->userGroupsExporter->initializeStyle($style);
        $this->userGroupsExporter->exportUserGroups($input->getOption('delimiter'));

        $this->executeSnapshot(
            $input,
            $output,
            self::EXPORT_FOLDER . $this->userGroupsFilePathResolver->getFileName()
        );

        $this->stopwatch->stop('export_user_groups');

        $monitoreMemoryAndTime = $this->stopwatch
            ->getEvent('export_user_groups')
            ->__toString()
        ;

        $style->success(sprintf(
            "Command '%s' ended successfully. %s",
            self::CAPCO_EXPORT_USER_GROUPS,
            $monitoreMemoryAndTime
        ));

        return 0;
    }

    public function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this
            ->setName(self::CAPCO_EXPORT_USER_GROUPS)
            ->setDescription('Export user groups')
        ;
    }
}
