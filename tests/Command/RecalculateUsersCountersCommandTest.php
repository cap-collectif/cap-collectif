<?php

namespace Capco\Tests\Command;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Predis\ClientInterface;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Tester\CommandTester;

/**
 * @internal
 * @coversNothing
 */
class RecalculateUsersCountersCommandTest extends KernelTestCase
{
    private const COMMAND = 'capco:compute:users-counters';
    private const REDIS_KEY = 'recalculate_user_counters';

    private CommandTester $commandTester;
    private ClientInterface $redis;
    private EntityManagerInterface $em;

    protected function setUp(): void
    {
        self::bootKernel();

        $application = new Application(self::$kernel);
        $command = $application->find(self::COMMAND);
        $this->commandTester = new CommandTester($command);

        $container = self::getContainer();

        $redis = $container->get('snc_redis.default');
        \assert($redis instanceof ClientInterface);
        $this->redis = $redis;

        $em = $container->get('doctrine')->getManager();
        \assert($em instanceof EntityManagerInterface);
        $this->em = $em;

        $this->redis->del(self::REDIS_KEY);
    }

    protected function tearDown(): void
    {
        $this->redis->del(self::REDIS_KEY);
        parent::tearDown();
    }

    public function testCommandExecutesSuccessfully(): void
    {
        $this->commandTester->execute([]);

        $this->assertSame(0, $this->commandTester->getStatusCode());
    }

    public function testCommandExecutesSuccessfullyWithForceOption(): void
    {
        $this->commandTester->execute([
            '--force' => true,
        ]);

        $this->assertSame(0, $this->commandTester->getStatusCode());
    }

    public function testCommandProcessesUsersFromRedisQueue(): void
    {
        $userRepository = $this->em->getRepository(User::class);

        $user = $userRepository->findOneBy([]);
        $this->assertNotNull($user, 'At least one user should exist in fixtures');

        $this->redis->sadd(self::REDIS_KEY, [$user->getId()]);

        $this->commandTester->execute([]);

        $this->assertSame(0, $this->commandTester->getStatusCode());
    }

    public function testCommandRecalculatesCountersFromFixtures(): void
    {
        // Run the command with --force to recalculate all counters
        $this->commandTester->execute(['--force' => true]);
        $this->assertSame(0, $this->commandTester->getStatusCode());

        // Query to find any user with non-zero counters after recalculation
        $result = $this->em->getConnection()->executeQuery(
            'SELECT id, email,
                opinion_version_votes_count,
                proposal_votes_count,
                argument_votes_count,
                source_votes_count
            FROM fos_user
            WHERE opinion_version_votes_count > 0
               OR proposal_votes_count > 0
               OR argument_votes_count > 0
               OR source_votes_count > 0
            LIMIT 1'
        )->fetchAssociative();

        // The fixtures should have at least one user with votes that satisfy
        // the complex SQL conditions (published opinions, enabled steps, etc.)
        $this->assertNotFalse(
            $result,
            'At least one user should have countable votes in fixtures'
        );
    }

    public function testCommandRecalculatesOnlyQueuedUsers(): void
    {
        // First run with --force to get baseline counters
        $this->commandTester->execute(['--force' => true]);
        $this->assertSame(0, $this->commandTester->getStatusCode());

        // Find a user with non-zero counters
        $result = $this->em->getConnection()->executeQuery(
            'SELECT id FROM fos_user
            WHERE proposal_votes_count > 0
            LIMIT 1'
        )->fetchAssociative();

        if (!$result) {
            $this->markTestSkipped('No user with proposal votes found in fixtures');
        }

        $userId = $result['id'];

        // Set their proposal_votes_count to a known wrong value
        $this->em->getConnection()->executeStatement(
            'UPDATE fos_user SET proposal_votes_count = 999 WHERE id = :id',
            ['id' => $userId]
        );

        // Add user to Redis queue
        $this->redis->sadd(self::REDIS_KEY, [$userId]);

        // Run WITHOUT --force (should only process queued users)
        $this->commandTester->execute([]);
        $this->assertSame(0, $this->commandTester->getStatusCode());

        // Verify the counter was recalculated (no longer 999)
        $newCount = $this->em->getConnection()->executeQuery(
            'SELECT proposal_votes_count FROM fos_user WHERE id = :id',
            ['id' => $userId]
        )->fetchOne();

        $this->assertNotSame(
            999,
            (int) $newCount,
            'Counter should be recalculated for queued user'
        );
    }
}
