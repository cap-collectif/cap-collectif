<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Toggle\Manager;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
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

    protected function configure(): void
    {
        $this->addOption(
            'startAt',
            null,
            InputOption::VALUE_REQUIRED,
            'Inclusive start date for the activity range (Y-m-d).'
        );
        $this->addOption(
            'endAt',
            null,
            InputOption::VALUE_REQUIRED,
            'Inclusive end date for the activity range (Y-m-d).'
        );
        $this->addOption(
            'dry-run',
            null,
            InputOption::VALUE_NONE,
            'Count identities that would be anonymized without changing any data.'
        );
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

        try {
            $dateRange = $this->resolveDateRange($input);
        } catch (\InvalidArgumentException $exception) {
            $io->error($exception->getMessage());

            return Command::INVALID;
        }

        if (null !== $dateRange) {
            $io->info(
                'Explicit date range: '
                . $dateRange['inclusiveStart']->format('Y-m-d')
                . ' to '
                . $dateRange['exclusiveEnd']->modify('-1 day')->format('Y-m-d')
            );
        } else {
            $io->info('Scheduled inactivity mode');
        }

        $stopwatch = new Stopwatch();
        $stopwatch->start(self::STOP_WATCH_EVENT);

        $this->createMatchingUsersTemporaryTable($dateLimit, $dateRange);
        $this->createMatchingParticipantsTemporaryTable($dateLimit, $dateRange);

        if ((bool) $input->getOption('dry-run')) {
            $userCount = (int) $this->connection->fetchOne('SELECT COUNT(*) FROM matching_users');
            $participantCount = (int) $this->connection->fetchOne(
                'SELECT COUNT(*) FROM matching_participants'
            );

            $io->section('Dry run');
            $io->writeln("Users to anonymize: {$userCount}");
            $io->writeln("Participants to anonymize: {$participantCount}");
            $io->writeln('Total people to anonymize: ' . ($userCount + $participantCount));
            $io->success('Dry run completed. No data was changed.');
            $stopwatch->stop(self::STOP_WATCH_EVENT);

            return Command::SUCCESS;
        }

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

        $io->info('Start Anonymizing Debate App Data');
        $this->deleteDebateVoteToken();
        $this->anonymizeDebateAnonymousArgument($dateLimit, $dateRange);
        $this->anonymizeDebateArgument();
        $this->anonymizeDebateVote();

        $io->info('Start Anonymizing Users');
        $this->anonymizeUser();

        $io->info('Start Deleting Participant Phone Verification Sms');
        $this->deleteParticipantPhoneVerificationSms();

        $io->info('Start Deleting Participant Mailing List User');
        $this->deleteParticipantMailingListUser();

        $io->info('Start Deleting Participant Newsletter Subscription');
        $this->deleteParticipantNewsletterSubscription();

        $io->info('Start Anonymizing Participants');
        $this->anonymizeParticipant();

        $io->success('Anonymization completed');

        $event = $stopwatch->stop(self::STOP_WATCH_EVENT);

        $io->info('Start time: ' . $event->getStartTime());
        $io->info('End time: ' . $event->getEndTime());
        $io->info('Duration: ' . $event->getDuration());
        $io->info('Memory used: ' . $event->getMemory() / (1024 * 1024) . ' MB');

        return Command::SUCCESS;
    }

    /**
     * @param null|array{inclusiveStart: \DateTimeImmutable, exclusiveEnd: \DateTimeImmutable} $dateRange
     */
    private function createMatchingUsersTemporaryTable(
        \DatetimeInterface $lastLoginLimit,
        ?array $dateRange = null
    ): void {
        $dateRangeCondition = '';
        $parameters = ['lastLoginLimit' => $lastLoginLimit->format('Y-m-d H:i:s')];

        if (null !== $dateRange) {
            $dateRangeCondition = ' AND u.last_login >= :startAt AND u.last_login < :endAt';
            $parameters = array_merge($parameters, $this->formatDateRangeSqlParameters($dateRange));
        }

        $this->connection->executeStatement('DROP TEMPORARY TABLE IF EXISTS matching_users');
        $this->connection->executeStatement(
            'CREATE TEMPORARY TABLE matching_users (
                id VARCHAR(255) COLLATE utf8mb4_unicode_ci,
                email VARCHAR(255) COLLATE utf8mb4_unicode_ci,
                UNIQUE INDEX idx_matching_users_email (email)
            )'
        );
        $this->connection->executeStatement(
            "INSERT INTO matching_users SELECT u.id, u.email FROM fos_user u LEFT JOIN organization_member om ON u.id = om.user_id WHERE (u.roles NOT LIKE '%ADMIN%' AND u.roles NOT LIKE '%MEDIATOR%') AND om.id IS NULL AND (u.last_login < :lastLoginLimit OR u.last_login IS NULL) AND u.anonymized_at IS NULL{$dateRangeCondition}",
            $parameters
        );
    }

    /**
     * @return null|array{inclusiveStart: \DateTimeImmutable, exclusiveEnd: \DateTimeImmutable}
     */
    private function resolveDateRange(InputInterface $input): ?array
    {
        $startAtOption = $input->getOption('startAt');
        $endAtOption = $input->getOption('endAt');
        $startAt = null === $startAtOption ? null : (string) $startAtOption;
        $endAt = null === $endAtOption ? null : (string) $endAtOption;

        if ((null === $startAt) !== (null === $endAt)) {
            throw new \InvalidArgumentException(
                'The --startAt and --endAt options must be used together.'
            );
        }

        if (null === $startAt) {
            return null;
        }

        $inclusiveStart = $this->parseDateOption($startAt);
        $inclusiveEnd = $this->parseDateOption($endAt);

        if ($inclusiveStart > $inclusiveEnd) {
            throw new \InvalidArgumentException(
                'The --startAt option must be earlier than or equal to --endAt.'
            );
        }

        return [
            'inclusiveStart' => $inclusiveStart,
            'exclusiveEnd' => $inclusiveEnd->modify('+1 day'),
        ];
    }

    private function parseDateOption(string $value): \DateTimeImmutable
    {
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        $errors = \DateTimeImmutable::getLastErrors();

        if (
            false === $date
            || (false !== $errors && (0 < $errors['warning_count'] || 0 < $errors['error_count']))
            || $date->format('Y-m-d') !== $value
        ) {
            throw new \InvalidArgumentException(
                'The --startAt and --endAt options must use the Y-m-d format.'
            );
        }

        return $date;
    }

    /**
     * @param array{inclusiveStart: \DateTimeImmutable, exclusiveEnd: \DateTimeImmutable} $dateRange
     *
     * @return array{startAt: string, endAt: string}
     */
    private function formatDateRangeSqlParameters(array $dateRange): array
    {
        return [
            'startAt' => $dateRange['inclusiveStart']->format('Y-m-d H:i:s'),
            'endAt' => $dateRange['exclusiveEnd']->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * @param null|array{inclusiveStart: \DateTimeImmutable, exclusiveEnd: \DateTimeImmutable} $dateRange
     */
    private function createMatchingParticipantsTemporaryTable(
        \DatetimeInterface $lastContributedAtLimit,
        ?array $dateRange = null
    ): void {
        $dateRangeCondition = '';
        $parameters = [
            'lastContributedAtLimit' => $lastContributedAtLimit->format('Y-m-d H:i:s'),
        ];

        if (null !== $dateRange) {
            $dateRangeCondition = ' AND p.last_contributed_at >= :startAt AND p.last_contributed_at < :endAt';
            $parameters = array_merge($parameters, $this->formatDateRangeSqlParameters($dateRange));
        }

        $this->connection->executeStatement('DROP TEMPORARY TABLE IF EXISTS matching_participants');
        $this->connection->executeStatement(
            'CREATE TEMPORARY TABLE matching_participants (
                id VARCHAR(255) COLLATE utf8mb4_unicode_ci,
                email VARCHAR(255) COLLATE utf8mb4_unicode_ci,
                INDEX idx_matching_participants_id (id),
                INDEX idx_matching_participants_email (email)
            )'
        );
        $this->connection->executeStatement(
            'INSERT INTO matching_participants SELECT p.id, p.email FROM participant p WHERE p.last_contributed_at < :lastContributedAtLimit AND p.anonymized_at IS NULL' . $dateRangeCondition,
            $parameters
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

    private function deleteParticipantPhoneVerificationSms(): void
    {
        $sql = 'DELETE ppvs FROM participant_phone_verification_sms ppvs JOIN matching_participants mp ON mp.id = ppvs.participant_id';
        $this->connection->executeStatement($sql);
    }

    private function deleteParticipantMailingListUser(): void
    {
        $sql = 'DELETE mlu FROM mailing_list_user mlu JOIN matching_participants mp ON mp.id = mlu.participant_id';
        $this->connection->executeStatement($sql);
    }

    private function deleteParticipantNewsletterSubscription(): void
    {
        $sql = 'DELETE ns FROM newsletter_subscription ns JOIN matching_participants mp ON mp.email = ns.email';
        $this->connection->executeStatement($sql);
    }

    private function deleteDebateVoteToken(): void
    {
        $sql = 'DELETE dvt FROM debate_vote_token dvt JOIN matching_users mu ON mu.id = dvt.user_id';
        $this->connection->executeStatement($sql);
    }

    private function anonymizeDebateArgument(): void
    {
        $sql = 'UPDATE debate_argument da JOIN matching_users mu ON mu.id = da.author_id SET da.ip_address = NULL, da.navigator = NULL';
        $this->connection->executeStatement($sql);
    }

    /**
     * @param null|array{inclusiveStart: \DateTimeImmutable, exclusiveEnd: \DateTimeImmutable} $dateRange
     */
    private function anonymizeDebateAnonymousArgument(
        \DatetimeInterface $dateLimit,
        ?array $dateRange = null
    ): void {
        $dateRangeCondition = '';
        $parameters = ['dateLimit' => $dateLimit->format('Y-m-d H:i:s')];

        if (null !== $dateRange) {
            $dateRangeCondition = ' AND daa.created_at >= :startAt AND daa.created_at < :endAt';
            $parameters = array_merge($parameters, $this->formatDateRangeSqlParameters($dateRange));
        }

        $sql = <<<'SQL'
            UPDATE debate_anonymous_argument daa
            SET
                daa.email = '',
                daa.username = 'Utilisateur supprimé',
                daa.ip_address = NULL,
                daa.navigator = NULL,
                daa.consent_internal_communication = FALSE
            WHERE daa.created_at < :dateLimit
            SQL;
        $this->connection->executeStatement($sql . $dateRangeCondition, $parameters);
    }

    private function anonymizeDebateVote(): void
    {
        $sql = "UPDATE votes v
                JOIN matching_users mu ON mu.id = v.voter_id
                SET v.ip_address = NULL, v.navigator = NULL
                WHERE v.voteType IN ('debate', 'debateArgument', 'debateAnonymousArgument')";
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

    private function anonymizeParticipant(): void
    {
        $sql = <<<'SQL'
                        UPDATE participant p
                        JOIN matching_participants mp ON mp.id = p.id
                        SET
                            p.email = NULL,
                            p.lastname = NULL,
                            p.firstname = NULL,
                            p.phone = NULL,
                            p.postal_address = NULL,
                            p.zip_code = NULL,
                            p.date_of_birth = NULL,
                            p.username = 'Utilisateur supprimé',
                            p.phone_confirmed = FALSE,
                            p.email_confirmation_sent_at = NULL,
                            p.new_email_to_confirm = NULL,
                            p.new_email_confirmation_token = NULL,
                            p.confirmation_token = NULL,
                            p.locale = NULL,
                            p.consent_sms_communication = FALSE,
                            p.consent_internal_communication = FALSE,
                            p.consent_privacy_policy = FALSE,
                            p.last_contributed_at = NULL,
                            p.user_identification_code = NULL,
                            p.updated_at = NOW(),
                            p.anonymized_at = NOW()
            SQL;

        $this->connection->executeStatement($sql);
    }
}
