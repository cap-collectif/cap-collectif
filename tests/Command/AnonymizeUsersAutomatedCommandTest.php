<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\MailingListUser;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\ParticipantPhoneVerificationSms;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Qandidate\Toggle\ContextFactory;
use Symfony\Component\Console\Command\Command;

/**
 * @internal
 * @coversNothing
 */
class AnonymizeUsersAutomatedCommandTest extends DatabaseCommandTestCase
{
    private const COMMAND = 'capco:anonymize_users_automated';

    private Manager $featureManager;
    private bool $initialFeatureState;

    protected function setUp(): void
    {
        parent::setUp();

        $featureManager = self::getContainer()->get(Manager::class);
        \assert($featureManager instanceof Manager);
        $this->featureManager = $featureManager;

        $contextFactory = self::getContainer()->get('qandidate.toggle.user_context_factory');
        \assert($contextFactory instanceof ContextFactory);
        $this->initialFeatureState = $this->featureManager
            ->getToggleManager()
            ->active(Manager::user_anonymization_automated, $contextFactory->createContext())
        ;
        $this->featureManager->activate(Manager::user_anonymization_automated);
    }

    protected function tearDown(): void
    {
        $this->initialFeatureState
            ? $this->featureManager->activate(Manager::user_anonymization_automated)
            : $this->featureManager->deactivate(Manager::user_anonymization_automated);

        parent::tearDown();
    }

    public function testAnonymizesOnlyInactiveUserInsideExplicitDateRange(): void
    {
        $userInsideRange = $this->entityManager->find(User::class, 'user190');
        $userOutsideRange = $this->entityManager->find(User::class, 'user191');
        $userAfterRange = $this->entityManager->find(User::class, 'user192');
        self::assertInstanceOf(User::class, $userInsideRange);
        self::assertInstanceOf(User::class, $userOutsideRange);
        self::assertInstanceOf(User::class, $userAfterRange);

        $userInsideRange->setLastLogin(new \DateTime('2020-01-01 00:00:00'));
        $userInsideRange->setAnonymizedAt(null);
        $userOutsideRange->setLastLogin(new \DateTime('2019-12-31 23:59:59'));
        $userOutsideRange->setAnonymizedAt(null);
        $userAfterRange->setLastLogin(new \DateTime('2020-02-01 00:00:00'));
        $userAfterRange->setAnonymizedAt(null);
        $outsideRangeEmail = $userOutsideRange->getEmail();
        $afterRangeEmail = $userAfterRange->getEmail();
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([
            '--startAt' => '2020-01-01',
            '--endAt' => '2020-01-31',
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString(
            'Explicit date range: 2020-01-01 to 2020-01-31',
            $commandTester->getDisplay()
        );

        $this->entityManager->clear();
        $userInsideRange = $this->entityManager->find(User::class, 'user190');
        $userOutsideRange = $this->entityManager->find(User::class, 'user191');
        $userAfterRange = $this->entityManager->find(User::class, 'user192');
        self::assertInstanceOf(User::class, $userInsideRange);
        self::assertInstanceOf(User::class, $userOutsideRange);
        self::assertInstanceOf(User::class, $userAfterRange);
        self::assertNotNull($userInsideRange->getAnonymizedAt());
        self::assertNull($userInsideRange->getEmail());
        self::assertNull($userOutsideRange->getAnonymizedAt());
        self::assertSame($outsideRangeEmail, $userOutsideRange->getEmail());
        self::assertNull($userAfterRange->getAnonymizedAt());
        self::assertSame($afterRangeEmail, $userAfterRange->getEmail());
    }

    public function testRejectsAnExplicitDateRangeWithAMissingBoundary(): void
    {
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        $user->setLastLogin(new \DateTime('2020-01-15 12:00:00'));
        $user->setAnonymizedAt(null);
        $email = $user->getEmail();
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([
            '--startAt' => '2020-01-01',
        ]);

        self::assertSame(Command::INVALID, $commandTester->getStatusCode());
        self::assertStringContainsString(
            'The --startAt and --endAt options must be used together.',
            $commandTester->getDisplay()
        );

        $this->entityManager->clear();
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        self::assertNull($user->getAnonymizedAt());
        self::assertSame($email, $user->getEmail());
    }

    public function testRejectsAnExplicitDateRangeWithAnInvalidDate(): void
    {
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        $user->setLastLogin(new \DateTime('2020-01-15 12:00:00'));
        $user->setAnonymizedAt(null);
        $email = $user->getEmail();
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([
            '--startAt' => '2020-02-30',
            '--endAt' => '2020-03-31',
        ]);

        self::assertSame(Command::INVALID, $commandTester->getStatusCode());
        self::assertStringContainsString(
            'The --startAt and --endAt options must use the Y-m-d format.',
            $commandTester->getDisplay()
        );

        $this->entityManager->clear();
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        self::assertNull($user->getAnonymizedAt());
        self::assertSame($email, $user->getEmail());
    }

    public function testRejectsAnInvertedExplicitDateRange(): void
    {
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        $user->setLastLogin(new \DateTime('2020-01-15 12:00:00'));
        $user->setAnonymizedAt(null);
        $email = $user->getEmail();
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([
            '--startAt' => '2020-02-01',
            '--endAt' => '2020-01-31',
        ]);

        self::assertSame(Command::INVALID, $commandTester->getStatusCode());
        self::assertStringContainsString(
            'The --startAt option must be earlier than or equal to --endAt.',
            $commandTester->getDisplay()
        );

        $this->entityManager->clear();
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        self::assertNull($user->getAnonymizedAt());
        self::assertSame($email, $user->getEmail());
    }

    public function testAnonymizesOnlyInactiveParticipantInsideExplicitDateRange(): void
    {
        $participantInsideRange = $this->entityManager->find(Participant::class, 'participant3');
        $participantOutsideRange = $this->entityManager->find(
            Participant::class,
            'participantEmailingCampaign1'
        );
        $participantAtEndOfRange = $this->entityManager->find(
            Participant::class,
            'participantEmailingCampaign2'
        );
        $participantAfterRange = $this->entityManager->find(
            Participant::class,
            'participantEmailingCampaign3'
        );
        self::assertInstanceOf(Participant::class, $participantInsideRange);
        self::assertInstanceOf(Participant::class, $participantOutsideRange);
        self::assertInstanceOf(Participant::class, $participantAtEndOfRange);
        self::assertInstanceOf(Participant::class, $participantAfterRange);

        $participantInsideRange->setLastContributedAt(new \DateTime('2020-01-01 00:00:00'));
        $participantInsideRange->setAnonymizedAt(null);
        $participantOutsideRange->setLastContributedAt(new \DateTime('2019-12-31 23:59:59'));
        $participantOutsideRange->setAnonymizedAt(null);
        $participantAtEndOfRange->setLastContributedAt(new \DateTime('2020-01-31 23:59:59'));
        $participantAtEndOfRange->setAnonymizedAt(null);
        $participantAfterRange->setLastContributedAt(new \DateTime('2020-02-01 00:00:00'));
        $participantAfterRange->setAnonymizedAt(null);
        $outsideRangeEmail = $participantOutsideRange->getEmail();
        $afterRangeEmail = $participantAfterRange->getEmail();
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([
            '--startAt' => '2020-01-01',
            '--endAt' => '2020-01-31',
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());

        $this->entityManager->clear();
        $participantInsideRange = $this->entityManager->find(Participant::class, 'participant3');
        $participantOutsideRange = $this->entityManager->find(
            Participant::class,
            'participantEmailingCampaign1'
        );
        $participantAtEndOfRange = $this->entityManager->find(
            Participant::class,
            'participantEmailingCampaign2'
        );
        $participantAfterRange = $this->entityManager->find(
            Participant::class,
            'participantEmailingCampaign3'
        );
        self::assertInstanceOf(Participant::class, $participantInsideRange);
        self::assertInstanceOf(Participant::class, $participantOutsideRange);
        self::assertInstanceOf(Participant::class, $participantAtEndOfRange);
        self::assertInstanceOf(Participant::class, $participantAfterRange);
        self::assertNotNull($participantInsideRange->getAnonymizedAt());
        self::assertNull($participantInsideRange->getEmail());
        self::assertNull($participantOutsideRange->getAnonymizedAt());
        self::assertSame($outsideRangeEmail, $participantOutsideRange->getEmail());
        self::assertNotNull($participantAtEndOfRange->getAnonymizedAt());
        self::assertNull($participantAtEndOfRange->getEmail());
        self::assertNull($participantAfterRange->getAnonymizedAt());
        self::assertSame($afterRangeEmail, $participantAfterRange->getEmail());
    }

    public function testExplicitDateRangeOnlyAnonymizesAnonymousDebateArgumentsInsideRange(): void
    {
        $argumentInsideRange = $this->entityManager->find(
            DebateAnonymousArgument::class,
            'DebateAnonymousArgumentFor1'
        );
        $argumentOutsideRange = $this->entityManager->find(
            DebateAnonymousArgument::class,
            'DebateAnonymousArgumentAgainst1'
        );
        $argumentAfterRange = $this->entityManager->find(
            DebateAnonymousArgument::class,
            'daaEmailingFor'
        );
        self::assertInstanceOf(DebateAnonymousArgument::class, $argumentInsideRange);
        self::assertInstanceOf(DebateAnonymousArgument::class, $argumentOutsideRange);
        self::assertInstanceOf(DebateAnonymousArgument::class, $argumentAfterRange);

        $argumentInsideRange->setCreatedAt(new \DateTime('2020-01-31 23:59:59'));
        $argumentInsideRange->setEmail('inside-range@example.com');
        $argumentInsideRange->setUsername('Inside range');
        $argumentInsideRange->setConsentInternalCommunication(true);
        $argumentOutsideRange->setCreatedAt(new \DateTime('2019-12-31 23:59:59'));
        $argumentOutsideRange->setEmail('outside-range@example.com');
        $argumentOutsideRange->setUsername('Outside range');
        $argumentOutsideRange->setConsentInternalCommunication(true);
        $argumentAfterRange->setCreatedAt(new \DateTime('2020-02-01 00:00:00'));
        $argumentAfterRange->setEmail('after-range@example.com');
        $argumentAfterRange->setUsername('After range');
        $argumentAfterRange->setConsentInternalCommunication(true);
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([
            '--startAt' => '2020-01-01',
            '--endAt' => '2020-01-31',
        ]);

        self::assertSame(Command::SUCCESS, $commandTester->getStatusCode(), $commandTester->getDisplay());

        $this->entityManager->clear();
        $argumentInsideRange = $this->entityManager->find(
            DebateAnonymousArgument::class,
            'DebateAnonymousArgumentFor1'
        );
        $argumentOutsideRange = $this->entityManager->find(
            DebateAnonymousArgument::class,
            'DebateAnonymousArgumentAgainst1'
        );
        $argumentAfterRange = $this->entityManager->find(
            DebateAnonymousArgument::class,
            'daaEmailingFor'
        );
        self::assertInstanceOf(DebateAnonymousArgument::class, $argumentInsideRange);
        self::assertInstanceOf(DebateAnonymousArgument::class, $argumentOutsideRange);
        self::assertInstanceOf(DebateAnonymousArgument::class, $argumentAfterRange);
        self::assertSame('', $argumentInsideRange->getEmail());
        self::assertSame('Utilisateur supprimé', $argumentInsideRange->getUsername());
        self::assertFalse($argumentInsideRange->isConsentInternalCommunication());
        self::assertSame('outside-range@example.com', $argumentOutsideRange->getEmail());
        self::assertSame('Outside range', $argumentOutsideRange->getUsername());
        self::assertTrue($argumentOutsideRange->isConsentInternalCommunication());
        self::assertSame('after-range@example.com', $argumentAfterRange->getEmail());
        self::assertSame('After range', $argumentAfterRange->getUsername());
        self::assertTrue($argumentAfterRange->isConsentInternalCommunication());
    }

    public function testDryRunCountsMatchingIdentitiesWithoutAnonymizingThem(): void
    {
        $user = $this->entityManager->find(User::class, 'user190');
        $participant = $this->entityManager->find(Participant::class, 'participant3');
        self::assertInstanceOf(User::class, $user);
        self::assertInstanceOf(Participant::class, $participant);

        $user->setLastLogin(new \DateTime('1901-02-03 12:00:00'));
        $user->setAnonymizedAt(null);
        $participant->setLastContributedAt(new \DateTime('1901-02-03 12:00:00'));
        $participant->setAnonymizedAt(null);
        $userEmail = $user->getEmail();
        $participantEmail = $participant->getEmail();
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([
            '--startAt' => '1901-02-03',
            '--endAt' => '1901-02-03',
            '--dry-run' => true,
        ]);

        self::assertSame(Command::SUCCESS, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString('Users to anonymize: 1', $commandTester->getDisplay());
        self::assertStringContainsString('Participants to anonymize: 1', $commandTester->getDisplay());
        self::assertStringContainsString('Total people to anonymize: 2', $commandTester->getDisplay());
        self::assertStringContainsString('No data was changed.', $commandTester->getDisplay());

        $this->entityManager->clear();
        $user = $this->entityManager->find(User::class, 'user190');
        $participant = $this->entityManager->find(Participant::class, 'participant3');
        self::assertInstanceOf(User::class, $user);
        self::assertInstanceOf(Participant::class, $participant);
        self::assertNull($user->getAnonymizedAt());
        self::assertSame($userEmail, $user->getEmail());
        self::assertNull($participant->getAnonymizedAt());
        self::assertSame($participantEmail, $participant->getEmail());
    }

    public function testKeepsScheduledInactivityModeWhenNoDateRangeIsProvided(): void
    {
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        $user->setLastLogin(new \DateTime('2020-01-15 12:00:00'));
        $user->setAnonymizedAt(null);
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString(
            'Scheduled inactivity mode',
            $commandTester->getDisplay()
        );

        $this->entityManager->clear();
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        self::assertNotNull($user->getAnonymizedAt());
    }

    public function testExplicitDateRangeIncludesTheWholeEndDate(): void
    {
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        $user->setLastLogin(new \DateTime('2020-01-31 23:59:59'));
        $user->setAnonymizedAt(null);
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([
            '--startAt' => '2020-01-31',
            '--endAt' => '2020-01-31',
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());

        $this->entityManager->clear();
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        self::assertNotNull($user->getAnonymizedAt());
    }

    public function testExplicitDateRangeCannotBroadenInactivityEligibility(): void
    {
        $recentUser = $this->entityManager->find(User::class, 'user190');
        $userWithoutLastLogin = $this->entityManager->find(User::class, 'user191');
        self::assertInstanceOf(User::class, $recentUser);
        self::assertInstanceOf(User::class, $userWithoutLastLogin);

        $recentLastLogin = new \DateTime('-30 days');
        $recentUser->setLastLogin($recentLastLogin);
        $recentUser->setAnonymizedAt(null);
        $userWithoutLastLogin->clearLastLogin();
        $userWithoutLastLogin->setAnonymizedAt(null);
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([
            '--startAt' => (clone $recentLastLogin)->modify('-1 day')->format('Y-m-d'),
            '--endAt' => (clone $recentLastLogin)->modify('+1 day')->format('Y-m-d'),
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());

        $this->entityManager->clear();
        $recentUser = $this->entityManager->find(User::class, 'user190');
        $userWithoutLastLogin = $this->entityManager->find(User::class, 'user191');
        self::assertInstanceOf(User::class, $recentUser);
        self::assertInstanceOf(User::class, $userWithoutLastLogin);
        self::assertNull($recentUser->getAnonymizedAt());
        self::assertNull($userWithoutLastLogin->getAnonymizedAt());
    }

    public function testExplicitDateRangePreservesExistingAccountSafeguards(): void
    {
        $administrator = $this->entityManager->find(User::class, 'userAdmin');
        $mediator = $this->entityManager->find(User::class, 'userMediator');
        $organizationMember = $this->entityManager->find(User::class, 'user101');
        $alreadyAnonymizedUser = $this->entityManager->find(User::class, 'user193');
        self::assertInstanceOf(User::class, $administrator);
        self::assertInstanceOf(User::class, $mediator);
        self::assertInstanceOf(User::class, $organizationMember);
        self::assertInstanceOf(User::class, $alreadyAnonymizedUser);

        $administrator->setLastLogin(new \DateTime('2020-01-15 12:00:00'));
        $administrator->setAnonymizedAt(null);
        $mediator->setLastLogin(new \DateTime('2020-01-15 12:00:00'));
        $mediator->setAnonymizedAt(null);
        $organizationMember->setLastLogin(new \DateTime('2020-01-15 12:00:00'));
        $organizationMember->setAnonymizedAt(null);
        $alreadyAnonymizedAt = new \DateTime('2019-01-01 00:00:00');
        $alreadyAnonymizedUser->setLastLogin(new \DateTime('2020-01-15 12:00:00'));
        $alreadyAnonymizedUser->setAnonymizedAt($alreadyAnonymizedAt);
        $alreadyAnonymizedEmail = $alreadyAnonymizedUser->getEmail();
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([
            '--startAt' => '2020-01-01',
            '--endAt' => '2020-01-31',
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());

        $this->entityManager->clear();
        $administrator = $this->entityManager->find(User::class, 'userAdmin');
        $mediator = $this->entityManager->find(User::class, 'userMediator');
        $organizationMember = $this->entityManager->find(User::class, 'user101');
        $alreadyAnonymizedUser = $this->entityManager->find(User::class, 'user193');
        self::assertInstanceOf(User::class, $administrator);
        self::assertInstanceOf(User::class, $mediator);
        self::assertInstanceOf(User::class, $organizationMember);
        self::assertInstanceOf(User::class, $alreadyAnonymizedUser);
        self::assertNull($administrator->getAnonymizedAt());
        self::assertNull($mediator->getAnonymizedAt());
        self::assertNull($organizationMember->getAnonymizedAt());
        self::assertSame(
            $alreadyAnonymizedAt->format('Y-m-d H:i:s'),
            $alreadyAnonymizedUser->getAnonymizedAt()?->format('Y-m-d H:i:s')
        );
        self::assertSame($alreadyAnonymizedEmail, $alreadyAnonymizedUser->getEmail());
    }

    public function testExplicitDateRangeReusesExistingCleanupAndPreservesAssociatedContent(): void
    {
        $contentAuthor = $this->entityManager->find(User::class, 'user160');
        $mailingListMember = $this->entityManager->find(User::class, 'user18');
        self::assertInstanceOf(User::class, $contentAuthor);
        self::assertInstanceOf(User::class, $mailingListMember);

        $contentAuthor->setLastLogin(new \DateTime('2020-01-15 12:00:00'));
        $contentAuthor->setAnonymizedAt(null);
        $mailingListMember->setLastLogin(new \DateTime('2020-01-15 12:00:00'));
        $mailingListMember->setAnonymizedAt(null);
        $proposalRepository = $this->entityManager->getRepository(Proposal::class);
        $mailingListUserRepository = $this->entityManager->getRepository(MailingListUser::class);
        $proposalCount = $proposalRepository->count(['author' => $contentAuthor]);
        self::assertGreaterThan(0, $proposalCount);
        self::assertGreaterThan(0, $mailingListUserRepository->count(['user' => $mailingListMember]));
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([
            '--startAt' => '2020-01-01',
            '--endAt' => '2020-01-31',
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());

        $this->entityManager->clear();
        $contentAuthor = $this->entityManager->find(User::class, 'user160');
        $mailingListMember = $this->entityManager->find(User::class, 'user18');
        self::assertInstanceOf(User::class, $contentAuthor);
        self::assertInstanceOf(User::class, $mailingListMember);
        self::assertNull($contentAuthor->getEmail());
        self::assertSame('Utilisateur supprimé', $contentAuthor->getUsername());
        self::assertSame($proposalCount, $proposalRepository->count(['author' => $contentAuthor]));
        self::assertSame(0, $mailingListUserRepository->count(['user' => $mailingListMember]));
    }

    public function testOverlappingExplicitDateRangeCanBeRunAgainSafely(): void
    {
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        $user->setLastLogin(new \DateTime('2020-01-15 12:00:00'));
        $user->setAnonymizedAt(null);
        $this->entityManager->flush();

        $options = [
            '--startAt' => '2020-01-01',
            '--endAt' => '2020-01-31',
        ];
        $firstRun = $this->createCommandTester(self::COMMAND);
        $firstRun->execute($options);
        self::assertSame(0, $firstRun->getStatusCode(), $firstRun->getDisplay());

        $this->entityManager->clear();
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        $anonymizedAt = $user->getAnonymizedAt();
        self::assertNotNull($anonymizedAt);

        $secondRun = $this->createCommandTester(self::COMMAND);
        $secondRun->execute($options);
        self::assertSame(0, $secondRun->getStatusCode(), $secondRun->getDisplay());

        $this->entityManager->clear();
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        self::assertSame(
            $anonymizedAt->format('Y-m-d H:i:s'),
            $user->getAnonymizedAt()?->format('Y-m-d H:i:s')
        );
    }

    public function testExplicitDateRangeCleansParticipantLinksAndPreservesAssociatedContent(): void
    {
        $participant = $this->entityManager->find(Participant::class, 'participant2');
        self::assertInstanceOf(Participant::class, $participant);
        $participant->setLastContributedAt(new \DateTime('2020-01-15 12:00:00'));
        $participant->setAnonymizedAt(null);
        $smsRepository = $this->entityManager->getRepository(ParticipantPhoneVerificationSms::class);
        $replyRepository = $this->entityManager->getRepository(Reply::class);
        $replyCount = $replyRepository->count(['participant' => $participant]);
        self::assertGreaterThan(0, $smsRepository->count(['participant' => $participant]));
        self::assertGreaterThan(0, $replyCount);
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([
            '--startAt' => '2020-01-01',
            '--endAt' => '2020-01-31',
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());

        $this->entityManager->clear();
        $participant = $this->entityManager->find(Participant::class, 'participant2');
        self::assertInstanceOf(Participant::class, $participant);
        self::assertNotNull($participant->getAnonymizedAt());
        self::assertNull($participant->getEmail());
        self::assertSame(0, $smsRepository->count(['participant' => $participant]));
        self::assertSame($replyCount, $replyRepository->count(['participant' => $participant]));
    }

    public function testInactiveFeatureFlagPreventsExplicitDateRangeMutation(): void
    {
        $this->featureManager->deactivate(Manager::user_anonymization_automated);
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        $user->setLastLogin(new \DateTime('2020-01-15 12:00:00'));
        $user->setAnonymizedAt(null);
        $email = $user->getEmail();
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([
            '--startAt' => '2020-01-01',
            '--endAt' => '2020-01-31',
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString(
            Manager::user_anonymization_automated . ' feature must be enabled',
            $commandTester->getDisplay()
        );

        $this->entityManager->clear();
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        self::assertNull($user->getAnonymizedAt());
        self::assertSame($email, $user->getEmail());
    }

    public function testInactiveFeatureFlagPreventsScheduledModeMutation(): void
    {
        $this->featureManager->deactivate(Manager::user_anonymization_automated);
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        $user->setLastLogin(new \DateTime('2020-01-15 12:00:00'));
        $user->setAnonymizedAt(null);
        $email = $user->getEmail();
        $this->entityManager->flush();

        $commandTester = $this->createCommandTester(self::COMMAND);
        $commandTester->execute([]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString(
            Manager::user_anonymization_automated . ' feature must be enabled',
            $commandTester->getDisplay()
        );

        $this->entityManager->clear();
        $user = $this->entityManager->find(User::class, 'user190');
        self::assertInstanceOf(User::class, $user);
        self::assertNull($user->getAnonymizedAt());
        self::assertSame($email, $user->getEmail());
    }
}
