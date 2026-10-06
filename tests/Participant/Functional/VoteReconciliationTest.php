<?php

namespace Capco\Tests\Participant\Functional;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason HTTP reconciliation verifies persisted ballots and replay; indexation is replaced at its external boundary.
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
final class VoteReconciliationTest extends ParticipantWebTestCase
{
    private bool $indexationFails = false;

    /** @dataProvider identities */
    public function testPersistedMergeIsIdempotentAndPreservesProposals(string $type, bool $toUser): void
    {
        [$step, $source, $target, $votes, $proposals] = $this->ballots($type, $toUser);
        $duplicateVoteId = $votes[1]->getId();
        $sourceId = $source->getId();
        $targetId = $target->getId();
        $titles = array_map(static fn (Proposal $proposal) => $proposal->getTitle(), $proposals);
        $this->participationCookies($source);
        $result = $this->confirmPhone($source);
        self::assertNull($result['errorCode']);
        self::assertSame($toUser ? 'USER_AUTHENTICATED' : 'PARTICIPANT_MERGED', $result['reconciliationMode']);
        $this->em->clear();
        $step = $this->em->find($step::class, $step->getId());
        $target = $this->em->find($target::class, $targetId);
        self::assertNull($this->em->find(Participant::class, $sourceId));
        /** @var ProposalCollectVoteRepository|ProposalSelectionVoteRepository $repository */
        $repository = $this->em->getRepository($votes[0]::class);
        $criteria = ['collect' === $type ? 'collectStep' : 'selectionStep' => $step];
        $this->assertViewer($toUser, $toUser ? $targetId : null);
        $targetCriteria = $criteria + [$toUser ? 'user' : 'participant' => $target];
        self::assertCount(3, $repository->findBy($targetCriteria));
        self::assertCount(0, $repository->findBy($criteria + ['participant' => $sourceId]));
        self::assertNull($repository->find($duplicateVoteId), 'The duplicate target vote is removed.');
        foreach ($proposals as $index => $proposal) {
            self::assertSame($titles[$index], $this->em->find(Proposal::class, $proposal->getId())->getTitle());
        }
        /** @var list<ProposalCollectVote|ProposalSelectionVote> $persistedVotes */
        $persistedVotes = $repository->findBy($targetCriteria);
        $actualProposals = array_map(static fn (AbstractVote $vote) => $vote->getProposal()->getId(), $persistedVotes);
        $expectedProposals = array_map(static fn (Proposal $proposal) => $proposal->getId(), $proposals);
        sort($actualProposals);
        sort($expectedProposals);
        self::assertSame($expectedProposals, $actualProposals);
        foreach ($persistedVotes as $vote) {
            self::assertSame($toUser ? $targetId : null, $vote->getUser()?->getId());
            self::assertSame($toUser ? null : $targetId, $vote->getParticipant()?->getId());
        }
        $ids = array_map(static fn (AbstractVote $vote) => $vote->getId(), $persistedVotes);
        // Replaying the same token through HTTP must not change the established ballot.
        $token = base64_encode($source->getToken());
        $replay = $this->graphResponse('mutation($input: VerifyParticipantPhoneNumberInput!) { verifyParticipantPhoneNumber(input: $input) { errorCode reconciliationMode } }', ['input' => ['token' => $token, 'code' => '123456']]);
        if ($toUser) {
            self::assertSame(['verifyParticipantPhoneNumber'], $replay['errors'][0]['path']);
            self::assertSame('Participant not found.', $replay['errors'][0]['message']);
            self::assertNull($replay['data']['verifyParticipantPhoneNumber']);
        } else {
            self::assertSame('PHONE_ALREADY_CONFIRMED', $replay['data']['verifyParticipantPhoneNumber']['errorCode']);
        }
        $this->em->clear();
        /** @var list<ProposalCollectVote|ProposalSelectionVote> $replayedVotes */
        $replayedVotes = $repository->findBy($targetCriteria);
        $replayedIds = array_map(static fn (AbstractVote $vote) => $vote->getId(), $replayedVotes);
        sort($ids);
        sort($replayedIds);
        self::assertSame($ids, $replayedIds);
    }

    /** @dataProvider identities */
    public function testCharacterizationGapIndexationFailureLeavesPartialPersistedReconciliation(string $type, bool $toUser): void
    {
        [$step, $source, $target, $votes] = $this->ballots($type, $toUser);
        $sourceId = $source->getId();
        $targetId = $target->getId();
        $ids = array_map(static fn (AbstractVote $vote) => $vote->getId(), $votes);
        $this->indexationFails = true;
        $this->participationCookies($source);
        $result = $this->graphResponse('mutation($input: VerifyParticipantPhoneNumberInput!) { verifyParticipantPhoneNumber(input: $input) { errorCode reconciliationMode } }', ['input' => ['token' => base64_encode($source->getToken()), 'code' => '123456']]);

        self::assertSame(['verifyParticipantPhoneNumber'], $result['errors'][0]['path']);
        self::assertSame('Internal server Error', $result['errors'][0]['message']);
        self::assertNull($result['data']['verifyParticipantPhoneNumber']);
        $this->em->clear();
        /** @var ProposalCollectVoteRepository|ProposalSelectionVoteRepository $repository */
        $repository = $this->em->getRepository($votes[0]::class);
        // The workflow reports failure after deleting the duplicate; it does not roll back SQL.
        self::assertNull($repository->find($ids[1]));
        foreach ([0, 2, 3] as $index) {
            $vote = $repository->find($ids[$index]);
            self::assertNotNull($vote);
            self::assertSame(0 === $index && $toUser ? $targetId : null, $vote->getUser()?->getId());
            self::assertSame(0 === $index ? ($toUser ? null : $targetId) : $sourceId, $vote->getParticipant()?->getId());
        }
        $persistedSource = $this->em->find(Participant::class, $sourceId);
        self::assertInstanceOf(Participant::class, $persistedSource);
        self::assertTrue($persistedSource->isPhoneConfirmed());
    }

    /** @return iterable<string, array{string, bool}> */
    public static function identities(): iterable
    {
        foreach (['collect', 'selection'] as $type) {
            yield $type . ' to user' => [$type, true];
            yield $type . ' to participant' => [$type, false];
        }
    }

    protected function createIndexer(): Indexer
    {
        $indexer = $this->createStub(Indexer::class);
        $indexer->method('finishBulk')->willReturnCallback(function (): void {
            if ($this->indexationFails) {
                throw new \RuntimeException('Indexation failed');
            }
        });

        return $indexer;
    }

    /** @return array{CollectStep|SelectionStep, Participant, User|Participant, list<ProposalCollectVote|ProposalSelectionVote>, list<Proposal>} */
    private function ballots(string $type, bool $toUser): array
    {
        $email = $this->uniqueEmail();
        $source = (new Participant())->setToken(bin2hex(random_bytes(24)))->setEmail($email)->setPhone('+33609988768');
        $target = $toUser ? $this->account($email) : (new Participant())->setToken(bin2hex(random_bytes(24)))->setEmail($email);
        $target->setPhone('+33609988768')->setPhoneConfirmed(true);
        $this->em->persist($source);
        $this->em->persist($target);
        $step = $this->em->getRepository('collect' === $type ? CollectStep::class : SelectionStep::class)->find('collect' === $type ? 'collectstep1' : 'selectionstep1');
        self::assertTrue($step instanceof CollectStep || $step instanceof SelectionStep);
        $step->setEndAt(null)->setStartAt(new \DateTime('2020-01-01'));
        $step->setVotesMin(null)->setVotesLimit(null)->setBudget(null);
        $step->setVotesRanking(false);
        foreach ($step->getRequirements()->toArray() as $requirement) {
            $step->removeRequirement($requirement);
        }
        $step->addRequirement((new Requirement())->setType(Requirement::EMAIL_VERIFIED)->setPosition(0));
        /** @var list<Proposal> $proposals */
        $proposals = $this->em->getRepository(Proposal::class)->findBy(['id' => ['proposal1', 'proposal2', 'proposal3']], ['id' => 'ASC']);
        self::assertCount(3, $proposals);
        $votes = [];
        foreach ([0, 1, 1, 2] as $index => $proposalIndex) {
            $vote = 'collect' === $type ? (new ProposalCollectVote())->setCollectStep($step) : (new ProposalSelectionVote())->setSelectionStep($step);
            $vote->setProposal($proposals[$proposalIndex]);
            $vote->setContributor($index < 2 ? $target : $source);
            $this->em->persist($vote);
            $votes[] = $vote;
        }
        $this->em->flush();

        return [$step, $source, $target, $votes, $proposals];
    }
}
