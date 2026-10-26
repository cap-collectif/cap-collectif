<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Mutation\ProposalVoteAccountHandler;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantIsMeetingRequirementsResolver;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class ProposalVoteAccountHandlerTest extends TestCase
{
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
