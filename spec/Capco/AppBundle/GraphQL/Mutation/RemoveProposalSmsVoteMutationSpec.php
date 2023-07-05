<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\PhoneToken;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectSmsVote;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Mutation\RemoveProposalSmsVoteMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\PhoneTokenRepository;
use Capco\AppBundle\Repository\ProposalCollectSmsVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionSmsVoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class RemoveProposalSmsVoteMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        ProposalVotesDataLoader $proposalVotesDataLoader,
        ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository,
        ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository,
        ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader,
        ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader,
        Indexer $indexer,
        GlobalIdResolver $globalIdResolver,
        PhoneTokenRepository $phoneTokenRepository
    ) {
        $this->beConstructedWith(
            $em,
            $proposalVotesDataLoader,
            $proposalCollectSmsVoteRepository,
            $proposalSelectionSmsVoteRepository,
            $proposalViewerVoteDataLoader,
            $proposalViewerHasVoteDataLoader,
            $indexer,
            $globalIdResolver,
            $phoneTokenRepository
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
        ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository,
        ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader,
        ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader,
        Indexer $indexer,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        ProposalCollectSmsVote $currentVote,
        PhoneTokenRepository $phoneTokenRepository,
        PhoneToken $phoneToken
    ) {
        $phone = '+336111111111';
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $input->offsetGet('stepId')->shouldBeCalledOnce()->willReturn($stepId);
        $input->offsetGet('proposalId')->shouldBeCalledOnce()->willReturn($proposalId);

        $input->offsetGet('token')->shouldBeCalledOnce()->willReturn($token);
        $phoneTokenRepository->findOneBy(['token' => $token])->shouldBeCalledOnce()->willReturn($phoneToken);
        $phoneToken->getPhone()->willReturn($phone);

        $globalIdResolver->resolve($proposalId, null)->shouldBeCalledOnce()->willReturn($proposal);
        $globalIdResolver->resolve($stepId, null)->shouldBeCalledOnce()->willReturn($step);

        $proposalCollectSmsVoteRepository
            ->findOneBy(['phone' => $phone, 'proposal' => $proposal, 'collectStep' => $step])
            ->shouldBeCalledOnce()
            ->willReturn($currentVote)
        ;

        $currentVoteId = 'currentVoteId';
        $currentVote->getId()->shouldBeCalledOnce()->willReturn($currentVoteId);

        $indexer->remove(Argument::type('string'), $currentVoteId)->shouldBeCalledOnce();
        $em->remove(Argument::type(ProposalCollectSmsVote::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $proposalId = 'proposalId';
        $proposal->getId()->shouldBeCalledOnce()->willReturn($proposalId);
        $currentVote->getProposal()->willReturn($proposal);
        $indexer->index(Argument::type('string'), $proposalId)->shouldBeCalledOnce();
        $indexer->finishBulk()->shouldBeCalledOnce();

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
        PhoneTokenRepository $phoneTokenRepository,
        PhoneToken $phoneToken
    ) {
        $phone = '+336111111111';
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $input->offsetGet('stepId')->shouldBeCalledOnce()->willReturn($stepId);
        $input->offsetGet('proposalId')->shouldBeCalledOnce()->willReturn($proposalId);
        $input->offsetGet('token')->shouldBeCalledOnce()->willReturn($token);

        $phoneTokenRepository->findOneBy(['token' => $token])->shouldBeCalledOnce()->willReturn($phoneToken);
        $phoneToken->getPhone()->willReturn($phone);

        $globalIdResolver->resolve($proposalId, null)->shouldBeCalledOnce()->willReturn(null);
        $globalIdResolver->resolve($stepId, null)->shouldBeCalledOnce()->willReturn($step);

        $this->shouldThrow(new UserError('Unknown proposal with id: proposalId'))->during('__invoke', [$input]);
    }

    public function it_should_return_unknown_step_user_error(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        PhoneTokenRepository $phoneTokenRepository,
        PhoneToken $phoneToken
    ) {
        $phone = '+336111111111';
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $input->offsetGet('stepId')->shouldBeCalledOnce()->willReturn($stepId);
        $input->offsetGet('proposalId')->shouldBeCalledOnce()->willReturn($proposalId);
        $input->offsetGet('token')->shouldBeCalledOnce()->willReturn($token);

        $phoneTokenRepository->findOneBy(['token' => $token])->shouldBeCalledOnce()->willReturn($phoneToken);
        $phoneToken->getPhone()->willReturn($phone);

        $globalIdResolver->resolve($proposalId, null)->shouldBeCalledOnce()->willReturn($proposal);
        $globalIdResolver->resolve($stepId, null)->shouldBeCalledOnce()->willReturn(null);

        $this->shouldThrow(new UserError('Unknown step with id: stepId'))->during('__invoke', [$input]);
    }

    public function it_should_return_wrong_step_with_id_user_error(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        AbstractStep $step,
        PhoneTokenRepository $phoneTokenRepository,
        PhoneToken $phoneToken
    ) {
        $phone = '+336111111111';
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $input->offsetGet('stepId')->shouldBeCalledOnce()->willReturn($stepId);
        $input->offsetGet('proposalId')->shouldBeCalledOnce()->willReturn($proposalId);
        $input->offsetGet('token')->shouldBeCalledOnce()->willReturn($token);

        $phoneTokenRepository->findOneBy(['token' => $token])->shouldBeCalledOnce()->willReturn($phoneToken);
        $phoneToken->getPhone()->willReturn($phone);

        $globalIdResolver->resolve($proposalId, null)->shouldBeCalledOnce()->willReturn($proposal);
        $globalIdResolver->resolve($stepId, null)->shouldBeCalledOnce()->willReturn($step);

        $this->shouldThrow(new UserError('Wrong step with id: stepId'))->during('__invoke', [$input]);
    }

    public function it_should_return_you_have_not_voted_for_this_proposal_in_this_step_user_error(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository,
        PhoneTokenRepository $phoneTokenRepository,
        PhoneToken $phoneToken
    ) {
        $phone = '+336111111111';
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $input->offsetGet('stepId')->shouldBeCalledOnce()->willReturn($stepId);
        $input->offsetGet('proposalId')->shouldBeCalledOnce()->willReturn($proposalId);
        $input->offsetGet('token')->shouldBeCalledOnce()->willReturn($token);

        $phoneTokenRepository->findOneBy(['token' => $token])->shouldBeCalledOnce()->willReturn($phoneToken);
        $phoneToken->getPhone()->willReturn($phone);

        $globalIdResolver->resolve($proposalId, null)->shouldBeCalledOnce()->willReturn($proposal);
        $globalIdResolver->resolve($stepId, null)->shouldBeCalledOnce()->willReturn($step);

        $proposalCollectSmsVoteRepository
            ->findOneBy(['phone' => $phone, 'proposal' => $proposal, 'collectStep' => $step])
            ->shouldBeCalledOnce()
            ->willReturn(null)
        ;

        $this->shouldThrow(new UserError('You have not voted for this proposal in this step.'))
            ->during('__invoke', [$input])
        ;
    }

    public function it_should_return_phone_PHONE_NOT_FOUND_error_code(
        Arg $input,
        PhoneTokenRepository $phoneTokenRepository,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step
    ) {
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $input->offsetGet('proposalId')->shouldBeCalledOnce()->willReturn($proposalId);
        $input->offsetGet('stepId')->shouldBeCalledOnce()->willReturn($stepId);
        $input->offsetGet('token')->shouldBeCalledOnce()->willReturn($token);

        $globalIdResolver->resolve($proposalId, null)->shouldBeCalledOnce()->willReturn($proposal);
        $globalIdResolver->resolve($stepId, null)->shouldBeCalledOnce()->willReturn($step);

        $phoneTokenRepository->findOneBy(['token' => $token])->shouldBeCalledOnce()->willReturn(null);
        $this->__invoke($input)->shouldReturn([
            'errorCode' => 'PHONE_NOT_FOUND',
        ]);
    }
}
