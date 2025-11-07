<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Stopwatch\Stopwatch;

#[AsCommand(name: 'capco:anonymize_users_automated', description: 'Anonymize users automated')]
class AnonymizeUsersAutomatedCommand extends Command
{
    private const STOP_WATCH_EVENT = 'ANONYMIZE_USERS';

    private readonly Connection $connection;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly int $anonymizationInactivityDays,
        private readonly int $anonymizationInactivityEmailReminderDays,
        private readonly Manager $manager,
        private readonly LoggerInterface $logger,
    ) {
        parent::__construct();
        $this->connection = $this->entityManager->getConnection();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        if (!$this->manager->isActive(Manager::user_anonymization_automated)) {
            $this->logger->warning(Manager::user_anonymization_automated . ' feature must be enabled');
            $io->warning(Manager::user_anonymization_automated . ' feature must be enabled');

            return 0;
        }

        $limit = $this->anonymizationInactivityDays + $this->anonymizationInactivityEmailReminderDays;
        $dateLimit = (new \DateTimeImmutable())->modify('-' . $limit . ' days');

        $stopwatch = new Stopwatch();
        $stopwatch->start(self::STOP_WATCH_EVENT);

        $this->createMatchingUsersTemporaryTable($dateLimit);

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
        $io->info('Memory used: ' . $event->getMemory() / (1024 * 1024) . ' MB');

        return Command::SUCCESS;
    }

    private function createMatchingUsersTemporaryTable(\DatetimeInterface $lastLoginLimit): void
    {
        $this->connection->executeStatement('CREATE TEMPORARY TABLE matching_users (id VARCHAR(255) COLLATE utf8mb4_unicode_ci, email VARCHAR(255) COLLATE utf8mb4_unicode_ci)');
        $this->connection->executeStatement('CREATE UNIQUE INDEX idx_matching_users_email ON matching_users(email)');
        $this->connection->executeStatement(
            "INSERT INTO matching_users SELECT u.id, u.email FROM fos_user u LEFT JOIN organization_member om ON u.id = om.user_id WHERE (u.roles NOT LIKE '%ADMIN%' AND u.roles NOT LIKE '%MEDIATOR%') AND om.id IS NULL AND (u.last_login < :lastLoginLimit OR u.last_login IS NULL) AND u.anonymized_at IS NULL",
            ['lastLoginLimit' => $lastLoginLimit->format('Y-m-d H:i:s')]
        );
    }

    private function deleteMedias(): void
    {
        $sql = 'UPDATE fos_user u
                JOIN matching_users mu ON u.id = mu.id
                SET u.media_id = null';
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
                        UPDATE fos_user u
                        JOIN matching_users mu ON mu.id = u.id
                        SET
                            u.email = NULL,
                            u.email_canonical = NULL,
                            u.username = 'Utilisateur supprimé',
                            u.deleted_account_at = NOW(),
                            u.password = NULL,
                            u.last_login = NULL,
                            u.media_id = NULL,
                            u.facebook_id = NULL,
                            u.facebook_url = NULL,
                            u.facebook_access_token = NULL,
                            u.cas_id = NULL,
                            u.twitter_id = NULL,
                            u.twitter_url = NULL,
                            u.twitter_access_token = NULL,
                            u.openid_id = NULL,
                            u.openid_access_token = NULL,
                            u.france_connect_id = NULL,
                            u.france_connect_access_token = NULL,
                            u.address = NULL,
                            u.address2 = NULL,
                            u.zip_code = NULL,
                            u.neighborhood = NULL,
                            u.phone = NULL,
                            u.city = NULL,
                            u.biography = NULL,
                            u.date_of_birth = NULL,
                            u.firstname = NULL,
                            u.lastname = NULL,
                            u.website = NULL,
                            u.gender = NULL,
                            u.locale = NULL,
                            u.locked = TRUE,
                            u.openid_sessions_id = null,
                            u.consent_external_communication = FALSE,
                            u.consent_internal_communication = FALSE,
                            u.email_confirmation_sent_at = NULL,
                            u.birth_place = NULL,
                            u.username_canonical = 'Utilisateur supprimé',
                            u.slug = CONCAT('utilisateursupprime-', UUID()),
                            u.updated_at = NOW(),
                            u.anonymized_at = NOW()
            SQL;

        $this->connection->executeStatement($sql);
    }
}
