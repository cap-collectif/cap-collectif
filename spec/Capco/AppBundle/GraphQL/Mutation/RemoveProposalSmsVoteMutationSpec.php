<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Mutation\ProposalVoteAccountHandler;
use Capco\AppBundle\GraphQL\Mutation\RemoveProposalSmsVoteMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\ProjectParticipantsTotalCountCacheHandler;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class RemoveProposalSmsVoteMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        EntityManagerInterface $em,
        ProposalVotesDataLoader $proposalVotesDataLoader,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader,
        ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader,
        Indexer $indexer,
        GlobalIdResolver $globalIdResolver,
        ParticipantHelper $participantHelper,
        ProposalVoteAccountHandler $proposalVoteAccountHandler,
        ParticipantRepository $participantRepository,
        ProjectParticipantsTotalCountCacheHandler $participantsTotalCountCacheHandler,
    ) {
        $this->beConstructedWith(
            $em,
            $proposalVotesDataLoader,
            $proposalCollectVoteRepository,
            $proposalSelectionVoteRepository,
            $proposalViewerVoteDataLoader,
            $proposalViewerHasVoteDataLoader,
            $indexer,
            $globalIdResolver,
            $participantHelper,
            $proposalVoteAccountHandler,
            $participantRepository,
            $participantsTotalCountCacheHandler,
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(RemoveProposalSmsVoteMutation::class);
    }

    public function it_should_remove_vote(
        Arg $input,
        EntityManagerInterface $em,
        ProposalVotesDataLoader $proposalVotesDataLoader,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader,
        ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader,
        Indexer $indexer,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        ProposalCollectVote $currentVote,
        ParticipantHelper $participantHelper,
        Participant $participant,
        Project $project,
        ParticipantRepository $participantRepository,
    ) {
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $this->getMockedGraphQLArgumentFormatted($input);
        $input->offsetGet('stepId')->shouldBeCalledOnce()->willReturn($stepId);
        $input->offsetGet('proposalId')->shouldBeCalledOnce()->willReturn($proposalId);

        $input->offsetGet('token')->shouldBeCalledOnce()->willReturn($token);
        $globalIdResolver->resolve($proposalId, null)->shouldBeCalledOnce()->willReturn($proposal);
        $globalIdResolver->resolve($stepId, null)->shouldBeCalledOnce()->willReturn($step);

        $participantHelper->getParticipantByToken($token)->shouldBeCalledOnce()->willReturn($participant);

        $proposalCollectVoteRepository
            ->findOneBy(['participant' => $participant, 'proposal' => $proposal, 'collectStep' => $step])
            ->shouldBeCalledOnce()
            ->willReturn($currentVote)
        ;

        $step->isOpen()->willReturn(true);

        $currentVoteId = 'currentVoteId';
        $currentVote->getId()->shouldBeCalledOnce()->willReturn($currentVoteId);

        $indexer->remove(Argument::type('string'), $currentVoteId)->shouldBeCalledOnce();
        $em->remove(Argument::type(ProposalCollectVote::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $step->getVotesMin()->willReturn(null);

        $step->getProject()->willReturn($project);
        $participantRepository->findWithContributionsByProjectAndParticipant($project, $participant)->shouldBeCalledOnce()->willReturn(true);

        $proposalId = 'proposalId';
        $proposal->getId()->shouldBeCalledOnce()->willReturn($proposalId);
        $currentVote->getProposal()->willReturn($proposal);
        $currentVote->getIsAccounted()->willReturn(false);
        $indexer->index(Argument::type('string'), $proposalId)->shouldBeCalledOnce();

        $proposalVotesDataLoader->invalidate($proposal)->shouldBeCalledOnce();
        $proposalViewerVoteDataLoader->invalidate($proposal)->shouldBeCalledOnce();
        $proposalViewerHasVoteDataLoader->invalidate($proposal)->shouldBeCalledOnce();

        $payload = $this->__invoke($input);
        $payload['proposal']->shouldHaveType(Proposal::class);
        $payload['previousVoteId']->shouldBe($currentVoteId);
        $payload['step']->shouldHaveType(CollectStep::class);
    }

    public function it_should_return_unknown_proposal_user_error(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        CollectStep $step,
        ParticipantHelper $participantHelper,
        Participant $participant
    ) {
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $this->getMockedGraphQLArgumentFormatted($input);
        $input->offsetGet('stepId')->shouldBeCalledOnce()->willReturn($stepId);
        $input->offsetGet('proposalId')->shouldBeCalledOnce()->willReturn($proposalId);
        $input->offsetGet('token')->shouldBeCalledOnce()->willReturn($token);

        $globalIdResolver->resolve($proposalId, null)->shouldBeCalledOnce()->willReturn(null);
        $globalIdResolver->resolve($stepId, null)->shouldBeCalledOnce()->willReturn($step);

        $participantHelper->getParticipantByToken($token)->shouldBeCalledOnce()->willReturn($participant);

        $this->shouldThrow(new UserError('Unknown proposal with id: proposalId'))->during('__invoke', [$input]);
    }

    public function it_should_return_unknown_step_user_error(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        ParticipantHelper $participantHelper,
        Participant $participant
    ) {
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $this->getMockedGraphQLArgumentFormatted($input);
        $input->offsetGet('stepId')->shouldBeCalledOnce()->willReturn($stepId);
        $input->offsetGet('proposalId')->shouldBeCalledOnce()->willReturn($proposalId);
        $input->offsetGet('token')->shouldBeCalledOnce()->willReturn($token);

        $globalIdResolver->resolve($proposalId, null)->shouldBeCalledOnce()->willReturn($proposal);
        $globalIdResolver->resolve($stepId, null)->shouldBeCalledOnce()->willReturn(null);

        $participantHelper->getParticipantByToken($token)->shouldBeCalledOnce()->willReturn($participant);

        $this->shouldThrow(new UserError('Unknown step with id: stepId'))->during('__invoke', [$input]);
    }

    public function it_should_return_wrong_step_with_id_user_error(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        AbstractStep $step,
        ParticipantHelper $participantHelper,
        Participant $participant
    ) {
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $this->getMockedGraphQLArgumentFormatted($input);
        $input->offsetGet('stepId')->shouldBeCalledOnce()->willReturn($stepId);
        $input->offsetGet('proposalId')->shouldBeCalledOnce()->willReturn($proposalId);
        $input->offsetGet('token')->shouldBeCalledOnce()->willReturn($token);

        $globalIdResolver->resolve($proposalId, null)->shouldBeCalledOnce()->willReturn($proposal);
        $globalIdResolver->resolve($stepId, null)->shouldBeCalledOnce()->willReturn($step);

        $participantHelper->getParticipantByToken($token)->shouldBeCalledOnce()->willReturn($participant);

        $this->shouldThrow(new UserError('Wrong step with id: stepId'))->during('__invoke', [$input]);
    }

    public function it_should_return_you_have_not_voted_for_this_proposal_in_this_step_user_error(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ParticipantHelper $participantHelper,
        Participant $participant
    ) {
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $this->getMockedGraphQLArgumentFormatted($input);
        $input->offsetGet('stepId')->shouldBeCalledOnce()->willReturn($stepId);
        $input->offsetGet('proposalId')->shouldBeCalledOnce()->willReturn($proposalId);
        $input->offsetGet('token')->shouldBeCalledOnce()->willReturn($token);

        $globalIdResolver->resolve($proposalId, null)->shouldBeCalledOnce()->willReturn($proposal);
        $globalIdResolver->resolve($stepId, null)->shouldBeCalledOnce()->willReturn($step);

        $participantHelper->getParticipantByToken($token)->shouldBeCalledOnce()->willReturn($participant);

        $proposalCollectVoteRepository
            ->findOneBy(['participant' => $participant, 'proposal' => $proposal, 'collectStep' => $step])
            ->shouldBeCalledOnce()
            ->willReturn(null)
        ;

        $this->shouldThrow(new UserError('You have not voted for this proposal in this step.'))
            ->during('__invoke', [$input])
        ;
    }
}
