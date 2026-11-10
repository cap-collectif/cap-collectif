<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Elasticsearch\ElasticsearchLogger;
use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Elasticsearch\IndexationProcessor;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalStatistics;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\Toggle\Manager;
use Capco\Tests\FeatureFlags\FeatureFlagsAwareTest;
use Capco\Tests\FeatureFlags\FeatureFlagsTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\Logging\DebugStack;
use Elastica\Document;
use Elastica\Index;
use Elastica\Query;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\AbstractLogger;
use Psr\Log\NullLogger;
use Swarrot\Broker\Message;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Exercises CLI indexing and asynchronous cleanup against real Elasticsearch in a disposable index, rolling back SQL fixture changes.
 */
final class PopulateSingleObjectCommandTest extends KernelTestCase implements FeatureFlagsAwareTest
{
    use FeatureFlagsTrait;

    private ?Index $isolatedIndex = null;
    private ?Index $originalIndex = null;
    private ?Indexer $indexer = null;
    private CommandTester $commandTester;

    protected function setUp(): void
    {
        self::bootKernel();
        $indexer = self::getContainer()->get(Indexer::class);
        self::assertInstanceOf(Indexer::class, $indexer);
        $this->indexer = $indexer;
        $this->originalIndex = $this->indexer->getIndex();
        $this->isolatedIndex = $this->originalIndex->getClient()->getIndex('test_single_object_' . bin2hex(random_bytes(8)));
        $this->isolatedIndex->create(['settings' => ['refresh_interval' => '-1']]);
        $this->indexer->setIndex($this->isolatedIndex);

        $application = new Application(self::$kernel);
        $this->commandTester = new CommandTester($application->find('capco:es:populate'));
    }

    protected function tearDown(): void
    {
        try {
            if ($this->indexer && $this->originalIndex) {
                $this->indexer->setIndex($this->originalIndex);
            }
            if ($this->isolatedIndex && $this->isolatedIndex->exists()) {
                $this->isolatedIndex->delete();
            }
        } finally {
            parent::tearDown();
        }
    }

    public static function featureFlagOverrides(): array
    {
        return [Manager::indexation => true];
    }

    /**
     * @dataProvider identifierFormats
     */
    public function testIndexesOnlyTheRequestedProposalAndRefreshesItImmediately(bool $useGlobalId): void
    {
        $proposals = self::getContainer()->get('doctrine')->getRepository(Proposal::class)->findBy([], ['id' => 'ASC']);
        $proposal = null;
        foreach ($proposals as $candidate) {
            if ($candidate->isIndexable()) {
                $proposal = $candidate;

                break;
            }
        }
        self::assertNotNull($proposal, 'The test fixtures must contain an indexable proposal.');
        $this->isolatedIndex->addDocuments([
            new Document('proposal:' . $proposal->getId(), ['proposalTitle' => 'Outdated title']),
            new Document('proposal:untouched', ['title' => 'Untouched proposal']),
        ]);
        $this->isolatedIndex->refresh();

        $id = $useGlobalId ? GlobalId::toGlobalId('Proposal', $proposal->getId()) : $proposal->getId();
        $this->commandTester->execute(['type' => 'proposal', '--id' => $id]);

        self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertSame(2, $this->isolatedIndex->count());
        self::assertSame($proposal->getTitle(), $this->isolatedIndex->getDocument('proposal:' . $proposal->getId())->getData()['proposalTitle']);
        self::assertSame(['title' => 'Untouched proposal'], $this->isolatedIndex->getDocument('proposal:untouched')->getData());
    }

    /**
     * @dataProvider orphanIdentifiers
     */
    public function testDeletesOnlyTheRequestedOrphan(string $type, string $identifier, string $id): void
    {
        self::assertNull(self::getContainer()->get('doctrine')->getRepository($this->indexer->getClassesToIndex()[$type])->find($id));
        $documentId = $type . ':' . $id;
        $neighbor = ['objectType' => $type, 'marker' => 'Other orphan'];
        $otherType = 'proposal' === $type ? 'user' : 'proposal';
        $otherDocument = ['objectType' => $otherType];
        $this->isolatedIndex->addDocuments([
            new Document($documentId, ['objectType' => $type]),
            new Document($type . ':other-orphan', $neighbor),
            new Document($otherType . ':' . $id, $otherDocument),
        ]);
        $this->isolatedIndex->refresh();

        $this->commandTester->execute(['type' => $type, '--id' => $identifier]);

        self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertSame(2, $this->isolatedIndex->count());
        self::assertSame($neighbor, $this->isolatedIndex->getDocument($type . ':other-orphan')->getData());
        self::assertSame($otherDocument, $this->isolatedIndex->getDocument($otherType . ':' . $id)->getData());

        $this->commandTester->execute(['type' => $type, '--id' => $identifier]);

        self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertSame(2, $this->isolatedIndex->count());
        $filters = self::getContainer()->get('doctrine')->getManager()->getFilters();
        self::assertTrue($filters->isEnabled('softdeleted'));
        self::assertTrue($filters->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME));
    }

    /**
     * @return iterable<string, array{string, string, string}>
     */
    public function orphanIdentifiers(): iterable
    {
        $id = '00000000-0000-0000-0000-000000000000';

        yield 'UUID' => ['proposal', $id, $id];

        yield 'numeric ID' => ['proposal', '999999999', '999999999'];

        yield 'numeric Global ID' => ['proposal', GlobalId::toGlobalId('Proposal', '999999999'), '999999999'];

        yield 'proposal Global ID' => ['proposal', GlobalId::toGlobalId('Proposal', $id), $id];

        yield 'version alias' => ['opinionVersion', GlobalId::toGlobalId('Version', $id), $id];

        yield 'version vote alias' => ['vote', GlobalId::toGlobalId('VersionVote', $id), $id];

        yield 'abstract vote' => ['vote', GlobalId::toGlobalId('AbstractVote', $id), $id];

        yield 'response subtype' => ['response', GlobalId::toGlobalId('MediaResponse', $id), $id];

        yield 'district alias' => ['district', GlobalId::toGlobalId('District', $id), $id];

        yield 'anonymous debate argument alias' => ['debateAnonymousArgument', GlobalId::toGlobalId('DebateArgument', $id), $id];
    }

    /**
     * @dataProvider identifierFormats
     */
    public function testIndexesAnIncompleteProposal(bool $useGlobalId): void
    {
        $manager = self::getContainer()->get('doctrine')->getManager();
        $proposal = $this->indexableProposal();
        $id = $proposal->getId();
        $title = $proposal->getTitle();
        $connection = $manager->getConnection();
        $connection->beginTransaction();

        try {
            $connection->update('proposal', ['completion_status' => ContributionCompletionStatus::MISSING_REQUIREMENTS], ['id' => $id]);
            $manager->clear();
            self::assertNull($manager->getRepository(Proposal::class)->find($id));
            $this->isolatedIndex->addDocuments([
                new Document('proposal:' . $id, ['proposalTitle' => 'Outdated title']),
                new Document('proposal:untouched', ['title' => 'Untouched proposal']),
            ]);
            $this->isolatedIndex->refresh();

            $identifier = $useGlobalId ? GlobalId::toGlobalId('Proposal', $id) : $id;
            $this->commandTester->execute(['type' => 'proposal', '--id' => $identifier]);

            self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
            self::assertSame(2, $this->isolatedIndex->count());
            $data = $this->isolatedIndex->getDocument('proposal:' . $id)->getData();
            self::assertSame($title, $data['proposalTitle']);
            self::assertSame(ContributionCompletionStatus::MISSING_REQUIREMENTS, $data['completionStatus']);
            self::assertSame(['title' => 'Untouched proposal'], $this->isolatedIndex->getDocument('proposal:untouched')->getData());
            self::assertTrue($manager->getFilters()->isEnabled('softdeleted'));
            self::assertTrue($manager->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME));
        } finally {
            $connection->rollBack();
            $manager->clear();
        }
    }

    /**
     * @dataProvider identifierFormats
     */
    public function testRemovesTheDocumentOfASoftDeletedProposal(bool $useGlobalId): void
    {
        $manager = self::getContainer()->get('doctrine')->getManager();
        $id = $manager->getConnection()->fetchOne('SELECT id FROM proposal WHERE deleted_at IS NOT NULL LIMIT 1');
        self::assertNotFalse($id, 'The fixtures must include a soft-deleted proposal.');
        self::assertNull($manager->getRepository(Proposal::class)->find($id));
        $this->isolatedIndex->addDocuments([
            new Document('proposal:' . $id, ['proposalTitle' => 'Deleted proposal']),
            new Document('proposal:untouched', ['title' => 'Untouched proposal']),
        ]);
        $this->isolatedIndex->refresh();

        $identifier = $useGlobalId ? GlobalId::toGlobalId('Proposal', $id) : $id;
        $this->commandTester->execute(['type' => 'proposal', '--id' => $identifier]);

        self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertSame(1, $this->isolatedIndex->count());
        self::assertSame(['title' => 'Untouched proposal'], $this->isolatedIndex->getDocument('proposal:untouched')->getData());
        self::assertTrue($manager->getFilters()->isEnabled('softdeleted'));
        self::assertTrue($manager->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME));
    }

    public function testRestoresFiltersAfterPopulatingAType(): void
    {
        $manager = self::getContainer()->get('doctrine')->getManager();
        $statistics = $manager->getRepository(ProposalStatistics::class)->findOneBy([]);
        self::assertNotNull($statistics, 'The fixtures must contain proposal statistics.');
        $documentId = 'statistics:' . $statistics->getId();

        $this->commandTester->execute(['type' => 'statistics']);

        self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertSame('statistics', $this->isolatedIndex->getDocument($documentId)->getData()['objectType']);
        self::assertTrue($manager->getFilters()->isEnabled('softdeleted'));
        self::assertTrue($manager->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME));
    }

    /**
     * @dataProvider populationScopes
     *
     * @param array<string, string> $arguments
     */
    public function testRestoresFiltersAfterBulkPopulationFails(array $arguments): void
    {
        $this->isolatedIndex->setSettings(['index.blocks.write' => true]);

        try {
            $this->commandTester->execute($arguments);

            self::assertSame(Command::FAILURE, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
            self::assertStringContainsString('index write (api)', $this->commandTester->getDisplay());
            self::assertSame(0, $this->isolatedIndex->count());
            $filters = self::getContainer()->get('doctrine')->getManager()->getFilters();
            self::assertTrue($filters->isEnabled('softdeleted'));
            self::assertTrue($filters->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME));
        } finally {
            $this->isolatedIndex->setSettings(['index.blocks.write' => false]);
        }
    }

    /**
     * @return iterable<string, array{array<string, string>}>
     */
    public function populationScopes(): iterable
    {
        yield 'single type' => [['type' => 'statistics']];

        yield 'all types' => [[]];
    }

    public function testPreservesInitiallyDisabledFilters(): void
    {
        $proposal = $this->indexableProposal();
        $filters = self::getContainer()->get('doctrine')->getManager()->getFilters();
        $filters->disable('softdeleted');
        $filters->disable(ContributionCompletionStatusFilter::FILTER_NAME);

        $this->commandTester->execute(['type' => 'proposal', '--id' => $proposal->getId()]);

        self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertFalse($filters->isEnabled('softdeleted'));
        self::assertFalse($filters->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME));
    }

    /**
     * @dataProvider targetExistence
     */
    public function testGlobalIdReadsTheTargetOnlyOnce(bool $exists): void
    {
        $manager = self::getContainer()->get('doctrine')->getManager();
        $id = $exists ? $this->indexableProposal()->getId() : '00000000-0000-0000-0000-000000000000';
        $manager->clear();
        $configuration = $manager->getConnection()->getConfiguration();
        $previousLogger = $configuration->getSQLLogger();
        $logger = new DebugStack();
        $configuration->setSQLLogger($logger);

        try {
            $this->commandTester->execute(['type' => 'proposal', '--id' => GlobalId::toGlobalId('Proposal', $id)]);
        } finally {
            $configuration->setSQLLogger($previousLogger);
        }

        self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertSame($exists ? 1 : 0, $this->isolatedIndex->count());
        $targetReads = array_filter($logger->queries, static fn (array $query): bool => 1 === preg_match('/FROM proposal (\w+) .*WHERE \1\.id = \?/s', (string) $query['sql'])
            && \in_array($id, $query['params'] ?? [], true));
        self::assertCount(1, $targetReads, 'A Global ID must not trigger a second SQL read of the same target.');
    }

    /**
     * @return iterable<string, array{bool}>
     */
    public function targetExistence(): iterable
    {
        yield 'existing target' => [true];

        yield 'missing target' => [false];
    }

    /**
     * @dataProvider identifierFormats
     */
    public function testPreservesAUserWithTheRequestedProposalId(bool $useGlobalId): void
    {
        $userId = 'duplicatesUserConnectedFranceConnect';
        self::assertNotNull(self::getContainer()->get('doctrine')->getRepository(User::class)->find($userId));
        self::assertNull(self::getContainer()->get('doctrine')->getRepository(Proposal::class)->find($userId));
        $this->isolatedIndex->addDocuments([new Document('user:' . $userId, ['username' => 'Unchanged user'])]);
        $this->isolatedIndex->refresh();

        $id = $useGlobalId ? GlobalId::toGlobalId('User', $userId) : $userId;
        $this->commandTester->execute(['type' => 'proposal', '--id' => $id]);

        self::assertSame($useGlobalId ? Command::INVALID : Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertSame(1, $this->isolatedIndex->count());
        self::assertSame(['username' => 'Unchanged user'], $this->isolatedIndex->getDocument('user:' . $userId)->getData());
    }

    /**
     * @return iterable<string, array{bool}>
     */
    public function identifierFormats(): iterable
    {
        yield 'database ID' => [false];

        yield 'GraphQL Global ID' => [true];
    }

    /**
     * @dataProvider invalidTargetIdentifiers
     */
    public function testRejectsInvalidTargetIdentifiersWithoutDeletingAnything(string $identifier): void
    {
        $data = ['objectType' => 'proposal'];
        $this->isolatedIndex->addDocuments([new Document('proposal:missing-orphan', $data)]);
        $this->isolatedIndex->refresh();

        $this->commandTester->execute(['type' => 'proposal', '--id' => $identifier]);

        self::assertSame(Command::INVALID, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertSame($data, $this->isolatedIndex->getDocument('proposal:missing-orphan')->getData());
    }

    /**
     * @return iterable<string, array{string}>
     */
    public function invalidTargetIdentifiers(): iterable
    {
        yield 'empty ID' => [''];

        yield 'whitespace ID' => [' '];

        yield 'wrong type for a deleted object' => [GlobalId::toGlobalId('User', 'missing-orphan')];

        yield 'unknown type for a deleted object' => [GlobalId::toGlobalId('UnknownType', 'missing-orphan')];
    }

    public function testAutomaticIndexationRemovesTheDocumentOfADeletedObject(): void
    {
        $deletedId = '00000000-0000-0000-0000-000000000000';
        self::assertNull(self::getContainer()->get('doctrine')->getRepository(Proposal::class)->find($deletedId));
        $this->isolatedIndex->addDocuments([
            new Document('proposal:' . $deletedId, ['title' => 'Deleted proposal']),
            new Document('proposal:untouched', ['title' => 'Untouched proposal']),
        ]);
        $this->isolatedIndex->refresh();
        $processor = new IndexationProcessor($this->indexer, new NullLogger());
        $message = new Message(json_encode(['class' => Proposal::class, 'id' => $deletedId], \JSON_THROW_ON_ERROR));

        $processed = $processor->process($message, []);

        self::assertTrue($processed);
        self::assertSame(1, $this->isolatedIndex->count());
        self::assertSame(['title' => 'Untouched proposal'], $this->isolatedIndex->getDocument('proposal:untouched')->getData());
    }

    /**
     * @dataProvider bulkOperations
     */
    public function testReportsFailureWhenElasticsearchRejectsTheOperation(bool $delete): void
    {
        $id = $delete ? '00000000-0000-0000-0000-000000000000' : $this->indexableProposal()->getId();
        $data = ['marker' => 'Unchanged document'];
        $this->isolatedIndex->addDocuments([new Document('proposal:' . $id, $data)]);
        $this->isolatedIndex->refresh();
        $this->isolatedIndex->setSettings(['index.blocks.write' => true]);

        try {
            $this->commandTester->execute(['type' => 'proposal', '--id' => $id]);

            self::assertSame(Command::FAILURE, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
            self::assertStringContainsString('index write (api)', $this->commandTester->getDisplay());
            self::assertStringNotContainsString('All the documents are LIVE!', $this->commandTester->getDisplay());
            self::assertSame($data, $this->isolatedIndex->getDocument('proposal:' . $id)->getData());
            $filters = self::getContainer()->get('doctrine')->getManager()->getFilters();
            self::assertTrue($filters->isEnabled('softdeleted'));
            self::assertTrue($filters->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME));
        } finally {
            $this->isolatedIndex->setSettings(['index.blocks.write' => false]);
        }
    }

    /**
     * @return iterable<string, array{bool}>
     */
    public function bulkOperations(): iterable
    {
        yield 'index' => [false];

        yield 'delete' => [true];
    }

    /**
     * @dataProvider mismatchedGlobalIdTypes
     */
    public function testRejectsMismatchedGlobalIdTypeEvenWhenTheRawIdExists(string $type, string $class, string $globalIdType): void
    {
        $entity = self::getContainer()->get('doctrine')->getRepository($class)->findOneBy([]);
        self::assertNotNull($entity);
        $documentId = $type . ':' . $entity->getId();
        $data = ['marker' => 'Unchanged document'];
        $this->isolatedIndex->addDocuments([new Document($documentId, $data)]);
        $this->isolatedIndex->refresh();

        $this->commandTester->execute(['type' => $type, '--id' => GlobalId::toGlobalId($globalIdType, $entity->getId())]);

        self::assertSame(Command::INVALID, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertStringContainsString('does not match', $this->commandTester->getDisplay());
        self::assertStringNotContainsString('All the documents are LIVE!', $this->commandTester->getDisplay());
        self::assertSame(1, $this->isolatedIndex->count());
        self::assertSame($data, $this->isolatedIndex->getDocument($documentId)->getData());
        $filters = self::getContainer()->get('doctrine')->getManager()->getFilters();
        self::assertTrue($filters->isEnabled('softdeleted'));
        self::assertTrue($filters->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME));
    }

    /**
     * @return iterable<string, array{string, class-string, string}>
     */
    public function mismatchedGlobalIdTypes(): iterable
    {
        yield 'user type with a proposal ID' => ['proposal', Proposal::class, 'User'];

        yield 'unknown type with a proposal ID' => ['proposal', Proposal::class, 'UnknownType'];

        yield 'wrong response subtype' => ['response', ValueResponse::class, 'MediaResponse'];

        yield 'wrong media response subtype' => ['response', MediaResponse::class, 'ValueResponse'];
    }

    /**
     * @dataProvider supportedGlobalIdTypes
     */
    public function testIndexesSupportedGlobalIdTypes(string $type, string $class, string $globalIdType): void
    {
        $entity = null;
        foreach (self::getContainer()->get('doctrine')->getRepository($class)->findBy([], null, 500) as $candidate) {
            if ($candidate instanceof IndexableInterface && $candidate->isIndexable()) {
                $entity = $candidate;

                break;
            }
        }
        self::assertNotNull($entity, sprintf('The fixtures must contain an indexable %s.', $globalIdType));
        $documentId = $type . ':' . $entity->getId();
        $this->isolatedIndex->addDocuments([new Document($documentId, ['marker' => 'Outdated document'])]);
        $this->isolatedIndex->refresh();

        $this->commandTester->execute(['type' => $type, '--id' => GlobalId::toGlobalId($globalIdType, $entity->getId())]);

        self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertSame(1, $this->isolatedIndex->count());
        $data = $this->isolatedIndex->getDocument($documentId)->getData();
        self::assertSame($type, $data['objectType']);
        self::assertArrayNotHasKey('marker', $data);
    }

    /**
     * @return iterable<string, array{string, class-string, string}>
     */
    public function supportedGlobalIdTypes(): iterable
    {
        yield 'user' => ['user', User::class, 'User'];

        yield 'opinion version alias' => ['opinionVersion', OpinionVersion::class, 'Version'];

        yield 'opinion vote' => ['vote', OpinionVote::class, 'OpinionVote'];

        yield 'version vote alias' => ['vote', OpinionVersionVote::class, 'VersionVote'];

        yield 'abstract vote' => ['vote', ProposalCollectVote::class, 'AbstractVote'];

        yield 'value response' => ['response', ValueResponse::class, 'ValueResponse'];

        yield 'media response' => ['response', MediaResponse::class, 'MediaResponse'];

        yield 'district alias' => ['district', ProposalDistrict::class, 'District'];

        yield 'anonymous debate argument alias' => ['debateAnonymousArgument', DebateAnonymousArgument::class, 'DebateArgument'];
    }

    public function testTypeWithoutIdStillIndexesMultipleProposals(): void
    {
        $this->commandTester->execute(['type' => 'proposal']);
        $this->isolatedIndex->refresh();

        self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertGreaterThan(1, $this->isolatedIndex->count());
    }

    /**
     * @dataProvider bulkScopes
     *
     * @param array<string, string> $input
     */
    public function testBulkPopulationRefreshesBetweenTypesAndMakesDocumentsSearchable(array $input): void
    {
        $logger = new class extends AbstractLogger {
            /** @var list<string> */
            public array $paths = [];

            public function log($level, $message, array $context = []): void
            {
                if ('Elastica Request' === $message) {
                    $this->paths[] = $context['request']['path'];
                }
            }
        };
        $client = $this->isolatedIndex->getClient();
        $client->setLogger($logger);

        try {
            $this->commandTester->execute($input);
        } finally {
            $client->setLogger(self::getContainer()->get(ElasticsearchLogger::class));
        }

        self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertGreaterThan(1, \count(array_filter($logger->paths, static fn (string $path): bool => str_ends_with($path, '_bulk'))));
        $typeCount = isset($input['type']) ? 1 : \count($this->indexer->getClassesToIndex());
        self::assertSame(array_fill(0, $typeCount, $this->isolatedIndex->getName() . '/_refresh'), array_values(array_filter($logger->paths, static fn (string $path): bool => str_ends_with($path, '/_refresh'))));
        self::assertGreaterThan(Indexer::BULK_SIZE, $this->isolatedIndex->count());
    }

    /**
     * @return iterable<string, array{array<string, string>}>
     */
    public function bulkScopes(): iterable
    {
        yield 'one type' => [['type' => 'proposal']];

        yield 'all types' => [[]];
    }

    /**
     * @dataProvider batchOffsets
     */
    public function testBulkPopulationSynchronizesEveryProposalAcrossBatchBoundaries(int $offset): void
    {
        $manager = self::getContainer()->get('doctrine')->getManager();
        $expected = $this->indexer->withIndexingFiltersDisabled(function () use ($manager, $offset): array {
            $query = $manager->getRepository(Proposal::class)->createQueryBuilder('p')->orderBy('p.id')->getQuery();
            $expected = [];
            $documents = [];
            foreach ($query->iterate() as $position => $row) {
                $proposal = $row[0];
                $documentId = 'proposal:' . $proposal->getId();
                $documents[] = new Document($documentId, ['marker' => 'Stale document']);
                if ($position < $offset) {
                    $expected[$documentId] = ['marker' => 'Stale document'];
                } elseif ($proposal->isIndexable()) {
                    $expected[$documentId] = ['proposalTitle' => $proposal->getTitle()];
                }
            }
            self::assertGreaterThan(2 * Indexer::BULK_SIZE, \count($documents));
            $this->isolatedIndex->addDocuments($documents);
            $this->isolatedIndex->refresh();
            $manager->clear();

            return $expected;
        });

        $this->commandTester->execute(['type' => 'proposal', 'offset' => $offset]);

        self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertSame(\count($expected), $this->isolatedIndex->count());
        $scroll = $this->isolatedIndex->createSearch((new Query())->setSize(100))->scroll('2m');

        try {
            foreach ($scroll as $page) {
                foreach ($page as $document) {
                    self::assertArrayHasKey($document->getId(), $expected);
                    $data = $document->getSource();
                    foreach ($expected[$document->getId()] as $field => $value) {
                        self::assertSame($value, $data[$field]);
                    }
                    if (isset($expected[$document->getId()]['proposalTitle'])) {
                        self::assertArrayNotHasKey('marker', $data);
                    }
                    unset($expected[$document->getId()]);
                }
            }
        } finally {
            $scroll->clear();
        }
        self::assertSame([], $expected);
    }

    /**
     * @return iterable<string, array{int}>
     */
    public function batchOffsets(): iterable
    {
        yield 'all rows' => [0];

        yield 'resume inside the second batch' => [Indexer::BULK_SIZE + 7];
    }

    public function testIndexesStatisticsWithTheirObjectType(): void
    {
        $statistics = self::getContainer()->get('doctrine')->getRepository(ProposalStatistics::class)->findOneBy([]);
        self::assertNotNull($statistics, 'The fixtures must contain proposal statistics.');
        $id = $statistics->getId();
        $messageCount = $statistics->getNbrOfMessagesSentToAuthor();

        $this->commandTester->execute(['type' => 'statistics', '--id' => $id]);

        self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        $data = $this->isolatedIndex->getDocument('statistics:' . $id)->getData();
        self::assertSame('statistics', $data['objectType'] ?? null);
        self::assertSame($messageCount, $data['nbrOfMessagesSentToAuthor']);
    }

    public function testTypeWithOffsetStillSkipsEarlierObjects(): void
    {
        $this->commandTester->execute(['type' => 'proposal', 'offset' => \PHP_INT_MAX]);
        $this->isolatedIndex->refresh();

        self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertSame(0, $this->isolatedIndex->count());
    }

    /**
     * @dataProvider invalidInputs
     *
     * @param array<string, int|string> $input
     */
    public function testRejectsInvalidInputsWithoutChangingTheIndex(array $input): void
    {
        $this->isolatedIndex->addDocuments([new Document('proposal:untouched', ['title' => 'Untouched proposal'])]);
        $this->isolatedIndex->refresh();

        $this->commandTester->execute($input);

        self::assertSame(Command::INVALID, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
        self::assertStringContainsString('[ERROR]', $this->commandTester->getDisplay());
        self::assertSame(1, $this->isolatedIndex->count());
        self::assertSame(['title' => 'Untouched proposal'], $this->isolatedIndex->getDocument('proposal:untouched')->getData());
    }

    /**
     * @return iterable<string, array{array<string, int|string>}>
     */
    public function invalidInputs(): iterable
    {
        yield 'missing type' => [['--id' => '123']];

        yield 'empty ID' => [['type' => 'proposal', '--id' => '']];

        yield 'whitespace ID' => [['type' => 'proposal', '--id' => ' ']];

        yield 'offset and ID' => [['type' => 'proposal', 'offset' => 10, '--id' => '123']];

        yield 'unknown type' => [['type' => 'unknown', '--id' => '123']];
    }

    private function indexableProposal(): Proposal
    {
        foreach (self::getContainer()->get('doctrine')->getRepository(Proposal::class)->findBy([], null, 500) as $proposal) {
            if ($proposal->isIndexable()) {
                return $proposal;
            }
        }

        self::fail('The fixtures must contain an indexable proposal.');
    }
}
