<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Command\RemindUserAccountConfirmationCommand;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Psr\Log\LoggerInterface;
use Qandidate\Toggle\Context;
use Qandidate\Toggle\ContextFactory;
use Symfony\Component\Console\Tester\CommandTester;

/**
 * @internal
 * @coversNothing
 */
class RemindUserAccountConfirmationCommandTest extends MailerSnapshotCommandTestCase
{
    private Manager $featureManager;
    private Context $featureContext;
    private bool $initialFeatureState;

    protected function setUp(): void
    {
        parent::setUp();

        $featureManager = self::getContainer()->get(Manager::class);
        \assert($featureManager instanceof Manager);
        $this->featureManager = $featureManager;

        $contextFactory = self::getContainer()->get('qandidate.toggle.user_context_factory');
        \assert($contextFactory instanceof ContextFactory);
        $this->featureContext = $contextFactory->createContext();
        $this->initialFeatureState = $this->isFeatureActive();
        $this->featureManager->activate(Manager::remind_user_account_confirmation);
    }

    protected function tearDown(): void
    {
        $this->featureManager->set(
            Manager::remind_user_account_confirmation,
            $this->initialFeatureState
        );

        parent::tearDown();
    }

    public function testRemindsEligibleUsersOnlyOnce(): void
    {
        $this->setRegistrationDate('user_not_confirmed', '-2880 minutes');
        $this->setRegistrationDate('userNotConfirmedWithContributions', '-2880 minutes');
        $this->setRegistrationDate('user1', '-2880 minutes');

        $publishedMessages = $this->capturePublishedMessages();
        $commandTester = $this->createRemindCommandTester($publishedMessages);

        $commandTester->execute([]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString('2 user(s) reminded.', $commandTester->getDisplay());
        self::assertSame(
            ['userNotConfirmedWithContributions', 'user_not_confirmed'],
            $this->sortedReminderUserIds($publishedMessages->payloadsForType(
                CapcoAppBundleMessagesTypes::USER_EMAIL_REMINDER
            ))
        );
        self::assertTrue($this->isUserReminded('user_not_confirmed'));
        self::assertTrue($this->isUserReminded('userNotConfirmedWithContributions'));

        $commandTester->execute([]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString('0 user(s) reminded.', $commandTester->getDisplay());
        self::assertCount(2, $publishedMessages->messages);
    }

    public function testRemindsOnlyUsersRegisteredBetweenOneDayAndOneWeekAgo(): void
    {
        $this->setRegistrationDate('user_not_confirmed', '-25 minutes');
        $this->setRegistrationDate('userNotConfirmedWithContributions', '-2880 minutes');
        $this->setRegistrationDate('user1', '-78 minutes');
        $this->setRegistrationDate('user2', '-25 minutes');

        $publishedMessages = $this->capturePublishedMessages();
        $commandTester = $this->createRemindCommandTester($publishedMessages);

        $commandTester->execute([]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString('1 user(s) reminded.', $commandTester->getDisplay());
        self::assertSame(
            ['userNotConfirmedWithContributions'],
            $this->sortedReminderUserIds($publishedMessages->payloadsForType(
                CapcoAppBundleMessagesTypes::USER_EMAIL_REMINDER
            ))
        );
        self::assertFalse($this->isUserReminded('user_not_confirmed'));
        self::assertTrue($this->isUserReminded('userNotConfirmedWithContributions'));
    }

    private function setRegistrationDate(string $userId, string $relativeDate): void
    {
        $user = $this->entityManager->getRepository(User::class)->find($userId);
        self::assertInstanceOf(User::class, $user);
        $user->setCreatedAt(new \DateTime($relativeDate));
        $this->entityManager->flush();
    }

    private function isUserReminded(string $userId): bool
    {
        $this->entityManager->clear();
        $user = $this->entityManager->getRepository(User::class)->find($userId);
        self::assertInstanceOf(User::class, $user);

        return $user->getRemindedAccountConfirmationAfter24Hours();
    }

    /**
     * @param list<array<string, mixed>> $payloads
     *
     * @return list<string>
     */
    private function sortedReminderUserIds(array $payloads): array
    {
        $userIds = array_column($payloads, 'userId');
        sort($userIds);

        return $userIds;
    }

    private function isFeatureActive(): bool
    {
        return $this->featureManager
            ->getToggleManager()
            ->active(Manager::remind_user_account_confirmation, $this->featureContext)
        ;
    }

    private function createRemindCommandTester(PublishedMessageCapture $publishedMessages): CommandTester
    {
        $userRepository = self::getContainer()->get(UserRepository::class);
        \assert($userRepository instanceof UserRepository);
        $logger = self::getContainer()->get('logger');
        \assert($logger instanceof LoggerInterface);

        return new CommandTester(
            new RemindUserAccountConfirmationCommand(
                $logger,
                $this->entityManager,
                $userRepository,
                $this->featureManager,
                $publishedMessages->publisher
            )
        );
    }
}
