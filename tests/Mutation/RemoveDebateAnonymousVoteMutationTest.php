<?php

namespace Capco\Tests\Mutation;

use Capco\Tests\IdentityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class RemoveDebateAnonymousVoteMutationTest extends IdentityWebTestCase
{
    /** @dataProvider removals */
    public function testOnlyMatchingVotesInAnOpenDebateAreRemoved(string $kind, ?string $error): void
    {
        $debate = $this->em->getRepository(\Capco\AppBundle\Entity\Debate\Debate::class)->findOneBy([]);
        $debate->getStep()->setTimeless('closed' !== $kind);
        if ('closed' === $kind) {
            $debate->getStep()->setEndAt(new \DateTime('2000-01-01'));
        }
        $vote = (new \Capco\AppBundle\Entity\Debate\DebateAnonymousVote())->setDebate($debate)->setType('FOR')->setToken('vote-' . bin2hex(random_bytes(8)));
        $neighbor = (new \Capco\AppBundle\Entity\Debate\DebateAnonymousVote())->setDebate($debate)->setType('AGAINST')->setToken('vote-' . bin2hex(random_bytes(8)));
        $argument = (new \Capco\AppBundle\Entity\Debate\DebateAnonymousArgument($debate))->setType('FOR')->setToken('argument-' . bin2hex(random_bytes(8)))->setEmail($this->uniqueEmail())->setBody('Associated argument');
        foreach ([$vote, $neighbor, $argument] as $entity) {
            $this->em->persist($entity);
        }
        $this->em->flush();
        $voteId = $vote->getId();
        $neighborId = $neighbor->getId();
        $argumentId = $argument->getId();
        $hash = 'invalid' === $kind ? 'invalid' : base64_encode('FOR:' . ('not voted' === $kind ? 'missing-vote' : $vote->getToken()));
        $input = ['debateId' => GlobalId::toGlobalId('Debate', 'missing' === $kind ? 'missing' : $debate->getId()), 'hash' => $hash];
        if ('with argument' === $kind) {
            $input['argumentHash'] = base64_encode('FOR:' . $argument->getToken());
        }
        $result = $this->graphql('mutation($input: RemoveDebateAnonymousVoteInput!) { removeDebateAnonymousVote(input: $input) { errorCode deletedDebateAnonymousVoteId deletedDebateAnonymousArgumentId } }', ['input' => $input])['removeDebateAnonymousVote'];
        self::assertSame($error, $result['errorCode']);
        self::assertSame(null === $error ? GlobalId::toGlobalId('DebateAnonymousVote', $voteId) : null, $result['deletedDebateAnonymousVoteId']);
        self::assertSame('with argument' === $kind ? GlobalId::toGlobalId('DebateArgument', $argumentId) : null, $result['deletedDebateAnonymousArgumentId']);
        $this->em->clear();
        self::assertSame(null === $error, null === $this->em->find(\Capco\AppBundle\Entity\Debate\DebateAnonymousVote::class, $voteId));
        self::assertSame('with argument' === $kind, null === $this->em->find(\Capco\AppBundle\Entity\Debate\DebateAnonymousArgument::class, $argumentId));
        self::assertNotNull($this->em->find(\Capco\AppBundle\Entity\Debate\DebateAnonymousVote::class, $neighborId));
    }

    /** @return iterable<string, array{string, ?string}> */
    public static function removals(): iterable
    {
        yield 'vote only' => ['vote', null];
        yield 'vote and associated argument' => ['with argument', null];
        yield 'missing debate' => ['missing', 'UNKNOWN_DEBATE'];
        yield 'not voted' => ['not voted', 'NOT_VOTED'];
        yield 'invalid hash' => ['invalid', 'INVALID_HASH'];
        yield 'closed debate' => ['closed', 'CLOSED_DEBATE'];
    }
}
