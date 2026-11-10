<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalStatistics;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\AppBundle\Search\ContributionSearch;
use Capco\AppBundle\Search\ProposalSearch;
use Capco\AppBundle\Search\VoteSearch;
use Capco\AppBundle\Toggle\Manager;
use Capco\Tests\FeatureFlags\FeatureFlagsAwareTest;
use Capco\Tests\FeatureFlags\FeatureFlagsTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Elastica\Client;
use Elastica\Index;
use Elastica\Query;
use Elastica\Query\Ids;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\Yaml\Yaml;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Rebuilds a disposable, fully mapped Elasticsearch index through the real CLI and verifies
 * documents, independently specified counters and business searches; SQL scenario changes are rolled back.
 */
final class PopulateIndexCommandTest extends KernelTestCase implements FeatureFlagsAwareTest
{
    use FeatureFlagsTrait;

    private ?Index $index = null;
    private EntityManagerInterface $entityManager;
    private CommandTester $commandTester;

    protected function setUp(): void
    {
        self::bootKernel();
        $container = self::getContainer();
        $this->entityManager = $container->get('doctrine')->getManager();
        $this->entityManager->getConnection()->beginTransaction();

        // Scenario setup must not publish indexing messages or populate the shared fixture index.
        $listener = $container->get(ElasticsearchDoctrineListener::class);
        $this->entityManager->getEventManager()->removeEventListener($listener->getSubscribedEvents(), $listener);

        $this->index = $container->get(Client::class)->getIndex('test_population_' . bin2hex(random_bytes(8)));
        $mapping = Yaml::parseFile(__DIR__ . '/../../src/Capco/AppBundle/Elasticsearch/mapping.yaml');
        $mapping['settings']['refresh_interval'] = '-1';
        $this->index->create($mapping);
        // Bind before constructing either the indexer or any search-dependent normalizer.
        $container->set(Index::class, $this->index);
        $this->commandTester = new CommandTester((new Application(self::$kernel))->find('capco:es:populate'));
    }

    protected function tearDown(): void
    {
        try {
            if ($this->index && $this->index->exists()) {
                $this->index->delete();
            }
        } finally {
            if (isset($this->entityManager)) {
                $connection = $this->entityManager->getConnection();
                if ($connection->isTransactionActive()) {
                    $connection->rollBack();
                }
                $this->entityManager->clear();
            }
            parent::tearDown();
        }
    }

    public static function featureFlagOverrides(): array
    {
        return [Manager::indexation => true];
    }

    public function testCommandFailsWithoutChangingTheIndexWhenIndexationIsDisabled(): void
    {
        $this->setFeatureFlags([Manager::indexation => false]);

        $this->commandTester->execute([]);

        self::assertSame(Command::FAILURE, $this->commandTester->getStatusCode());
        self::assertStringContainsString('Please enable "indexation" feature to run this command', $this->commandTester->getDisplay());
        self::assertSame(0, $this->index->count());
    }

    public function testRebuildsEveryIndexableTypeWithItsBusinessFields(): void
    {
        $scenario = $this->prepareScenario();
        // Fixture associations identify generated IDs without deriving expected fields from the serializer.
        $follower = $this->entityManager->getRepository(Follower::class)->findOneBy(['proposal' => 'proposal1', 'user' => 'user1']);
        $statistics = $this->entityManager->getRepository(ProposalStatistics::class)->findOneBy(['proposal' => 'proposal109']);
        $valueResponse = $this->entityManager->getRepository(ValueResponse::class)->findOneBy(['proposal' => 'proposal1', 'question' => 1]);
        $mediaResponse = $this->entityManager->getRepository(MediaResponse::class)->findOneBy(['proposal' => 'proposal1']);
        self::assertNotNull($follower);
        self::assertNotNull($statistics);
        self::assertNotNull($valueResponse);
        self::assertNotNull($mediaResponse);
        $expected = [
            'event:event1' => ['enabled' => true, 'author.id' => 'user5'],
            'project:project1' => ['title' => 'Croissance, innovation, disruption', 'visibility' => 2],
            'consultation:default' => ['id' => 'default'],
            'opinion:' . $scenario['opinion'] => ['title' => 'Rebuild contract opinion', 'published' => true, 'author.id' => $scenario['author']],
            'opinionVersion:version1' => ['title' => 'Modification 1', 'author.id' => 'user5'],
            'proposal:' . $scenario['first'] => ['proposalTitle' => 'Rebuildcontract orchard', 'author.id' => $scenario['author'], 'step.id' => 'collectstep1', 'status.id' => 'status1'],
            'proposal:' . $scenario['incomplete'] => ['completionStatus' => ContributionCompletionStatus::MISSING_REQUIREMENTS],
            'proposal:' . $scenario['draft'] => ['draft' => true],
            'theme:theme1' => ['title' => 'Immobilier'],
            'argument:argument1' => ['body' => 'Coucou, je suis un bel argument !', 'opinion.id' => 'opinion2'],
            'vote:' . $scenario['vote'] => ['value' => 1, 'opinion.id' => $scenario['opinion']],
            'vote:70001' => ['published' => true, 'opinionVersion.id' => 'version2'],
            'reply:reply1' => ['draft' => false, 'author.id' => 'userWelcomattic'],
            'district:district1' => ['id' => 'district1'],
            'source:source1' => ['title' => 'Ma source', 'opinion.id' => 'opinion3'],
            'organization:organization1' => ['email' => 'orga1@toto.com'],
            'post:post1' => ['id' => 'post1'],
            'debateArgument:debateArgument1' => ['voteType' => 'FOR'],
            'debateAnonymousVote:debateAnonymousVoteFor1' => ['voteType' => 'FOR'],
            'debateAnonymousArgument:DebateAnonymousArgumentFor1' => ['voteType' => 'FOR', 'published' => true],
            'questionChoice:questionchoice1' => ['label' => 'Athlétisme', 'position' => 1],
            'comment:eventComment1' => ['author.id' => 'user5'],
            'comment:proposalComment1' => ['author.id' => 'user2'],
            'comment:postComment1' => ['author.id' => 'user3'],
            'response:' . $valueResponse->getId() => ['responseType' => 'value', 'question.id' => 1, 'textValue' => 'souhaitable'],
            'response:' . $mediaResponse->getId() => ['responseType' => 'media'],
            'follower:' . $follower->getId() => ['user.id' => 'user1', 'proposal.id' => 'proposal1'],
            'statistics:' . $statistics->getId() => ['nbrOfMessagesSentToAuthor' => 1],
            'participant:participant1' => ['id' => 'participant1'],
            'user:' . $scenario['author'] => ['username' => 'Rebuild contract author', 'enabled' => true],
        ];

        $this->populate();

        foreach ($expected as $documentId => $fields) {
            $this->assertDocumentFields($documentId, ['objectType' => explode(':', $documentId, 2)[0]] + $fields);
        }
        $this->assertDocumentsAbsent([
            'proposal:' . $scenario['deleted'],
            'opinion:' . $scenario['unpublished'],
            'vote:' . $scenario['excludedVote'],
            'participant:' . $scenario['emptyParticipant'],
        ]);
    }

    public function testRebuildsExactDependentCountersIncludingZero(): void
    {
        $scenario = $this->prepareScenario();

        $this->populate();

        $this->assertDocumentFields('opinion:' . $scenario['opinion'], [
            'votesCount' => 3, 'votesCountOk' => 1, 'votesCountNok' => 1, 'votesCountMitige' => 1,
        ]);
        $this->assertDocumentFields('opinion:' . $scenario['emptyOpinion'], [
            'votesCount' => 0, 'votesCountOk' => 0, 'votesCountNok' => 0, 'votesCountMitige' => 0,
        ]);
        // Two published opinions and two completed proposals; drafts, incomplete and deleted proposals do not count.
        $this->assertDocumentFields('user:' . $scenario['author'], [
            'totalContributionsCount' => 4, 'totalParticipationsCount' => 4, 'totalVotesCount' => 0,
        ]);
        $this->assertDocumentFields('user:' . $scenario['emptyAuthor'], [
            'totalContributionsCount' => 0, 'totalParticipationsCount' => 0, 'totalVotesCount' => 0,
        ]);

        $container = self::getContainer();
        self::assertSame(3, $container->get(VoteSearch::class)->getVotesCountsByOpinion($scenario['opinion'])->getTotalHits());
        $author = $this->entityManager->getRepository(User::class)->find($scenario['author']);
        self::assertSame(4, $container->get(ContributionSearch::class)->getSubmissionsByAuthor($author, 'contributions')->getTotalHits());
    }

    public function testSearchesTheRebuiltIndexWithTermsFiltersAndPagination(): void
    {
        $scenario = $this->prepareScenario();

        $this->populate();

        $search = self::getContainer()->get(ProposalSearch::class);
        $filters = ['author' => $scenario['author'], 'step' => GlobalId::toGlobalId('CollectStep', 'collectstep1')];
        $orders = ['old'];
        $filters['selectionStep'] = null;
        $firstPage = $search->searchProposals(1, $filters, 0, null, 'Rebuildcontract', $orders);
        self::assertSame(2, $firstPage->getTotalCount());
        self::assertSame([$scenario['first']], $this->entityIds($firstPage->getEntities()));
        $cursor = ElasticsearchPaginator::encodeCursor($firstPage->getCursors()[0]);
        $secondPage = $search->searchProposals(1, $filters, 0, $cursor, 'Rebuildcontract', $orders);
        self::assertSame(2, $secondPage->getTotalCount());
        self::assertSame([$scenario['second']], $this->entityIds($secondPage->getEntities()));
        $cursor = ElasticsearchPaginator::encodeCursor($secondPage->getCursors()[0]);
        self::assertSame([], $search->searchProposals(1, $filters, 0, $cursor, 'Rebuildcontract', $orders)->getEntities());

        $byStatus = $search->searchProposals(10, $filters + ['status' => 'status2'], 0, null, 'Rebuildcontract', $orders);
        self::assertSame(1, $byStatus->getTotalCount());
        self::assertSame([$scenario['second']], $this->entityIds($byStatus->getEntities()));
        $byReference = $search->searchProposals(10, $filters + ['reference' => '1-900001'], 0, null, null, $orders);
        self::assertSame(1, $byReference->getTotalCount());
        self::assertSame([$scenario['first']], $this->entityIds($byReference->getEntities()));
        self::assertSame(2, $search->searchProposals(10, $filters + ['restrictedViewerId' => $scenario['author']], 0, null, 'Rebuildcontract', $orders)->getTotalCount());
        self::assertSame(0, $search->searchProposals(10, $filters + ['restrictedViewerId' => $scenario['emptyAuthor']], 0, null, 'Rebuildcontract', $orders)->getTotalCount());
        $wrongStep = ['author' => $scenario['author'], 'step' => GlobalId::toGlobalId('CollectStep', 'collectstep2'), 'selectionStep' => null];
        self::assertSame(0, $search->searchProposals(10, $wrongStep, 0, null, 'Rebuildcontract', $orders)->getTotalCount());
    }

    private function populate(): void
    {
        $this->entityManager->flush();
        $this->entityManager->clear();
        self::assertSame(0, $this->index->count(), 'Assertions must read a reconstruction from an empty index, without an ES snapshot.');

        $this->commandTester->execute([]);

        self::assertSame(Command::SUCCESS, $this->commandTester->getStatusCode(), $this->commandTester->getDisplay());
    }

    /** @return array<string, string> */
    private function prepareScenario(): array
    {
        $author = $this->createAuthor('Rebuild contract author');
        $emptyAuthor = $this->createAuthor('Rebuild contract empty author');
        $unconfirmedAuthor = $this->createAuthor('Rebuild contract unconfirmed author', false);
        $emptyParticipant = (new Participant())->setToken('index-contract-empty')->setCreatedAt(new \DateTime('2020-01-01'));
        $this->entityManager->persist($emptyParticipant);
        $context = $this->entityManager->getRepository(Opinion::class)->find('opinion1');
        self::assertNotNull($context);
        $opinions = [];
        foreach (['opinion', 'emptyOpinion', 'unpublished'] as $name) {
            $opinion = (new Opinion())->setTitle('Rebuild contract ' . $name)->setBody('Index reconstruction contract')
                ->setAuthor('unpublished' === $name ? $unconfirmedAuthor : $author)
                ->setCreatedAt(new \DateTime('2020-01-01'))
                ->setConsultation($context->getConsultation())->setOpinionType($context->getOpinionType())
            ;
            if ('unpublished' !== $name) {
                $opinion->setPublishedAt(new \DateTime('2020-01-01'));
            }
            $this->entityManager->persist($opinion);
            $opinions[$name] = $opinion;
        }
        $votes = [];
        foreach ([1, 0, -1] as $position => $value) {
            $voter = $this->entityManager->getRepository(User::class)->find('user' . ($position + 1));
            $vote = (new OpinionVote())->setOpinion($opinions['opinion'])->setUser($voter)->setValue($value)->setPublishedAt(new \DateTime('2020-01-01'));
            $this->entityManager->persist($vote);
            $votes[] = $vote;
        }
        $excludedVote = (new OpinionVote())->setOpinion($opinions['unpublished'])->setUser($author)->setValue(1)->setPublishedAt(new \DateTime('2020-01-01'));
        $this->entityManager->persist($excludedVote);

        $proposalContext = $this->entityManager->getRepository(Proposal::class)->find('proposal1');
        self::assertNotNull($proposalContext);
        $proposals = [];
        foreach (['first', 'second', 'incomplete', 'draft', 'deleted'] as $position => $name) {
            $proposal = (new Proposal())->setTitle('Rebuildcontract ' . ('first' === $name ? 'orchard' : $name))
                ->setBody('Index reconstruction contract')->setAuthor($author)->setProposalForm($proposalContext->getProposalForm())
                ->setReference(900001 + $position)->setCreatedAt(new \DateTime('2020-01-0' . ($position + 1)))
                ->setStatus($this->entityManager->getRepository(Status::class)->find('second' === $name ? 'status2' : 'status1'))
            ;
            if ('draft' === $name) {
                $proposal->setDraft(true);
            } else {
                $proposal->setDraft(false)->setPublishedAt(new \DateTime('2020-01-01'));
            }
            if ('deleted' === $name) {
                $proposal->setDeletedAt(new \DateTime('2020-02-01'));
            }
            if ('incomplete' === $name) {
                $proposal->setMissingRequirementsStatus();
            }
            $this->entityManager->persist($proposal);
            $proposals[$name] = $proposal;
        }
        $this->entityManager->flush();

        $ids = ['author' => $author->getId(), 'emptyAuthor' => $emptyAuthor->getId(), 'vote' => $votes[0]->getId(), 'excludedVote' => $excludedVote->getId(), 'emptyParticipant' => $emptyParticipant->getId()];
        foreach ($opinions + $proposals as $name => $entity) {
            $ids[$name] = $entity->getId();
        }

        return $ids;
    }

    private function createAuthor(string $username, bool $emailConfirmed = true): User
    {
        $author = (new User())->setUsername($username)->setEmail(bin2hex(random_bytes(8)) . '@index-contract.test')
            ->setEnabled($emailConfirmed)->setConfirmationToken($emailConfirmed ? null : 'index-contract-unconfirmed')
        ;
        $this->entityManager->persist($author);

        return $author;
    }

    /** @param array<string, mixed> $fields */
    private function assertDocumentFields(string $documentId, array $fields): void
    {
        $data = $this->index->getDocument($documentId)->getData();
        foreach ($fields as $path => $expected) {
            $value = $data;
            foreach (explode('.', $path) as $key) {
                self::assertIsArray($value, $documentId . ': ' . $path);
                self::assertArrayHasKey($key, $value, $documentId . ': ' . $path);
                $value = $value[$key];
            }
            self::assertSame($expected, $value, $documentId . ': ' . $path);
        }
    }

    /** @param list<string> $documentIds */
    private function assertDocumentsAbsent(array $documentIds): void
    {
        $results = $this->index->search(new Query((new Ids())->setIds($documentIds)));
        self::assertSame([], array_map(static fn ($result): string => $result->getId(), $results->getResults()), 'Excluded documents must not be indexed.');
    }

    /**
     * @param array<object> $entities
     *
     * @return list<string>
     */
    private function entityIds(array $entities): array
    {
        return array_values(array_map(static fn (object $entity): string => $entity->getId(), $entities));
    }
}
