<?php

namespace Capco\AppBundle\Command;

use Box\Spout\Common\Type;
use Box\Spout\Writer\Common\Creator\WriterEntityFactory;
use Box\Spout\Writer\WriterInterface;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Toggle\Manager;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Command\Utils\ExportUtils;
use Capco\AppBundle\Traits\SnapshotCommandTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Process\Process;
use Doctrine\DBAL\Connection;

class CreateCsvFromUsersCommand extends BaseExportCommand
{
    use SnapshotCommandTrait;

    const SQL_QUERY = <<<'EOF'
    select * from (
    (select 'id', 'username', 'email', 'emailConfirmed', 'role','createdAt', 'updatedAt','lastLogin' , 'enabled','confirmedAccountAt' ,'locked', 'gender', 'firstname', 'lastname','dateOfBirth', 'websiteUrl' ,'biography',  'address','deletedAccountAt' , 'facebookId' , 'status', 'internalComm' , 'externalComm', 'userIdentificationCode')
    UNION  (select DISTINCT(u.id), IFNULL(u.username, '') as username, u.email, IF(ISNULL(u.confirmation_token), 'YES', 'NO') as emailConfirmed,
    CASE
        WHEN u.roles LIKE '%%ROLE_ADMIN%%' THEN "Administrateur"
        WHEN u.roles LIKE '%%ROLE_PROJECT_ADMIN%%' THEN "Créateur de projet"
        WHEN u.roles LIKE '%%ROLE_USER%%' THEN "Utilisateur"
        ELSE 'Utilisateur'
     END AS role, u.created_at as createdAt, IFNULL(u.updated_at, '') as updatedAt, IFNULL(u.last_login, '') as lastLogin,
     IF(u.enabled = 0 , 'NO', 'YES') as enabled, IFNULL(u.confirmed_account_at, '') as confirmedAccountAt,
     IF(u.locked = 0 , 'NO', 'YES') as locked,IFNULL(u.gender, '') as gender, IFNULL(u.firstname, '') as firstname, IFNULL(u.lastname, '') as lastname, IFNULL(u.date_of_birth, '') as dateOfBirth, IFNULL(u.website_url, '') as websiteUrl, IFNULL(u.biography, ''), IFNULL(u.address, ''), IFNULL(u.deleted_account_at, '') as deletedAccountAt, IFNULL(u.facebook_id, '') as facebookId, IFNULL(utt.name, ''), IF(u.consent_internal_communication = 0 , 'NO', 'YES') as internalComm, IF(u.consent_external_communication = 0 , 'NO', 'YES') as externalComm, IFNULL(u.user_identification_code, '') as userIdentificationCode from fos_user u left join user_type ut on u.user_type_id = ut.id left join user_type_translation utt on utt.translatable_id  = ut.id WHERE  u.roles not like "%s" AND (utt.locale = "%s" OR utt.locale IS NULL) ORDER BY u.created_at )
    ) a;
EOF;

    protected string $projectRootDir;
    protected WriterInterface $writer;
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

    public static function export(
        string $defaultLocale,
        Connection $em,
        string $delimiter = ';'
    ): void {
        if (file_exists('/tmp/users.csv')) {
            Process::fromShellCommandline('rm -f ' . '/tmp/users.csv')->mustRun();
        }

        $sql = sprintf(self::SQL_QUERY, '%SUPER%', $defaultLocale);
        if (!file_exists('/tmp/users.csv')) {
            $data = $em->executeQuery($sql);
            $writer = WriterFactory::create(Type::CSV, $delimiter);
            $writer->openToFile(sprintf('/tmp/%s', 'users.csv'));
            foreach ($data as $row) {
                $writer->addRow(WriterEntityFactory::createRowFromArray($row));
            }
        }

        Process::fromShellCommandline(
            'mv /tmp/users.csv /var/www/public/export/users.csv'
        )->mustRun();
    }

    protected function configure(): void
    {
        parent::configure();
        $this->configureSnapshot();
        $this->setName('capco:export:users')->setDescription('Create csv file from users data');
        $this->addOption(
            'updateSnapshot',
            'u',
            InputOption::VALUE_NONE,
            '/!\ Dev only. This will re-generate snapshot artifacts for current RGPD archive.'
        );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        if (!$this->toggleManager->isActive(Manager::export)) {
            $output->writeln('Feature "export" must be enabled.');

            return 1;
        }
        $delimiter = $input->getOption('delimiter');

        self::export(
            $this->localeRepository->getDefaultCode(),
            $this->em->getConnection(),
            $delimiter
        );

        $this->executeSnapshot($input, $output, 'users.csv');

        return 0;
    }
}
