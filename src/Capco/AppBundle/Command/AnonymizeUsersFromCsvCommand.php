<?php

namespace Capco\AppBundle\Command;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Stopwatch\Stopwatch;

#[AsCommand(name: 'capco:anonymize_users_from_csv', description: 'Anonymize users from a CSV file')]
class AnonymizeUsersFromCsvCommand extends Command
{
    private const STOP_WATCH_EVENT = 'ANONYMIZE_USERS';

    private const ALLOWED_FIELDS = ['email', 'openid_id', 'id'];

    private readonly Connection $connection;

    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {
        parent::__construct();
        $this->connection = $this->entityManager->getConnection();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('file', InputArgument::REQUIRED, 'Absolute path to the CSV file')
            ->addOption('field', null, InputArgument::OPTIONAL, 'Field to match user (email or openid_id or id)', 'email')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $filePath = $input->getArgument('file');

        if (!file_exists($filePath)) {
            $io->error("File not found: {$filePath}");

            return Command::FAILURE;
        }

        $fileSystem = new FileSystem();
        $tempFilePath = '/tmp/anonymize_users.csv';
        $fileSystem->copy($filePath, $tempFilePath);

        $io->info("Starting anonymizing users from: {$filePath}");

        $field = $input->getOption('field');

        if (!\in_array($field, self::ALLOWED_FIELDS)) {
            $io->error("Invalid field: {$field}, allowed values: " . implode(', ', self::ALLOWED_FIELDS));

            return Command::FAILURE;
        }

        $stopwatch = new Stopwatch();
        $stopwatch->start(self::STOP_WATCH_EVENT);

        $this->createCSVTemporaryTable();
        $this->insertCSVDataInTemporaryTable($tempFilePath);
        $this->sanitizeRows();
        $this->createMatchingUsersTemporaryTable($field);

        $io->info('Start Deleting Medias');
        $this->deleteMedias();

        $io->info('Start Deleting Organization Member');
        $this->deleteOrganizationMember();

        $io->info('Start Deleting Mailing List User');
        $this->deleteMailingListUser();

        $io->info('Start Deleting User in Group');
        $this->deleteUserInGroup();

        $io->info('Start Deleting Newsletter Subscription');
        $this->deleteNewsletterSubscription();

        $io->info('Start Anonymizing Users');
        $this->anonymizeUser();

        $io->success('Anonymization completed');

        $event = $stopwatch->stop(self::STOP_WATCH_EVENT);

        $io->info('Start time: ' . $event->getStartTime());
        $io->info('End time: ' . $event->getEndTime());
        $io->info('Duration: ' . $event->getDuration());
        $io->info('Memory used: ' . $event->getMemory());

        return Command::SUCCESS;
    }

    private function createCSVTemporaryTable(string $tableName = 'temp_csv'): void
    {
        $this->connection->executeStatement("CREATE TEMPORARY TABLE {$tableName} (id VARCHAR(255))");
        $this->connection->executeStatement("CREATE INDEX idx_{$tableName} ON {$tableName} (id)");
    }

    private function insertCSVDataInTemporaryTable(string $filename, string $tableName = 'temp_csv'): void
    {
        $sql = <<<SQL
                        LOAD DATA INFILE '{$filename}'
                        INTO TABLE {$tableName}
                        FIELDS TERMINATED BY ','
                        LINES TERMINATED BY '\n'
                        (id)
            SQL;

        $this->connection->executeStatement($sql);
    }

    private function sanitizeRows(string $tableName = 'temp_csv'): void
    {
        $this->connection->executeStatement("UPDATE {$tableName} SET id = REPLACE(REPLACE(id, CHAR(13), ''), CHAR(10), '')");
    }

    private function createMatchingUsersTemporaryTable(string $field): void
    {
        $this->connection->executeStatement('CREATE TEMPORARY TABLE matching_users (id VARCHAR(255), email VARCHAR(255))');
        $this->connection->executeStatement('CREATE UNIQUE INDEX idx_matching_users_email ON matching_users(email)');
        $this->connection->executeStatement("INSERT INTO matching_users SELECT u.id, u.email FROM fos_user u JOIN temp_csv tmp on u.{$field} = tmp.id");
    }

    private function deleteMedias(): void
    {
        $sql = 'DELETE m
                FROM media__media m
                JOIN fos_user u ON m.id = u.media_id
                JOIN matching_users mu ON u.id = mu.id';
        $this->connection->executeStatement($sql);
    }

    private function deleteNewsletterSubscription(): void
    {
        $sql = 'DELETE ns FROM newsletter_subscription ns JOIN matching_users mu ON mu.email = ns.email';
        $this->connection->executeStatement($sql);
    }

    private function deleteUserInGroup(): void
    {
        $sql = 'DELETE uig FROM user_in_group uig JOIN matching_users mu ON mu.id = uig.user_id';
        $this->connection->executeStatement($sql);
    }

    private function deleteOrganizationMember(): void
    {
        $sql = 'DELETE om FROM organization_member om JOIN matching_users mu ON mu.id = om.user_id';
        $this->connection->executeStatement($sql);
    }

    private function deleteMailingListUser(): void
    {
        $sql = 'DELETE mlu FROM mailing_list_user mlu  JOIN matching_users mu ON mu.id = mlu.user_id';
        $this->connection->executeStatement($sql);
    }

    private function anonymizeUser(): void
    {
        $sql = <<<'SQL'
                        UPDATE fos_user SET
                            email = NULL,
                            email_canonical = NULL,
                            username = 'Utilisateur supprimé',
                            deleted_account_at = NOW(),
                            password = NULL,
                            last_login = NULL,
                            media_id = NULL,
                            facebook_id = NULL,
                            facebook_url = NULL,
                            facebook_access_token = NULL,
                            cas_id = NULL,
                            twitter_id = NULL,
                            twitter_url = NULL,
                            twitter_access_token = NULL,
                            openid_id = NULL,
                            openid_access_token = NULL,
                            france_connect_id = NULL,
                            france_connect_access_token = NULL,
                            address = NULL,
                            address2 = NULL,
                            zip_code = NULL,
                            neighborhood = NULL,
                            phone = NULL,
                            city = NULL,
                            biography = NULL,
                            date_of_birth = NULL,
                            firstname = NULL,
                            lastname = NULL,
                            website = NULL,
                            gender = NULL,
                            locale = NULL,
                            locked = TRUE,
                            openid_sessions_id = null,
                            consent_external_communication = FALSE,
                            consent_internal_communication = FALSE,
                            email_confirmation_sent_at = NULL,
                            username_canonical = 'Utilisateur supprimé',
                            slug = CONCAT('utilisateursupprime-', UUID()),
                            updated_at = NOW()
                        WHERE id in (SELECT id FROM matching_users)
            SQL;

        $this->connection->executeStatement($sql);
    }
}
