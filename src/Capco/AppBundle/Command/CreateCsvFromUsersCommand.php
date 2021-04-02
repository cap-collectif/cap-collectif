<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Process\Process;

class CreateCsvFromUsersCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    protected string $projectRootDir;
    private Manager $toggleManager;
    private EntityManagerInterface $em;
    private LocaleRepository $localeRepository;
    private string $env;

    public function __construct(
        EntityManagerInterface $em,
        ExportUtils $exportUtils,
        Manager $toggleManager,
        LocaleRepository $localeRepository,
        string $projectRootDir,
        string $env
    ) {
        $this->projectRootDir = $projectRootDir;
        $this->toggleManager = $toggleManager;
        $this->localeRepository = $localeRepository;
        $this->em = $em;
        $this->env = $env;

        parent::__construct($exportUtils);
    }

    const SQL_QUERY = <<<EOF
        select * from (
        (select 'id', 'username', 'email', 'createdAt', 'updatedAt','lastLogin' , 'enabled','confirmedAccountAt' ,'locked', 'gender', 'firstname', 'lastname','dateOfBirth', 'websiteUrl' ,'biography',  'address','deletedAccountAt' , 'facebookId' , 'status', 'internalComm' , 'externalComm') 
        UNION  (select DISTINCT(u.id), IFNULL(u.username, 'N/A') as username, u.email, u.created_at as createdAt, IFNULL(u.updated_at, 'N/A') as updatedAt, IFNULL(u.last_login, 'N/A') as lastLogin,
         IF(u.enabled = 0 , 'No', 'YES') as enabled, IFNULL(u.confirmed_account_at, 'N/A') as confirmedAccountAt, 
         IF(u.locked = 0 , 'No', 'YES') as locked,IFNULL(u.gender, 'N/A') as gender, IFNULL(u.firstname, 'N/A') as firstname, IFNULL(u.lastname, 'N/A') as lastname, IFNULL(u.date_of_birth, 'N/A') as dateOfBirth, IFNULL(u.website_url, 'N/A') as websiteUrl, IFNULL(u.biography, 'N/A'), IFNULL(u.address, 'N/A'), IFNULL(u.deleted_account_at, 'N/A') as deletedAccountAt, IFNULL(u.facebook_id, 'N/A') as facebookId, IFNULL(utt.name, 'N/A'), IF(u.consent_internal_communication = 0 , 'No', 'YES') as internalComm, IF(u.consent_external_communication = 0 , 'No', 'YES') as externalComm from fos_user u left join user_type ut on u.user_type_id = ut.id left join user_type_translation utt on utt.translatable_id  = ut.id WHERE  u.roles not like "%s" AND (utt.locale = "%s" OR utt.locale IS NULL) ORDER BY u.created_at )
        ) a INTO OUTFILE '/tmp/users.csv' FIELDS ENCLOSED BY '"' TERMINATED BY ',' ESCAPED BY '"' LINES TERMINATED BY '\r\n';
    EOF;

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setName('capco:export:users')->setDescription(
            'Create csv file from users data'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$this->toggleManager->isActive(Manager::export)) {
            $output->writeln('Feature "export" must be enabled.');

            return 1;
        }

        $this->export();

        $this->executeSnapshot($input, $output, 'users.csv');

        return 0;
    }

    private function export():void
    {
        if (file_exists('/tmp/users.csv')) {
            (Process::fromShellCommandline('rm -rf ' . '/tmp/users.csv'))->mustRun();
        }

        $defaultLocale = $this->localeRepository->getDefaultCode();
        $sql = sprintf(self::SQL_QUERY,"%SUPER%", $defaultLocale);
        if (!file_exists('/tmp/users.csv')) {
            $this->em->getConnection()->executeQuery($sql);
        }

        (Process::fromShellCommandline("mv /tmp/users.csv /var/www/public/export/users.csv"))->mustRun();
    }
}
