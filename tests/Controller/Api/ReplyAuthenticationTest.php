<?php

namespace Capco\Tests\Controller\Api;

use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\BrowserKit\Cookie;

/**
 * @internal
 * @coversNothing
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Verifies reply authentication through GraphQL HTTP requests with SQL rollback.
 */
class ReplyAuthenticationTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        $this->client = self::createClient(['environment' => 'test']);
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

    public function testParticipantCookieAuthorizesRepliesDespiteSiblingTokenValidation(): void
    {
        $client = $this->client;
        $client->getCookieJar()->set(new Cookie('CapcoParticipant', base64_encode('fakeToken1')));
        $id = GlobalId::toGlobalId('Reply', 'replyAnonymous1');
        $client->jsonRequest('POST', '/graphql/internal', [
            'query' => 'query($id: ID!) {
                before: node(id: $id) { id }
                participant(token: "fakeToken2") { id }
                after: node(id: $id) { id }
            }',
            'variables' => ['id' => $id],
        ]);
        self::assertResponseIsSuccessful();
        $body = json_decode((string) $client->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
        self::assertArrayNotHasKey('errors', $body);
        self::assertSame(['id' => $id], $body['data']['before']);
        self::assertSame(['id' => $id], $body['data']['after']);
        self::assertTrue($client->getResponse()->headers->hasCacheControlDirective('no-store'));
    }

    public function testCrossSiteCookieRequestIsRejectedBeforeExecution(): void
    {
        $client = $this->client;
        $client->getCookieJar()->set(new Cookie('CapcoParticipant', base64_encode('fakeToken1')));
        $client->request('POST', '/graphql/internal', ['query' => '{ __typename }'], [], ['HTTP_ORIGIN' => 'https://untrusted.example']);
        self::assertResponseStatusCodeSame(403);
    }

    public function testParticipantReplyPagesAreCappedWithoutTruncatingTheCount(): void
    {
        $reply = $this->entityManager->find(\Capco\AppBundle\Entity\Reply::class, 'replyAnonymous1');
        self::assertInstanceOf(\Capco\AppBundle\Entity\Reply::class, $reply);
        for ($i = 0; $i < 101; ++$i) {
            $this->entityManager->persist((new \Capco\AppBundle\Entity\Reply())
                ->setParticipant($reply->getParticipant())->setQuestionnaire($reply->getQuestionnaire()));
        }
        $this->entityManager->flush();
        $this->client->getCookieJar()->set(new Cookie('CapcoParticipant', base64_encode('fakeToken1')));
        $query = 'query($first: Int!, $after: String) {
            participant(token: "fakeToken1") { replies(first: $first, after: $after) {
                totalCount edges { cursor node { id } } pageInfo { endCursor hasNextPage }
            } }
        }';
        $this->client->jsonRequest('POST', '/graphql/internal', ['query' => $query, 'variables' => ['first' => 1000]]);
        self::assertResponseIsSuccessful();
        $body = json_decode((string) $this->client->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
        self::assertArrayNotHasKey('errors', $body);
        $page = $body['data']['participant']['replies'];
        self::assertCount(100, $page['edges']);
        self::assertGreaterThanOrEqual(101, $page['totalCount']);
        self::assertTrue($page['pageInfo']['hasNextPage']);

        $this->client->jsonRequest('POST', '/graphql/internal', ['query' => $query, 'variables' => ['first' => 1, 'after' => $page['pageInfo']['endCursor']]]);
        self::assertResponseIsSuccessful();
        $body = json_decode((string) $this->client->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
        self::assertArrayNotHasKey('errors', $body);
        $next = $body['data']['participant']['replies'];
        self::assertSame($page['totalCount'], $next['totalCount']);
        self::assertCount(1, $next['edges']);
        self::assertSame([], array_intersect(array_column($page['edges'], 'cursor'), array_column($next['edges'], 'cursor')));
    }

    /** @dataProvider credentials */
    public function testReplyCredentialPrecedence(?string $participantToken, bool $replyCookie, bool $signedIn, int $status, bool $allowed): void
    {
        $client = $this->client;
        $id = GlobalId::toGlobalId('Reply', 'replyAnonymous1');
        if (null !== $participantToken) {
            $client->getCookieJar()->set(new Cookie('CapcoParticipant', base64_encode($participantToken)));
        }
        if ($replyCookie) {
            $cookie = base64_encode(json_encode([
                GlobalId::toGlobalId('Questionnaire', 'questionnaireAnonymous') => [['replyId' => $id, 'token' => 'fakeToken1']],
            ], \JSON_THROW_ON_ERROR));
            $client->getCookieJar()->set(new Cookie('CapcoAnonReply', $cookie));
        }
        $client->jsonRequest('POST', '/graphql/internal', [
            'query' => 'query($id: ID!) { participant(token: "fakeToken1") { id } node(id: $id) { id } }',
            'variables' => ['id' => $id],
        ], $signedIn ? ['HTTP_AUTHORIZATION' => 'Bearer iamthetokenofuser'] : []);
        self::assertResponseStatusCodeSame($status);
        $body = json_decode((string) $client->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
        if (401 === $status) {
            self::assertSame('INVALID_PARTICIPANT_COOKIE', $body['errors'][0]['extensions']['code']);
            self::assertArrayNotHasKey('data', $body);
        } else {
            self::assertArrayNotHasKey('errors', $body);
            self::assertSame($allowed ? ['id' => $id] : null, $body['data']['node']);
        }
    }

    /** @return \Generator<string, array{null|string, bool, bool, int, bool}> */
    public static function credentials(): \Generator
    {
        yield 'sibling token alone grants nothing' => [null, false, false, 200, false];
        yield 'exact reply cookie remains supported' => [null, true, false, 200, true];
        yield 'different participant overrides reply cookie' => ['fakeToken2', true, false, 200, false];
        yield 'invalid participant never falls back to reply cookie' => ['invalid', true, false, 401, false];
        yield 'signed-in user ignores valid participant cookies' => ['fakeToken1', true, true, 200, false];
        yield 'signed-in user ignores invalid participant cookies' => ['invalid', true, true, 200, false];
    }
}
