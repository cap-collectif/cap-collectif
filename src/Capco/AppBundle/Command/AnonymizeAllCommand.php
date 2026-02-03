<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Command\LockableTrait;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Stopwatch\Stopwatch;

#[AsCommand(
    name: 'capco:anonymize:all',
    description: 'Bulk anonymize all users and participants with interactive confirmation and dry-run support (SQL batch)'
)]
class AnonymizeAllCommand extends Command
{
    use LockableTrait;

    private const DEFAULT_BATCH_SIZE = 1000;
    private const MAX_RECORDS = 1_000_000;
    private const STOP_WATCH_EVENT = 'ANONYMIZE_ALL';

    private readonly Connection $connection;

    /** @var null|resource */
    private $successLogHandle;
    /** @var null|resource */
    private $errorLogHandle;
    private ?string $successLogPath = null;
    private ?string $errorLogPath = null;
    /** @var string[] */
    private array $successLogBuffer = [];
    /** @var string[] */
    private array $errorLogBuffer = [];

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly Manager $toggleManager,
        private readonly LoggerInterface $logger,
        private readonly ParameterBagInterface $parameterBag,
    ) {
        parent::__construct();
        $this->connection = $this->em->getConnection();
    }

    protected function configure(): void
    {
        $this
            ->addOption(
                'dry-run',
                null,
                InputOption::VALUE_NONE,
                'Preview anonymization without executing'
            )
            ->addOption(
                'include-admins',
                null,
                InputOption::VALUE_NONE,
                'Include admin and super-admin users in anonymization'
            )
            ->addOption(
                'batch-size',
                null,
                InputOption::VALUE_REQUIRED,
                'Number of records to process per batch',
                self::DEFAULT_BATCH_SIZE
            )
            ->addOption(
                'force',
                null,
                InputOption::VALUE_NONE,
                'Skip confirmation prompt (dangerous)'
            )
            ->addOption(
                'force-reanonymize',
                null,
                InputOption::VALUE_NONE,
                'Re-anonymize records that were already anonymized'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        if (!$this->toggleManager->isActive(Manager::user_anonymization_automated)) {
            $io->warning(Manager::user_anonymization_automated . ' feature must be enabled');

            return Command::FAILURE;
        }

        if (!$this->lock()) {
            $io->warning('The command is already running in another process.');

            return Command::SUCCESS;
        }

        try {
            $isDryRun = $input->getOption('dry-run');
            $includeAdmins = $input->getOption('include-admins');
            $batchSize = max(1, (int) $input->getOption('batch-size'));
            $isForce = $input->getOption('force');
            $forceReanonymize = $input->getOption('force-reanonymize');

            $usersCount = $this->countUsersForAnonymization($includeAdmins, $forceReanonymize);
            $participantsCount = $this->countParticipantsForAnonymization($forceReanonymize);
            $totalCount = $usersCount + $participantsCount;

            if (0 === $totalCount) {
                $io->success('No users or participants to anonymize.');

                return Command::SUCCESS;
            }

            $this->displayPreview($io, $usersCount, $participantsCount, $includeAdmins, $forceReanonymize);

            if ($isDryRun) {
                $io->success('Dry-run complete. Run without --dry-run to execute.');

                return Command::SUCCESS;
            }

            if (!$isForce && !$this->confirmExecution($io, $usersCount, $participantsCount)) {
                $io->info('Operation aborted.');

                return Command::SUCCESS;
            }

            return $this->executeAnonymization($io, $includeAdmins, $forceReanonymize, $batchSize, $usersCount, $participantsCount);
        } finally {
            $this->release();
        }
    }

    private function countUsersForAnonymization(bool $includeAdmins, bool $forceReanonymize): int
    {
        $sql = 'SELECT COUNT(*) FROM fos_user WHERE 1=1';

        if (!$forceReanonymize) {
            $sql .= ' AND anonymized_at IS NULL';
        }

        if (!$includeAdmins) {
            $sql .= " AND roles NOT LIKE '%ROLE_ADMIN%' AND roles NOT LIKE '%ROLE_SUPER_ADMIN%'";
        }

        return (int) $this->connection->fetchOne($sql);
    }

    private function countParticipantsForAnonymization(bool $forceReanonymize): int
    {
        $sql = 'SELECT COUNT(*) FROM participant WHERE 1=1';

        if (!$forceReanonymize) {
            $sql .= ' AND anonymized_at IS NULL';
        }

        return (int) $this->connection->fetchOne($sql);
    }

    private function displayPreview(SymfonyStyle $io, int $usersCount, int $participantsCount, bool $includeAdmins, bool $forceReanonymize): void
    {
        $io->title('DRY-RUN PREVIEW');
        $io->table(
            ['Metric', 'Value'],
            [
                ['Users to anonymize', number_format($usersCount)],
                ['Participants to anonymize', number_format($participantsCount)],
                ['Total', number_format($usersCount + $participantsCount)],
                ['Admins included', $includeAdmins ? 'Yes' : 'No (use --include-admins to include)'],
                ['Re-anonymize already anonymized', $forceReanonymize ? 'Yes' : 'No (use --force-reanonymize to include)'],
            ]
        );

        $io->note([
            'All personal data will be permanently removed.',
            'User accounts will be locked.',
            'Contributions and events will NOT be modified.',
        ]);
    }

    private function confirmExecution(SymfonyStyle $io, int $usersCount, int $participantsCount): bool
    {
        $io->warning([
            'This operation is IRREVERSIBLE!',
            sprintf('You are about to anonymize %s users and %s participants.', number_format($usersCount), number_format($participantsCount)),
            'All their personal data will be permanently removed.',
        ]);

        $io->note('RECOMMENDED: Create a database backup before proceeding.');

        $confirmation = $io->ask(
            'Type "ANONYMIZE ALL" to confirm (or anything else to abort)'
        );

        return 'ANONYMIZE ALL' === $confirmation;
    }

    private function executeAnonymization(
        SymfonyStyle $io,
        bool $includeAdmins,
        bool $forceReanonymize,
        int $batchSize,
        int $usersCount,
        int $participantsCount
    ): int {
        $stopwatch = new Stopwatch();
        $stopwatch->start(self::STOP_WATCH_EVENT);

        $this->initLogFiles();

        $this->logger->info('Starting bulk anonymization (SQL batch)', [
            'includeAdmins' => $includeAdmins,
            'batchSize' => $batchSize,
            'totalUsers' => $usersCount,
            'totalParticipants' => $participantsCount,
        ]);

        $this->logSuccess(sprintf(
            'Starting anonymization - Users: %d, Participants: %d, Include admins: %s, Batch size: %d',
            $usersCount,
            $participantsCount,
            $includeAdmins ? 'yes' : 'no',
            $batchSize
        ));

        $totalProcessed = 0;
        $totalFailed = 0;

        // Anonymize users
        if ($usersCount > 0) {
            $io->section('Anonymizing Users');
            $result = $this->anonymizeUsersInBatches($io, $includeAdmins, $forceReanonymize, $batchSize, $usersCount);
            $totalProcessed += $result['processed'];
            $totalFailed += $result['failed'];

            if ($result['failed'] > 0) {
                $io->error('User anonymization stopped due to errors. Skipping participants.');

                return $this->finishExecution($io, $stopwatch, $totalProcessed, $totalFailed, $includeAdmins, $forceReanonymize);
            }
        }

        // Anonymize participants
        if ($participantsCount > 0) {
            $io->section('Anonymizing Participants');
            $result = $this->anonymizeParticipantsInBatches($io, $forceReanonymize, $batchSize, $participantsCount);
            $totalProcessed += $result['processed'];
            $totalFailed += $result['failed'];
        }

        return $this->finishExecution($io, $stopwatch, $totalProcessed, $totalFailed, $includeAdmins, $forceReanonymize);
    }

    /**
     * @return array{processed: int, failed: int}
     */
    private function anonymizeUsersInBatches(SymfonyStyle $io, bool $includeAdmins, bool $forceReanonymize, int $batchSize, int $totalCount): array
    {
        $progressBar = $io->createProgressBar($totalCount);
        $progressBar->setFormat(' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s%');
        $progressBar->start();

        $processed = 0;
        $failed = 0;
        $offset = 0;

        $this->initUsersBatchTemporaryTable();

        while ($offset < self::MAX_RECORDS) {
            try {
                $this->fillUsersBatchTemporaryTable($includeAdmins, $forceReanonymize, $batchSize, $offset);

                $batchIds = $this->getUsersBatchIds();
                $batchCount = \count($batchIds);

                if (0 === $batchCount) {
                    break;
                }

                $this->processUsersBatch();

                foreach ($batchIds as $id) {
                    $this->logSuccess(sprintf('OK | User ID: %s', $id));
                }

                $processed += $batchCount;
                $offset += $batchCount;

                $this->flushLogBuffers();
                $progressBar->advance($batchCount);
            } catch (\Exception $e) {
                $this->logger->error('Users batch failed', ['error' => $e->getMessage(), 'offset' => $offset]);
                $this->logError(sprintf('USERS BATCH FAILED at offset %d | Error: %s', $offset, $e->getMessage()));
                $failed += $batchSize;
                $this->flushLogBuffers();

                break;
            }
        }

        $progressBar->finish();
        $io->newLine();

        return ['processed' => $processed, 'failed' => $failed];
    }

    /**
     * @return array{processed: int, failed: int}
     */
    private function anonymizeParticipantsInBatches(SymfonyStyle $io, bool $forceReanonymize, int $batchSize, int $totalCount): array
    {
        $progressBar = $io->createProgressBar($totalCount);
        $progressBar->setFormat(' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s%');
        $progressBar->start();

        $processed = 0;
        $failed = 0;
        $offset = 0;

        $this->initParticipantsBatchTemporaryTable();

        while ($offset < self::MAX_RECORDS) {
            try {
                $this->fillParticipantsBatchTemporaryTable($forceReanonymize, $batchSize, $offset);

                $batchIds = $this->getParticipantsBatchIds();
                $batchCount = \count($batchIds);

                if (0 === $batchCount) {
                    break;
                }

                $this->processParticipantsBatch();

                foreach ($batchIds as $id) {
                    $this->logSuccess(sprintf('OK | Participant ID: %s', $id));
                }

                $processed += $batchCount;
                $offset += $batchCount;

                $this->flushLogBuffers();
                $progressBar->advance($batchCount);
            } catch (\Exception $e) {
                $this->logger->error('Participants batch failed', ['error' => $e->getMessage(), 'offset' => $offset]);
                $this->logError(sprintf('PARTICIPANTS BATCH FAILED at offset %d | Error: %s', $offset, $e->getMessage()));
                $failed += $batchSize;
                $this->flushLogBuffers();

                break;
            }
        }

        $progressBar->finish();
        $io->newLine();

        return ['processed' => $processed, 'failed' => $failed];
    }

    private function finishExecution(SymfonyStyle $io, Stopwatch $stopwatch, int $totalProcessed, int $totalFailed, bool $includeAdmins, bool $forceReanonymize): int
    {
        $event = $stopwatch->stop(self::STOP_WATCH_EVENT);

        $this->logger->info('Bulk anonymization completed', [
            'totalProcessed' => $totalProcessed,
            'totalFailed' => $totalFailed,
            'duration' => $event->getDuration(),
        ]);

        $this->logSuccess(sprintf(
            'Completed - Processed: %d, Failed: %d, Duration: %.2f seconds',
            $totalProcessed,
            $totalFailed,
            $event->getDuration() / 1000
        ));

        $this->closeLogFiles();

        $io->newLine(2);
        $io->title('ANONYMIZATION COMPLETE');
        $io->table(
            ['Metric', 'Value'],
            [
                ['Total processed', number_format($totalProcessed)],
                ['Failed', number_format($totalFailed)],
                ['Duration', sprintf('%.2f seconds', $event->getDuration() / 1000)],
                ['Memory used', sprintf('%.2f MB', $event->getMemory() / (1024 * 1024))],
            ]
        );

        $io->section('Log Files');
        $io->listing([
            sprintf('Success log: %s', $this->successLogPath),
            sprintf('Error log: %s', $this->errorLogPath),
        ]);

        if ($totalFailed > 0) {
            $remainingUsers = $this->countUsersForAnonymization($includeAdmins, $forceReanonymize);
            $remainingParticipants = $this->countParticipantsForAnonymization($forceReanonymize);
            $io->error([
                sprintf('Anonymization stopped due to errors. %d records failed.', $totalFailed),
                sprintf('Remaining: %d users, %d participants', $remainingUsers, $remainingParticipants),
                'Check error log for details, then re-run the command to continue.',
            ]);

            return Command::FAILURE;
        }

        $io->success('Bulk anonymization completed successfully.');

        return Command::SUCCESS;
    }

    // ========== Users batch methods ==========

    private function initUsersBatchTemporaryTable(): void
    {
        $this->connection->executeStatement('DROP TEMPORARY TABLE IF EXISTS matching_users_batch');
        $this->connection->executeStatement(
            'CREATE TEMPORARY TABLE matching_users_batch (id VARCHAR(255) COLLATE utf8mb4_unicode_ci, email VARCHAR(255) COLLATE utf8mb4_unicode_ci)'
        );
        $this->connection->executeStatement('CREATE UNIQUE INDEX idx_matching_users_batch_id ON matching_users_batch(id)');
        $this->connection->executeStatement('CREATE INDEX idx_matching_users_batch_email ON matching_users_batch(email)');
    }

    private function fillUsersBatchTemporaryTable(bool $includeAdmins, bool $forceReanonymize, int $batchSize, int $offset): void
    {
        $this->connection->executeStatement('TRUNCATE TABLE matching_users_batch');

        $sql = 'INSERT INTO matching_users_batch SELECT u.id, u.email FROM fos_user u WHERE 1=1';

        if (!$forceReanonymize) {
            $sql .= ' AND u.anonymized_at IS NULL';
        }

        if (!$includeAdmins) {
            $sql .= " AND u.roles NOT LIKE '%ROLE_ADMIN%' AND u.roles NOT LIKE '%ROLE_SUPER_ADMIN%'";
        }

        $sql .= sprintf(' ORDER BY u.id LIMIT %d OFFSET %d', $batchSize, $offset);

        $this->connection->executeStatement($sql);
    }

    /**
     * @return string[]
     */
    private function getUsersBatchIds(): array
    {
        return $this->connection->fetchFirstColumn('SELECT id FROM matching_users_batch');
    }

    private function processUsersBatch(): void
    {
        $this->deleteNewsletterSubscriptions();
        $this->deleteUserGroups();
        $this->deleteMailingListUsersForUsers();
        $this->deleteOrganizationMembers();
        $this->detachUserMedias();
        $this->anonymizeUsers();
    }

    private function deleteNewsletterSubscriptions(): void
    {
        $sql = 'DELETE ns FROM newsletter_subscription ns JOIN matching_users_batch mu ON mu.email = ns.email';
        $this->connection->executeStatement($sql);
    }

    private function deleteUserGroups(): void
    {
        $sql = 'DELETE uig FROM user_in_group uig JOIN matching_users_batch mu ON mu.id = uig.user_id';
        $this->connection->executeStatement($sql);
    }

    private function deleteMailingListUsersForUsers(): void
    {
        $sql = 'DELETE mlu FROM mailing_list_user mlu JOIN matching_users_batch mu ON mu.id = mlu.user_id';
        $this->connection->executeStatement($sql);
    }

    private function deleteOrganizationMembers(): void
    {
        $sql = 'DELETE om FROM organization_member om JOIN matching_users_batch mu ON mu.id = om.user_id';
        $this->connection->executeStatement($sql);
    }

    private function detachUserMedias(): void
    {
        $sql = 'UPDATE fos_user u JOIN matching_users_batch mu ON u.id = mu.id SET u.media_id = NULL';
        $this->connection->executeStatement($sql);
    }

    private function anonymizeUsers(): void
    {
        $sql = <<<'SQL'
            UPDATE fos_user u
            JOIN matching_users_batch mu ON mu.id = u.id
            SET
                u.email = NULL,
                u.email_canonical = NULL,
                u.username = 'Utilisateur supprimé',
                u.deleted_account_at = NOW(),
                u.password = NULL,
                u.last_login = NULL,
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
                u.openid_sessions_id = NULL,
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

    // ========== Participants batch methods ==========

    private function initParticipantsBatchTemporaryTable(): void
    {
        $this->connection->executeStatement('DROP TEMPORARY TABLE IF EXISTS matching_participants_batch');
        $this->connection->executeStatement(
            'CREATE TEMPORARY TABLE matching_participants_batch (id VARCHAR(255) COLLATE utf8mb4_unicode_ci, email VARCHAR(255) COLLATE utf8mb4_unicode_ci)'
        );
        $this->connection->executeStatement('CREATE UNIQUE INDEX idx_matching_participants_batch_id ON matching_participants_batch(id)');
        $this->connection->executeStatement('CREATE INDEX idx_matching_participants_batch_email ON matching_participants_batch(email)');
    }

    private function fillParticipantsBatchTemporaryTable(bool $forceReanonymize, int $batchSize, int $offset): void
    {
        $this->connection->executeStatement('TRUNCATE TABLE matching_participants_batch');

        $sql = 'INSERT INTO matching_participants_batch SELECT p.id, p.email FROM participant p WHERE 1=1';

        if (!$forceReanonymize) {
            $sql .= ' AND p.anonymized_at IS NULL';
        }

        $sql .= sprintf(' ORDER BY p.id LIMIT %d OFFSET %d', $batchSize, $offset);

        $this->connection->executeStatement($sql);
    }

    /**
     * @return string[]
     */
    private function getParticipantsBatchIds(): array
    {
        return $this->connection->fetchFirstColumn('SELECT id FROM matching_participants_batch');
    }

    private function processParticipantsBatch(): void
    {
        $this->deletePhoneVerificationSms();
        $this->deleteEmailingCampaignUsers();
        $this->deleteMailingListUsersForParticipants();
        $this->detachUserIdentificationCodes();
        $this->anonymizeParticipants();
    }

    private function deletePhoneVerificationSms(): void
    {
        $sql = 'DELETE pvs FROM participant_phone_verification_sms pvs JOIN matching_participants_batch mp ON mp.id = pvs.participant_id';
        $this->connection->executeStatement($sql);
    }

    private function deleteEmailingCampaignUsers(): void
    {
        $sql = 'DELETE ecu FROM emailing_campaign_user ecu JOIN matching_participants_batch mp ON mp.id = ecu.participant_id';
        $this->connection->executeStatement($sql);
    }

    private function deleteMailingListUsersForParticipants(): void
    {
        $sql = 'DELETE mlu FROM mailing_list_user mlu JOIN matching_participants_batch mp ON mp.id = mlu.participant_id';
        $this->connection->executeStatement($sql);
    }

    private function detachUserIdentificationCodes(): void
    {
        $sql = 'UPDATE participant p JOIN matching_participants_batch mp ON p.id = mp.id SET p.user_identification_code = NULL';
        $this->connection->executeStatement($sql);
    }

    private function anonymizeParticipants(): void
    {
        $sql = <<<'SQL'
            UPDATE participant p
            JOIN matching_participants_batch mp ON mp.id = p.id
            SET
                p.email = NULL,
                p.email_confirmation_sent_at = NULL,
                p.new_email_to_confirm = NULL,
                p.new_email_confirmation_token = NULL,
                p.confirmation_token = NULL,
                p.token = CONCAT('anonymized-', UUID()),
                p.username = 'Participant supprimé',
                p.lastname = NULL,
                p.firstname = NULL,
                p.phone = NULL,
                p.date_of_birth = NULL,
                p.phone_confirmed = FALSE,
                p.locale = NULL,
                p.postal_address = NULL,
                p.zip_code = NULL,
                p.consent_sms_communication = FALSE,
                p.consent_internal_communication = FALSE,
                p.consent_privacy_policy = FALSE,
                p.updated_at = NOW(),
                p.anonymized_at = NOW()
            SQL;

        $this->connection->executeStatement($sql);
    }

    // ========== Logging methods ==========

    private function initLogFiles(): void
    {
        /** @var string $logDir */
        $logDir = $this->parameterBag->get('kernel.logs_dir');
        $timestamp = (new \DateTime())->format('Ymd_His');

        $this->successLogPath = sprintf('%s/anonymize_all_%s_success.log', $logDir, $timestamp);
        $this->errorLogPath = sprintf('%s/anonymize_all_%s_errors.log', $logDir, $timestamp);

        $successHandle = fopen($this->successLogPath, 'w');
        $errorHandle = fopen($this->errorLogPath, 'w');

        if (false === $successHandle || false === $errorHandle) {
            throw new \RuntimeException('Failed to create log files');
        }

        $this->successLogHandle = $successHandle;
        $this->errorLogHandle = $errorHandle;

        $header = sprintf("Anonymization started at %s\n%s\n\n", date('Y-m-d H:i:s'), str_repeat('=', 60));
        fwrite($this->successLogHandle, $header);
        fwrite($this->errorLogHandle, $header);
    }

    private function closeLogFiles(): void
    {
        $this->flushLogBuffers();

        if ($this->successLogHandle) {
            fclose($this->successLogHandle);
            $this->successLogHandle = null;
        }
        if ($this->errorLogHandle) {
            fclose($this->errorLogHandle);
            $this->errorLogHandle = null;
        }
    }

    private function logSuccess(string $message): void
    {
        $this->successLogBuffer[] = sprintf('[%s] %s', date('Y-m-d H:i:s'), $message);
    }

    private function logError(string $message): void
    {
        $this->errorLogBuffer[] = sprintf('[%s] %s', date('Y-m-d H:i:s'), $message);
    }

    private function flushLogBuffers(): void
    {
        if ($this->successLogHandle && !empty($this->successLogBuffer)) {
            fwrite($this->successLogHandle, implode("\n", $this->successLogBuffer) . "\n");
            $this->successLogBuffer = [];
        }

        if ($this->errorLogHandle && !empty($this->errorLogBuffer)) {
            fwrite($this->errorLogHandle, implode("\n", $this->errorLogBuffer) . "\n");
            $this->errorLogBuffer = [];
        }
    }
}
