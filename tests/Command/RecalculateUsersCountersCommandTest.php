<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Command\RecalculateUsersCountersCommand;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\UserBundle\Entity\User;
use Predis\Client;
use Predis\Connection\NodeConnectionInterface;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Tester\CommandTester;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason The real CLI command verifies counters in the retained SQL schema and queue consumption with rolled-back SQL and a scenario-owned Redis namespace; Elasticsearch is excluded.
 */
final class RecalculateUsersCountersCommandTest extends DatabaseCommandTestCase
{
    private const COMMAND = 'capco:compute:users-counters';
    private const REDIS_KEY = 'recalculate_user_counters';
    private const STALE_COUNTERS = [999, 998, 997, 996];

    private CommandTester $commandTester;
    private Client $redis;

    protected function setUp(): void
    {
        parent::setUp();
        self::assertSame('test', self::$kernel->getEnvironment());

        // Only this command uses the scenario-owned queue; the shared queue is untouched.
        $connection = self::getContainer()->get('snc_redis.default')->getConnection();
        \assert($connection instanceof NodeConnectionInterface);
        $this->redis = new Client($connection->getParameters(), ['prefix' => 'counter-tests-' . bin2hex(random_bytes(12)) . ':']);
        $application = new Application();
        $application->add(new RecalculateUsersCountersCommand($this->entityManager, $this->redis));
        $this->commandTester = new CommandTester($application->find(self::COMMAND));
    }

    protected function tearDown(): void
    {
        try {
            if (isset($this->redis)) {
                $this->redis->del(self::REDIS_KEY);
                $this->redis->disconnect();
            }
        } finally {
            parent::tearDown();
        }
    }

    public function testEmptyQueueLeavesCountersUnchanged(): void
    {
        $account = $this->accountWithStaleCounters();
        $this->entityManager->flush();
        $id = $account->getId();

        $this->executeCommand();

        self::assertSame(self::STALE_COUNTERS, $this->readStoredCounters($id));
        self::assertSame([], $this->redis->smembers(self::REDIS_KEY));
    }

    public function testQueuedAccountWithoutVotesHasAllCountersReset(): void
    {
        $account = $this->accountWithStaleCounters();
        $this->entityManager->flush();
        $id = $account->getId();
        $this->redis->sadd(self::REDIS_KEY, [$id]);

        $this->executeCommand();

        self::assertSame([0, 0, 0, 0], $this->readStoredCounters($id));
        self::assertSame([], $this->redis->smembers(self::REDIS_KEY));
    }

    public function testOnlyQueuedAccountIsRecalculatedAndQueueIsConsumed(): void
    {
        $queuedAccount = $this->accountWithStaleCounters();
        $neighbor = $this->accountWithStaleCounters();
        $this->addProposalVote($queuedAccount);
        $this->entityManager->flush();
        $queuedId = $queuedAccount->getId();
        $neighborId = $neighbor->getId();
        $this->redis->sadd(self::REDIS_KEY, [$queuedId]);

        $this->executeCommand();

        self::assertSame([1, 0, 0, 0], $this->readStoredCounters($queuedId));
        self::assertSame(self::STALE_COUNTERS, $this->readStoredCounters($neighborId));
        self::assertSame([], $this->redis->smembers(self::REDIS_KEY));

        // An empty subsequent run must not recalculate the previously queued account.
        $this->entityManager->getConnection()->executeStatement(
            'UPDATE fos_user SET proposal_votes_count = :count WHERE id = :id',
            ['count' => 123, 'id' => $queuedId]
        );
        $this->executeCommand();
        self::assertSame([123, 0, 0, 0], $this->readStoredCounters($queuedId));
        self::assertSame(self::STALE_COUNTERS, $this->readStoredCounters($neighborId));
    }

    public function testForceRecalculatesAccountsOutsideQueue(): void
    {
        $queuedAccount = $this->accountWithStaleCounters();
        $unqueuedAccount = $this->accountWithStaleCounters();
        $this->addProposalVote($unqueuedAccount);
        $this->entityManager->flush();
        $queuedId = $queuedAccount->getId();
        $unqueuedId = $unqueuedAccount->getId();
        $this->redis->sadd(self::REDIS_KEY, [$queuedId]);

        $this->executeCommand(true);

        self::assertSame([0, 0, 0, 0], $this->readStoredCounters($queuedId));
        self::assertSame([1, 0, 0, 0], $this->readStoredCounters($unqueuedId));
        self::assertSame([], $this->redis->smembers(self::REDIS_KEY));
    }

    public function testDraftProposalsAndPrivateVotesAreExcluded(): void
    {
        $account = $this->accountWithStaleCounters();
        $this->addProposalVote($account);
        $this->addProposalVote($account, true);
        $this->addProposalVote($account, false, true);
        $this->entityManager->flush();
        $id = $account->getId();
        $this->redis->sadd(self::REDIS_KEY, [$id]);

        $this->executeCommand();

        self::assertSame([1, 0, 0, 0], $this->readStoredCounters($id));
        self::assertSame([], $this->redis->smembers(self::REDIS_KEY));
    }

    private function accountWithStaleCounters(): User
    {
        $account = new User();
        $identifier = 'counter-test-' . bin2hex(random_bytes(12));
        $account->setUsername($identifier);
        $account->setEmail($identifier . '@example.test');
        $account->setEnabled(true);
        $account->setProposalVotesCount(self::STALE_COUNTERS[0]);
        $account->setOpinionVersionVotesCount(self::STALE_COUNTERS[1]);
        $account->setArgumentVotesCount(self::STALE_COUNTERS[2]);
        $account->setSourceVotesCount(self::STALE_COUNTERS[3]);
        $this->entityManager->persist($account);

        return $account;
    }

    private function addProposalVote(User $account, bool $draft = false, bool $private = false): void
    {
        // Reuse only the collect form/step; proposals and votes belong to this scenario.
        $step = $this->entityManager->find(CollectStep::class, 'collectstep1');
        self::assertInstanceOf(CollectStep::class, $step);
        $proposal = (new Proposal())->setTitle('Counter test proposal')->setProposalForm($step->getProposalForm());
        $proposal->setDraft($draft)->setPublishedAt(new \DateTime('2026-01-01 12:00:00'));
        $vote = (new ProposalCollectVote())->setProposal($proposal)->setCollectStep($step)->setUser($account);
        $vote->setPrivate($private);
        $vote->setPublishedAt(new \DateTime('2026-01-01 12:00:00'));
        $this->entityManager->persist($proposal);
        $this->entityManager->persist($vote);
    }

    private function executeCommand(bool $force = false): void
    {
        $this->entityManager->clear();
        $this->commandTester->execute($force ? ['--force' => true] : []);
        self::assertSame(0, $this->commandTester->getStatusCode());
        self::assertStringContainsString('User counters calculation completed!', $this->commandTester->getDisplay());
        self::assertSame(1, $this->entityManager->getConnection()->getTransactionNestingLevel());
    }

    /** @return array{int, int, int, int} */
    private function readStoredCounters(string $id): array
    {
        // The table and column names are retained contracts of this migration.
        $row = $this->entityManager->getConnection()->executeQuery(
            'SELECT proposal_votes_count, opinion_version_votes_count, argument_votes_count, source_votes_count
             FROM fos_user WHERE id = :id',
            ['id' => $id]
        )->fetchAssociative();
        self::assertNotFalse($row, 'The scenario account must remain persisted.');

        return [(int) $row['proposal_votes_count'], (int) $row['opinion_version_votes_count'], (int) $row['argument_votes_count'], (int) $row['source_votes_count']];
    }
}
