<?php

namespace Capco\Tests\Controller\Api;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\PublicApiToken;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * @internal
 * @coversNothing
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises GraphQL over HTTP; observes hydration only for the explicit performance regression.
 */
class QuestionnaireResultsAccessTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->client = self::createClient();
        $this->client->disableReboot();
        $this->entityManager = self::getContainer()->get('doctrine')->getManager();
        $this->entityManager->getConnection()->beginTransaction();
    }

    protected function tearDown(): void
    {
        $this->entityManager->getConnection()->rollBack();
        $this->entityManager->clear();
        parent::tearDown();
    }

    public function testReadingOwnReplyCountDoesNotHydrateQuestionnairesOrProjects(): void
    {
        $query = '{ viewer { replies(first: 0) { totalCount } } }';
        $data = $this->request('user5', $query);

        self::assertGreaterThan(0, $data['viewer']['replies']['totalCount']);
        $this->assertNoQuestionnairesOrProjectsHydrated();

        $otherOwner = $this->entityManager->find(User::class, 'userTheo');
        self::assertInstanceOf(User::class, $otherOwner);
        for ($i = 0; $i < 30; ++$i) {
            $this->entityManager->persist((new Questionnaire())
                ->setTitle('Unrelated questionnaire ' . $i)
                ->setOwner($otherOwner));
        }
        $this->entityManager->flush();
        $this->entityManager->clear();

        self::assertSame($data, $this->request('user5', $query));
        $this->assertNoQuestionnairesOrProjectsHydrated();
    }

    public function testUserReplyPagesAreCappedWithoutTruncatingTheCount(): void
    {
        $query = 'query($first: Int!, $after: String) {
            viewer { replies(first: $first, after: $after) {
                totalCount edges { cursor node { id } } pageInfo { endCursor hasNextPage }
            } }
        }';
        $before = $this->request('user5', $query, ['first' => 0])['viewer']['replies']['totalCount'];
        $author = $this->entityManager->find(User::class, 'user5');
        $questionnaire = $this->entityManager->find(Questionnaire::class, 'questionnaire1');
        self::assertInstanceOf(User::class, $author);
        self::assertInstanceOf(Questionnaire::class, $questionnaire);
        for ($i = 0; $i < 101; ++$i) {
            $this->entityManager->persist((new \Capco\AppBundle\Entity\Reply())
                ->setAuthor($author)->setQuestionnaire($questionnaire));
        }
        $this->entityManager->flush();

        $page = $this->request('user5', $query, ['first' => 1000])['viewer']['replies'];
        self::assertCount(100, $page['edges']);
        self::assertSame($before + 101, $page['totalCount']);
        self::assertTrue($page['pageInfo']['hasNextPage']);
        $next = $this->request('user5', $query, ['first' => 1, 'after' => $page['pageInfo']['endCursor']])['viewer']['replies'];
        self::assertSame($page['totalCount'], $next['totalCount']);
        self::assertCount(1, $next['edges']);
        self::assertSame([], array_intersect(array_column($page['edges'], 'cursor'), array_column($next['edges'], 'cursor')));
    }

    /** @dataProvider visibleStepFilters */
    public function testMixedProjectCountsPreserveVisibleStepFilters(string $stepId, string $stepType, string $authorId, string $viewerId): void
    {
        $projectId = 'projectWithAnonymousQuestionnaire';
        $this->entityManager->getConnection()->update('project_abstractstep', ['project_id' => $projectId], ['step_id' => $stepId]);
        $this->entityManager->getConnection()->update('project_abstractstep', ['project_id' => $projectId], ['step_id' => 'debateStepCannabis']);
        $author = $this->entityManager->find(User::class, $authorId);
        self::assertInstanceOf(User::class, $author);
        $term = 'VisibleStepAuthor' . bin2hex(random_bytes(8));
        $this->entityManager->getConnection()->update('fos_user', ['username' => $term], ['id' => $authorId]);
        $query = 'query($project: ID!, $step: ID!, $questionnaire: ID!, $foreign: ID!, $term: String!, $missing: String!, $wrongVip: Boolean!, $after: String) {
            node(id: $project) { ... on Project {
                global: contributors { totalCount }
                projectProbe: contributors(term: $missing) { totalCount }
                projectCountOnly: contributors(term: $term) { totalCount }
                projectWithEdges: contributors(term: $term, first: 100, after: $after) {
                    totalCount edges { node { id } } pageInfo { endCursor hasNextPage }
                }
                questionnaireProbe: contributors(step: $questionnaire, term: $missing) { totalCount }
                foreignProbe: contributors(step: $foreign, term: $missing) { totalCount }
                countOnly: contributors(step: $step, term: $term) { totalCount }
                withEdges: contributors(step: $step, term: $term, first: 100, after: $after) {
                    totalCount edges { node { id } } pageInfo { endCursor hasNextPage }
                }
                missing: contributors(step: $step, term: $missing) { totalCount }
                wrongVip: contributors(step: $step, term: $term, vip: $wrongVip) { totalCount }
            } }
        }';
        $variables = [
            'project' => GlobalId::toGlobalId('Project', $projectId),
            'step' => GlobalId::toGlobalId($stepType, $stepId),
            'questionnaire' => GlobalId::toGlobalId('QuestionnaireStep', 'qStepProjectAnonymousQuestionnaire'),
            'foreign' => GlobalId::toGlobalId('CollectStep', 'collectstep2'),
            'term' => $term,
            'missing' => 'no-contributor-' . bin2hex(random_bytes(8)),
            'wrongVip' => !$author->isVip(),
        ];
        $data = $this->request($viewerId, $query, $variables)['node'];
        self::assertSame(0, $data['missing']['totalCount']);
        self::assertSame(0, $data['wrongVip']['totalCount']);
        self::assertGreaterThan(0, $data['global']['totalCount']);
        self::assertSame(0, $data['projectProbe']['totalCount']);
        if ('userTheo' === $viewerId) {
            foreach (['questionnaireProbe', 'foreignProbe'] as $field) {
                self::assertSame($data['global'], $data[$field]);
            }
        } else {
            self::assertSame(0, $data['questionnaireProbe']['totalCount']);
            self::assertSame(0, $data['foreignProbe']['totalCount']);
        }
        self::assertSame(1, $data['projectCountOnly']['totalCount']);
        self::assertSame($data['projectCountOnly']['totalCount'], $data['projectWithEdges']['totalCount']);
        self::assertSame($data['projectWithEdges']['edges'], $data['withEdges']['edges']);
        self::assertSame([['node' => ['id' => GlobalId::toGlobalId('User', $authorId)]]], $data['withEdges']['edges']);
        self::assertSame(1, $data['countOnly']['totalCount']);
        self::assertSame($data['countOnly']['totalCount'], $data['withEdges']['totalCount']);
        self::assertFalse($data['withEdges']['pageInfo']['hasNextPage']);
        $variables['after'] = $data['withEdges']['pageInfo']['endCursor'];
        $after = $this->request($viewerId, $query, $variables)['node'];
        self::assertSame([], $after['projectWithEdges']['edges']);
        self::assertSame(1, $after['projectWithEdges']['totalCount']);
        self::assertSame([], $after['withEdges']['edges']);
        self::assertSame($data['countOnly']['totalCount'], $after['withEdges']['totalCount']);
    }

    public function testQuestionnaireOnlyContributorFiltersPreserveSafeVolumes(): void
    {
        $query = 'query($project: ID!, $term: String!) {
            node(id: $project) { ... on Project {
                global: contributors(first: 1) {
                    totalCount edges { node { id } } pageInfo { endCursor hasNextPage }
                }
                filtered: contributors(first: 1, term: $term) {
                    totalCount edges { node { id } } pageInfo { endCursor hasNextPage }
                }
            } }
        }';
        $data = $this->request('userTheo', $query, [
            'project' => GlobalId::toGlobalId('Project', 'projectWithAnonymousQuestionnaire'),
            'term' => 'no-contributor-' . bin2hex(random_bytes(8)),
        ])['node'];

        self::assertGreaterThan(0, $data['global']['totalCount']);
        self::assertSame([], $data['global']['edges']);
        self::assertSame(['endCursor' => null, 'hasNextPage' => false], $data['global']['pageInfo']);
        self::assertSame($data['global'], $data['filtered']);
    }

    /** @return iterable<string, array{string, string, string, string}> */
    public static function visibleStepFilters(): iterable
    {
        yield 'restricted collect step' => ['collectstep1', 'CollectStep', 'userWelcomattic', 'userTheo'];
        yield 'restricted consultation step' => ['cstep1', 'ConsultationStep', 'user5', 'userTheo'];
        yield 'manager collect step' => ['collectstep1', 'CollectStep', 'userWelcomattic', 'userAdmin'];
        yield 'manager consultation step' => ['cstep1', 'ConsultationStep', 'user5', 'userAdmin'];
    }

    /** @dataProvider resultManagers */
    public function testProjectOwnershipTakesPrecedenceAcrossReplyReadPaths(
        bool $attached,
        ?string $owner,
        ?string $organization,
        string $viewer,
        bool $allowed
    ): void {
        $connection = $this->entityManager->getConnection();
        // This reply belongs to user1. Managers below cannot rely on author access.
        // Private participation excludes the independent public-profile metadata grant.
        $connection->update('reply', ['private' => true], ['id' => 'replyQuestionnaireAnonPOwner']);
        $connection->update('questionnaire', [
            'owner_id' => $attached ? 'user5' : $owner,
            'organizationOwner_id' => $attached ? null : $organization,
            'step_id' => $attached ? 'qStepOwnerAnonQuestionnaire' : null,
        ], ['id' => 'questionnaireProjectOwnerAnonymous']);
        if ($attached) {
            $connection->update('project', [
                'owner_id' => $owner,
                'organizationOwner_id' => $organization,
            ], ['id' => 'projectWithOwner']);
        }

        $replyId = GlobalId::toGlobalId('Reply', 'replyQuestionnaireAnonPOwner');
        $data = $this->request($viewer, '
            query($reply: ID!, $author: ID!, $project: ID!, $attached: Boolean!) {
                direct: node(id: $reply) { id }
                author: node(id: $author) {
                    ... on User { replies(first: 100) { edges { node { id } } } }
                }
                project: node(id: $project) @include(if: $attached) {
                    ... on Project { contributions(first: 100, type: REPLY) { edges { node { id } } } }
                }
            }
        ', [
            'reply' => $replyId,
            'author' => GlobalId::toGlobalId('User', 'user1'),
            'project' => GlobalId::toGlobalId('Project', 'projectWithOwner'),
            'attached' => $attached,
        ]);

        self::assertSame($allowed ? ['id' => $replyId] : null, $data['direct']);
        $replyEdge = ['node' => ['id' => $replyId]];
        self::assertSame($allowed, \in_array($replyEdge, $data['author']['replies']['edges'], true));
        if ($attached) {
            self::assertSame($allowed, \in_array($replyEdge, $data['project']['contributions']['edges'], true));
        }
    }

    /** @return \Generator<string, array{bool, null|string, null|string, string, bool}> */
    public static function resultManagers(): \Generator
    {
        yield 'project owner differs from questionnaire owner' => [true, 'userTheo', null, 'userTheo', true];
        yield 'questionnaire owner cannot override project owner' => [true, 'userTheo', null, 'user5', false];
        yield 'project organization admin' => [true, null, 'organization2', 'valerieMassonDelmotte', true];
        yield 'project organization ordinary member' => [true, null, 'organization2', 'ChristopheCassou', true];
        yield 'project member of multiple organizations' => [true, null, 'organization2', 'userMultipleOrganizations', true];
        yield 'other project organization' => [true, null, 'organization2', 'userMickael', false];
        yield 'project user owner overrides organization' => [true, 'userTheo', 'organization2', 'ChristopheCassou', false];
        yield 'project user owner retains access' => [true, 'userTheo', 'organization2', 'userTheo', true];
        yield 'ownerless project never falls back to questionnaire owner' => [true, null, null, 'user5', false];
        yield 'standalone owner' => [false, 'userTheo', null, 'userTheo', true];
        yield 'standalone non-owner' => [false, 'userTheo', null, 'user5', false];
        yield 'standalone organization admin' => [false, null, 'organization2', 'valerieMassonDelmotte', true];
        yield 'standalone organization ordinary member' => [false, null, 'organization2', 'ChristopheCassou', true];
        yield 'other standalone organization' => [false, null, 'organization2', 'userMickael', false];
        yield 'standalone user owner overrides organization' => [false, 'userTheo', 'organization2', 'ChristopheCassou', false];
        yield 'standalone user owner retains access' => [false, 'userTheo', 'organization2', 'userTheo', true];
    }

    private function assertNoQuestionnairesOrProjectsHydrated(): void
    {
        foreach ($this->entityManager->getUnitOfWork()->getIdentityMap() as $entities) {
            foreach ($entities as $entity) {
                self::assertNotInstanceOf(Questionnaire::class, $entity);
                self::assertNotInstanceOf(AbstractStep::class, $entity);
                self::assertNotInstanceOf(Project::class, $entity);
            }
        }
    }

    /**
     * @param array<string, mixed> $variables
     *
     * @return array<string, mixed>
     */
    private function request(string $viewerId, string $query, array $variables = []): array
    {
        $viewer = $this->entityManager->find(User::class, $viewerId);
        self::assertInstanceOf(User::class, $viewer);
        $token = bin2hex(random_bytes(16));
        $this->entityManager->persist(new PublicApiToken($viewer, $token));
        $this->entityManager->flush();
        $this->entityManager->clear();
        $this->client->request('POST', 'https://capco.test/graphql/internal', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ], json_encode(['query' => $query, 'variables' => $variables], \JSON_THROW_ON_ERROR));

        self::assertResponseIsSuccessful();
        $body = json_decode((string) $this->client->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
        self::assertArrayNotHasKey('errors', $body, json_encode($body, \JSON_THROW_ON_ERROR));

        return $body['data'];
    }
}
