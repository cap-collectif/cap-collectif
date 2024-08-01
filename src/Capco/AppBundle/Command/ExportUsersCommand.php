<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Command\Service\FilePathResolver\UsersFilePathResolver;
use Capco\AppBundle\Command\Service\UserExporter;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Exception\LocaleConfigurationException;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Stopwatch\Stopwatch;

class ExportUsersCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;
    public const EXPORT_FOLDER = 'users/';

    private const CAPCO_EXPORT_USERS = 'capco:export:users';
    private Manager $toggleManager;
    private string $projectRootDir;
    private Stopwatch $stopwatch;
    private UserExporter $userExporter;
    private UsersFilePathResolver $usersFilePathResolver;

    public function __construct(
        ExportUtils $exportUtils,
        Manager $manager,
        Stopwatch $stopwatch,
        UserExporter $userExporter,
        UsersFilePathResolver $usersFilePathResolver,
        string $projectRootDir
    ) {
        $this->toggleManager = $manager;
        $this->projectRootDir = $projectRootDir;
        $this->userExporter = $userExporter;
        $this->stopwatch = $stopwatch;
        $this->usersFilePathResolver = $usersFilePathResolver;
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
        $this->stopwatch->start('export_users');
        $this->userExporter->initializeStyle($style);
        $this->userExporter->exportUsers($input->getOption('delimiter'));

        $this->executeSnapshot(
            $input,
            $output,
            self::EXPORT_FOLDER . $this->usersFilePathResolver->getFileName()
        );

        $this->stopwatch->stop('export_users');

        $monitoreMemoryAndTime = $this->stopwatch
            ->getEvent('export_users')
            ->__toString()
        ;

        $style->success(sprintf(
            "Command '%s' ended successfully. %s",
            self::CAPCO_EXPORT_USERS,
            $monitoreMemoryAndTime
        ));

        return 0;
    }

    public function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this
            ->setName(self::CAPCO_EXPORT_USERS)
            ->setDescription('Export users')
        ;
    }
}
