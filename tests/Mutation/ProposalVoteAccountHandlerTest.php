<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Mutation\ProposalVoteAccountHandler;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantIsMeetingRequirementsResolver;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\Pagination\Paginator;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class ProposalVoteAccountHandlerTest extends TestCase
{
    /** @dataProvider voteChangesWithoutMinimum */
    public function testUpdatesExistingVotesWithoutMinimum(bool $isAddingVote, bool $collect, bool $anonymous): void
    {
        $step = $collect ? new CollectStep() : new SelectionStep();
        $step->setVotesMin(null);
        $voteClass = $collect ? ProposalCollectVote::class : ProposalSelectionVote::class;
        $votes = [
            (new $voteClass())->setProposal(new Proposal())->setIsAccounted(false),
            (new $voteClass())->setProposal(new Proposal())->setIsAccounted(false),
        ];
        $currentVote = (new $voteClass())->setIsAccounted(false);
        $paginator = $this->createStub(Paginator::class);
        $paginator->method('getIterator')->willReturn(new \ArrayIterator($votes));
        $paginator->method('count')->willReturn(2);
        $collectRepository = $this->createStub(ProposalCollectVoteRepository::class);
        $selectionRepository = $this->createStub(ProposalSelectionVoteRepository::class);
        $repository = $collect ? $collectRepository : $selectionRepository;
        $repository->method('getByAuthorAndStep')->willReturn($paginator);
        $repository->method('getVotesByStepAndContributor')->willReturn($votes);
        $handler = new ProposalVoteAccountHandler(
            $collectRepository,
            $selectionRepository,
            $this->createStub(ParticipantIsMeetingRequirementsResolver::class),
            $this->createStub(ProposalVotesDataLoader::class),
            $this->createStub(EntityManagerInterface::class),
            $this->createStub(Indexer::class),
        );

        if ($anonymous) {
            $handler->checkIfParticipantVotesAreStillAccounted($step, $currentVote, new Participant(), $isAddingVote);
        } else {
            self::assertTrue($handler->checkIfUserVotesAreStillAccounted($step, $currentVote, new User(), $isAddingVote));
        }
        foreach ([...$votes, $currentVote] as $vote) {
            self::assertTrue($vote->getIsAccounted());
        }
    }

    /** @return iterable<string, array{bool, bool, bool}> */
    public static function voteChangesWithoutMinimum(): iterable
    {
        foreach ([true, false] as $collect) {
            foreach ([true, false] as $anonymous) {
                $label = ($collect ? 'collect' : 'selection') . '/' . ($anonymous ? 'participant' : 'user');

                yield $label . '/adding' => [true, $collect, $anonymous];

                yield $label . '/removing' => [false, $collect, $anonymous];
            }
        }
    }

    /** @covers \Capco\AppBundle\GraphQL\Mutation\ProposalVoteAccountHandler::checkIfParticipantVotesAreStillAccounted */
    public function testInvalidatesTheCountersOfVotesThatBecomeUnaccounted(): void
    {
        $step = $this->createMock(SelectionStep::class);
        $step->method('getVotesMin')->willReturn(2);
        $participant = $this->createMock(Participant::class);
        $proposal = $this->createMock(Proposal::class);
        $existingVote = $this->createMock(ProposalSelectionVote::class);
        $existingVote->method('getProposal')->willReturn($proposal);
        $existingVote->expects(self::once())->method('setIsAccounted')->with(false);
        $removedVote = $this->createMock(ProposalSelectionVote::class);
        $removedVote->expects(self::once())->method('setIsAccounted')->with(false);

        $selectionVotes = $this->createMock(ProposalSelectionVoteRepository::class);
        $selectionVotes
            ->expects(self::once())
            ->method('getVotesByStepAndContributor')
            ->with($step, $participant)
            ->willReturn([$existingVote])
        ;
        $proposalVotes = $this->createMock(ProposalVotesDataLoader::class);
        $proposalVotes->expects(self::once())->method('invalidate')->with($proposal);

        $handler = new ProposalVoteAccountHandler(
            $this->createMock(ProposalCollectVoteRepository::class),
            $selectionVotes,
            $this->createMock(ParticipantIsMeetingRequirementsResolver::class),
            $proposalVotes,
            $this->createMock(EntityManagerInterface::class),
            $this->createMock(Indexer::class),
        );

        $handler->checkIfParticipantVotesAreStillAccounted($step, $removedVote, $participant, false);
    }
}
