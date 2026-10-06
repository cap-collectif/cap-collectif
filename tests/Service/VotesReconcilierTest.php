<?php

namespace Capco\Tests\Service;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\Tests\Participant\Functional\ParticipantWebTestCase;
use Capco\UserBundle\Entity\User;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason HTTP reconciliation verifies persisted ballots, ownership, limits and ranking inside rolled-back SQL transactions.
 */
final class VotesReconcilierTest extends ParticipantWebTestCase
{
    /**
     * @dataProvider voteMerges
     *
     * @param list<string>       $targetProposals
     * @param list<string>       $sourceProposals
     * @param list<string>       $expected
     * @param array<string, int> $expectedPositions
     */
    public function testVoteMergeContracts(string $stepType, string $targetType, ?int $min, ?int $max, ?float $budget, bool $ranking, array $targetProposals, array $sourceProposals, array $expected, array $expectedPositions, bool $retainsEmptySource): void
    {
        $step = $this->em->find('collect' === $stepType ? CollectStep::class : SelectionStep::class, 'collect' === $stepType ? 'collectstep1' : 'selectionstep1');
        self::assertTrue($step instanceof CollectStep || $step instanceof SelectionStep);
        $step->setTimeless(true);
        foreach ($step->getRequirements()->toArray() as $requirement) {
            $step->removeRequirement($requirement);
        }
        $step->addRequirement((new Requirement())->setType(Requirement::EMAIL_VERIFIED)->setPosition(0));
        $step->setVotesMin($min)->setVotesLimit($max)->setBudget($budget);
        $step->setVotesRanking($ranking);
        $email = $this->uniqueEmail();
        $source = (new Participant())->setToken(bin2hex(random_bytes(24)))->setEmail($email)->setPhone('+33609988766');
        $target = 'user' === $targetType ? $this->account($email) : (new Participant())->setToken(bin2hex(random_bytes(24)))->setEmail($email);
        $target->setPhone('+33609988766')->setPhoneConfirmed(true);
        $this->em->persist($source);
        $this->em->persist($target);
        $collect = $this->em->find(CollectStep::class, 'collectstep1');
        self::assertInstanceOf(CollectStep::class, $collect);
        $votes = [];
        $proposals = [];
        foreach (['target' => $targetProposals, 'source' => $sourceProposals] as $owner => $ids) {
            foreach ($ids as $position => $id) {
                $proposal = $proposals[$id] ??= (new Proposal())->setProposalForm($collect->getProposalForm())->setTitle('Content ' . $id)->setEstimation('A' === $id ? 600 : 200);
                $vote = 'collect' === $stepType ? (new ProposalCollectVote())->setCollectStep($step) : (new ProposalSelectionVote())->setSelectionStep($step);
                $vote->setProposal($proposal)->setPosition($position);
                $vote->setContributor('target' === $owner ? $target : $source);
                $this->em->persist($proposal);
                $this->em->persist($vote);
                $votes[] = $vote;
            }
        }
        $neighbor = (new Participant())->setToken(bin2hex(random_bytes(24)));
        $neighborVote = 'collect' === $stepType ? (new ProposalCollectVote())->setCollectStep($step) : (new ProposalSelectionVote())->setSelectionStep($step);
        $neighborProposal = reset($proposals);
        self::assertInstanceOf(Proposal::class, $neighborProposal);
        $neighborVote->setProposal($neighborProposal)->setParticipant($neighbor)->setPosition(0);
        $this->em->persist($neighbor);
        $this->em->persist($neighborVote);
        $this->em->flush();
        $neighborId = $neighbor->getId();
        $neighborVoteId = $neighborVote->getId();
        $labels = [];
        foreach ($proposals as $label => $proposal) {
            $labels[$proposal->getId()] = $label;
        }
        $voteIds = array_map(static fn (AbstractVote $vote) => $vote->getId(), $votes);
        $sourceId = $source->getId();
        $targetId = $target->getId();
        $voteClass = 'collect' === $stepType ? ProposalCollectVote::class : ProposalSelectionVote::class;
        $this->participationCookies($source);
        $this->em->clear();

        $result = $this->confirmPhone($source);

        self::assertNull($result['errorCode']);
        self::assertSame('user' === $targetType ? 'USER_AUTHENTICATED' : 'PARTICIPANT_MERGED', $result['reconciliationMode']);
        $this->em->clear();
        $persistedSource = $this->em->find(Participant::class, $sourceId);
        self::assertSame($retainsEmptySource ? $sourceId : null, $persistedSource?->getId());
        if ($retainsEmptySource) {
            self::assertCount(0, $persistedSource->getVotes());
        }
        $repository = $this->em->getRepository($voteClass);
        /** @var list<ProposalCollectVote|ProposalSelectionVote> $survivors */
        $survivors = $repository->findBy(['id' => $voteIds]);
        $actual = array_map(static fn (AbstractVote $vote) => $labels[$vote->getProposal()->getId()], $survivors);
        sort($actual);
        sort($expected);
        self::assertSame($expected, $actual);
        foreach ($survivors as $vote) {
            self::assertSame($target instanceof User ? $targetId : null, $vote->getUser()?->getId());
            self::assertSame($target instanceof Participant ? $targetId : null, $vote->getParticipant()?->getId());
        }
        if ($expectedPositions) {
            $actualPositions = [];
            foreach ($survivors as $vote) {
                $actualPositions[$labels[$vote->getProposal()->getId()]] = $vote->getPosition();
            }
            ksort($expectedPositions);
            ksort($actualPositions);
            self::assertSame($expectedPositions, $actualPositions);
        }
        foreach ($proposals as $id => $proposal) {
            self::assertSame('Content ' . $id, $this->em->find(Proposal::class, $proposal->getId())->getTitle());
        }
        $beforeReplay = array_map(static fn (AbstractVote $vote) => [$vote->getId(), $vote->getPosition()], $survivors);
        if ($target instanceof User) {
            $this->logout();
            // Login replays the same participation cookie without recreating the source.
            $this->participationCookies($source);
            $this->login($email);
        } else {
            self::assertSame('PHONE_ALREADY_CONFIRMED', $this->confirmPhone($source)['errorCode']);
        }
        $this->em->clear();
        /** @var list<ProposalCollectVote|ProposalSelectionVote> $replayedVotes */
        $replayedVotes = $repository->findBy(['id' => $voteIds]);
        $afterReplay = array_map(static fn (AbstractVote $vote) => [$vote->getId(), $vote->getPosition()], $replayedVotes);
        sort($beforeReplay);
        sort($afterReplay);
        self::assertSame($beforeReplay, $afterReplay);
        $retainedNeighborVote = $repository->find($neighborVoteId);
        self::assertNotNull($retainedNeighborVote);
        self::assertSame($neighborId, $retainedNeighborVote->getParticipant()?->getId());
        self::assertNull($retainedNeighborVote->getUser());
        self::assertSame(0, $retainedNeighborVote->getPosition());
        self::assertSame($neighborVote->getProposal()->getId(), $retainedNeighborVote->getProposal()->getId());
    }

    /** @return iterable<string, array{string, string, ?int, ?int, ?float, bool, list<string>, list<string>, list<string>, array<string, int>, bool}> */
    public static function voteMerges(): iterable
    {
        $cases = [
            'unrestricted union and duplicate' => [null, null, null, false, ['A', 'B'], ['B', 'C'], ['A', 'B', 'C']],
            'empty target' => [null, null, null, false, [], ['A', 'B'], ['A', 'B']],
            'empty source' => [null, null, null, false, ['A'], [], ['A']],
            'source reaches maximum first' => [2, 2, null, false, ['A'], ['B', 'C'], ['B', 'C']],
            'target already at maximum' => [2, 3, null, false, ['A', 'B', 'C'], ['D'], ['A', 'B', 'C']],
            'both reach maximum' => [2, 2, null, false, ['A', 'B'], ['C', 'D'], ['A', 'B']],
            'both meet minimum within limit' => [2, 5, null, false, ['A', 'B'], ['C', 'D'], ['A', 'B', 'C', 'D']],
            'duplicates count once for limit' => [2, 4, null, false, ['A', 'B'], ['B', 'C'], ['A', 'B', 'C']],
            'union exceeds maximum' => [2, 3, null, false, ['A', 'B'], ['C', 'D'], ['A', 'B']],
            'budget exceeded with minimum' => [2, 5, 1000.0, false, ['A', 'B'], ['C', 'D'], ['A', 'B']],
            'budget equality' => [2, 4, 1000.0, false, ['A', 'B'], ['B', 'C'], ['A', 'B', 'C']],
            'budget exceeded without minimum' => [null, null, 700.0, false, ['A'], ['B'], ['A']],
            'ranking preserves established ballot' => [2, 4, null, true, ['A', 'B'], ['C', 'D'], ['A', 'B'], ['A' => 0, 'B' => 1]],
            'ranking adopts first complete ballot' => [2, 4, null, true, ['A'], ['C', 'D'], ['C', 'D'], ['C' => 0, 'D' => 1]],
            'ranking transfers duplicate position' => [null, 4, null, true, ['A', 'B'], ['B', 'C'], ['A', 'B', 'C'], ['A' => 0, 'B' => 1, 'C' => 2]],
            'CharacterizationGap new ranked votes share position' => [null, 4, null, true, ['A'], ['C', 'D'], ['A', 'C', 'D'], ['A' => 0, 'C' => 1, 'D' => 1]],
            'CharacterizationGap maximum without minimum can be exceeded' => [null, 3, null, false, ['A', 'B'], ['C', 'D'], ['A', 'B', 'C', 'D']],
            'minimum not reached combines partial ballots' => [3, 5, null, false, ['A'], ['B'], ['A', 'B']],
        ];
        foreach (['collect', 'selection'] as $step) {
            foreach (['user', 'participant'] as $target) {
                foreach ($cases as $name => $case) {
                    // Login can retain the empty source identity when the established ballot is full.
                    $retainsEmptySource = 'user' === $target && \in_array($name, ['target already at maximum', 'both reach maximum'], true);
                    $scenario = $retainsEmptySource ? 'CharacterizationGap login retains empty source at maximum (' . $name . ')' : $name;
                    yield $step . '/' . $target . ': ' . $scenario => [$step, $target, $case[0], $case[1], $case[2], $case[3], $case[4], $case[5], $case[6], $case[7] ?? [], $retainsEmptySource];
                }
            }
        }
    }

    /** @dataProvider stepGates */
    public function testLoginReconciliationOutcomeAndPersistedVotes(bool $closed, bool $matching): void
    {
        $email = $this->uniqueEmail();
        $source = (new Participant())->setToken(bin2hex(random_bytes(24)))->setEmail($email);
        $target = $this->account($matching ? $email : $this->uniqueEmail());
        $step = $this->em->find(SelectionStep::class, 'selectionstep1');
        self::assertInstanceOf(SelectionStep::class, $step);
        $step->setTimeless(false)->setStartAt(new \DateTime('2020-01-01'))->setEndAt($closed ? new \DateTime('2020-01-02') : null);
        foreach ($step->getRequirements()->toArray() as $requirement) {
            $step->removeRequirement($requirement);
        }
        $step->addRequirement((new Requirement())->setType(Requirement::EMAIL_VERIFIED)->setPosition(0));
        $proposal = $this->em->find(Proposal::class, 'proposal1');
        self::assertInstanceOf(Proposal::class, $proposal);
        $title = $proposal->getTitle();
        $vote = (new ProposalSelectionVote())->setSelectionStep($step)->setProposal($proposal)->setParticipant($source);
        $this->em->persist($source);
        $this->em->persist($vote);
        $this->em->flush();
        $voteId = $vote->getId();
        $sourceId = $source->getId();
        $targetId = $target->getId();
        $this->participationCookies($source);
        $targetEmail = $target->getEmail();
        $this->em->clear();

        $this->login($targetEmail);
        $this->em->clear();
        $persisted = $this->em->find(ProposalSelectionVote::class, $voteId);
        self::assertInstanceOf(ProposalSelectionVote::class, $persisted);
        $transferred = !$closed && $matching;
        self::assertSame($transferred ? $targetId : null, $persisted->getUser()?->getId());
        self::assertSame($transferred ? null : $sourceId, $persisted->getParticipant()?->getId());
        self::assertSame($title, $persisted->getProposal()->getTitle());
    }

    /** @return iterable<string, array{bool, bool}> */
    public static function stepGates(): iterable
    {
        yield 'closed' => [true, true];
        yield 'conflicting email' => [false, false];
        yield 'matching email' => [false, true];
    }
}
