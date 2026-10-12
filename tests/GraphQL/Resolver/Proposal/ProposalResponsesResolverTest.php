<?php

namespace Capco\Tests\GraphQL\Resolver\Proposal;

use Capco\Tests\ResponseVisibilityWebTestCase;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class ProposalResponsesResolverTest extends ResponseVisibilityWebTestCase
{
    /**
     * @dataProvider viewers
     *
     * @param list<string> $expected
     */
    public function testPrivateAndHiddenResponsesRespectTheViewer(string $kind, array $expected): void
    {
        $author = $this->account();
        $contribution = $this->contribution('Proposal', $author);
        self::assertInstanceOf(\Capco\AppBundle\Entity\Proposal::class, $contribution);
        if ('author' === $kind) {
            $this->login($author->getEmail());
        } elseif ('admin' === $kind) {
            $admin = $this->account()->addRole('ROLE_ADMIN');
            $this->em->flush();
            $this->login($admin->getEmail());
        } elseif ('analyst' === $kind) {
            $analyst = $this->account();
            $assignment = new \Capco\AppBundle\Entity\ProposalAnalyst($contribution, $analyst);
            $contribution->addProposalAnalyst($assignment);
            $this->em->persist($assignment);
            $this->em->flush();
            $this->login($analyst->getEmail());
        } elseif ('other' === $kind) {
            $this->login($this->account()->getEmail());
        }
        $this->assertVisibleResponses('Proposal', $contribution->getId(), $expected);
    }

    /** @return iterable<string, array{string, list<string>}> */
    public static function viewers(): iterable
    {
        yield 'anonymous' => ['anonymous', ['Answer public']];
        yield 'unrelated account' => ['other', ['Answer public']];
        yield 'author' => ['author', ['Answer public', 'Answer private']];
        yield 'assigned analyst' => ['analyst', ['Answer public', 'Answer private', 'Answer hidden']];
        yield 'administrator' => ['admin', ['Answer public', 'Answer private', 'Answer hidden']];
    }

    /**
     * @dataProvider participantTokens
     *
     * @param list<string> $expected
     */
    public function testParticipantCookieExposesOnlyItsAuthorsPrivateResponses(string $kind, array $expected): void
    {
        $proposal = $this->contribution('Proposal', $this->account());
        $author = (new \Capco\AppBundle\Entity\Participant())->setToken('participant-' . bin2hex(random_bytes(8)));
        $other = (new \Capco\AppBundle\Entity\Participant())->setToken('participant-' . bin2hex(random_bytes(8)));
        $proposal->setAuthor(null)->setParticipant($author);
        $this->em->persist($author);
        $this->em->persist($other);
        $this->em->flush();
        if ('missing' !== $kind) {
            $token = 'author' === $kind ? $author->getToken() : ('other' === $kind ? $other->getToken() : 'invalid');
            $this->browser->getCookieJar()->set(new \Symfony\Component\BrowserKit\Cookie('CapcoParticipant', $token));
        }
        if ('invalid' === $kind) {
            $this->browser->jsonRequest('POST', '/graphql/internal', [
                'query' => 'query($id: ID!) { node(id: $id) { ... on Proposal { responses { ... on ValueResponse { value } } } } }',
                'variables' => ['id' => \Overblog\GraphQLBundle\Relay\Node\GlobalId::toGlobalId('Proposal', $proposal->getId())],
            ]);
            self::assertResponseStatusCodeSame(401);
            $body = json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
            self::assertSame('INVALID_PARTICIPANT_COOKIE', $body['errors'][0]['extensions']['code']);
            self::assertArrayNotHasKey('data', $body);

            return;
        }
        $this->assertVisibleResponses('Proposal', $proposal->getId(), $expected);
    }

    /** @return iterable<string, array{string, list<string>}> */
    public static function participantTokens(): iterable
    {
        yield 'author token' => ['author', ['Answer public', 'Answer private']];
        yield 'another participant' => ['other', ['Answer public']];
        yield 'invalid token' => ['invalid', []];
        yield 'missing token' => ['missing', ['Answer public']];
    }
}
