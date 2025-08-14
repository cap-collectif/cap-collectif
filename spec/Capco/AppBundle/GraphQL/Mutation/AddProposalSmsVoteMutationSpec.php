<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use ArrayIterator;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Mutation\AddProposalSmsVoteMutation;
use Capco\AppBundle\GraphQL\Mutation\ProposalVoteAccountHandler;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantIsMeetingRequirementsResolver;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Service\ContributionValidator;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\ProjectParticipantsTotalCountCacheHandler;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\FilterCollection;
use Doctrine\ORM\Tools\Pagination\Paginator;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AddProposalSmsVoteMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        LoggerInterface $logger,
        ProposalVotesDataLoader $proposalVotesDataLoader,
        ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader,
        ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader,
        GlobalIdResolver $globalIdResolver,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        RequestGuesserInterface $requestGuesser,
        ParticipantHelper $participantHelper,
        ParticipantIsMeetingRequirementsResolver $participantIsMeetingRequirementsResolver,
        ProposalVoteAccountHandler $proposalVoteAccountHandler,
        ContributionValidator $contributionValidator,
        Indexer $indexer,
        ParticipantRepository $participantRepository,
        ProjectParticipantsTotalCountCacheHandler $participantsTotalCountCacheHandler,
    ) {
        $this->beConstructedWith(
            $em,
            $validator,
            $logger,
            $proposalVotesDataLoader,
            $proposalViewerVoteDataLoader,
            $proposalViewerHasVoteDataLoader,
            $globalIdResolver,
            $proposalCollectVoteRepository,
            $proposalSelectionVoteRepository,
            $requestGuesser,
            $participantHelper,
            $participantIsMeetingRequirementsResolver,
            $proposalVoteAccountHandler,
            $contributionValidator,
            $indexer,
            $participantRepository,
            $participantsTotalCountCacheHandler
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AddProposalSmsVoteMutation::class);
    }

    public function it_should_add_vote(
        Arg $input,
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        ProposalVotesDataLoader $proposalVotesDataLoader,
        ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader,
        ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader,
        GlobalIdResolver $globalIdResolver,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        Proposal $proposal,
        CollectStep $step,
        ProposalForm $proposalForm,
        ConstraintViolationListInterface $violationList,
        ParticipantHelper $participantHelper,
        Participant $participant,
        FilterCollection $filterCollection,
        ProposalCollectVote $participantVote,
        ParticipantIsMeetingRequirementsResolver $participantIsMeetingRequirementsResolver,
        Project $project,
        ParticipantRepository $participantRepository,
    ) {
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $this->getMockedGraphQLArgumentFormatted($input);

        $input
            ->offsetGet('token')
            ->shouldBeCalledOnce()
            ->willReturn($token)
        ;

        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($stepId)
        ;
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($proposalId)
        ;
        $input
            ->offsetGet('anonymously')
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;

        $participantHelper->getOrCreateParticipant($token)->willReturn($participant);

        $globalIdResolver
            ->resolve($proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal)
        ;
        $globalIdResolver
            ->resolve($stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step)
        ;

        $proposal
            ->getProposalForm()
            ->shouldBeCalledOnce()
            ->willReturn($proposalForm)
        ;
        $proposalForm->getStep()->willReturn($step);

        $participant->getToken()->shouldBeCalled()->willReturn($token);
        $proposalCollectVoteRepository
            ->countByTokenAndStep($step, $token)
            ->shouldBeCalledOnce()
            ->willReturn(0)
        ;
        $step
            ->canContribute()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;
        $step
            ->isVotable()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;
        $step
            ->isNumberOfVotesLimitted()
            ->shouldBeCalledOnce()
            ->willReturn(false)
        ;

        $step->getProject()->willReturn($project);
        $participantRepository->findWithContributionsByProjectAndParticipant($project, $participant)->shouldBeCalledOnce()->willReturn(true);

        $step->isVotesRanking()->willReturn(false);

        $em->getFilters()->willReturn($filterCollection);
        $filterCollection->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);
        $proposalCollectVoteRepository->findByParticipantAndStep(Argument::type(Participant::class), Argument::type(CollectStep::class));
        $proposalCollectVoteRepository->getVotesByStepAndContributor($step, $participant, false)
            ->shouldBeCalled()
            ->willReturn([])
        ;
        $filterCollection->enable(ContributionCompletionStatusFilter::FILTER_NAME)->shouldBeCalled();
        $participantVote->getCompletionStatus()->willReturn(ContributionCompletionStatus::COMPLETED);

        $step->getVotesMin()->willReturn(null);
        $step->getId()->willReturn('stepId');
        $participantIsMeetingRequirementsResolver->__invoke($participant, Argument::type(Arg::class))->willReturn(true);

        $proposal
            ->addCollectVote(Argument::type(ProposalCollectVote::class))
            ->shouldBeCalledOnce()
            ->willReturn($proposal)
        ;

        $participant->setLastContributedAt(Argument::type(\Datetime::class));

        $violationList->rewind()->shouldBeCalled();
        $violationList->valid()->willReturn(false);

        $validator
            ->validate(Argument::type(ProposalCollectVote::class))
            ->shouldBeCalledOnce()
            ->willReturn($violationList)
        ;
        $em->persist(Argument::type(ProposalCollectVote::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalled();

        $proposalVotesDataLoader->invalidate($proposal)->shouldBeCalledOnce();
        $proposalViewerVoteDataLoader->invalidate($proposal)->shouldBeCalledOnce();
        $proposalViewerHasVoteDataLoader->invalidate($proposal)->shouldBeCalledOnce();

        $participant->isConsentInternalCommunication()->shouldBeCalledOnce()->willReturn(false);

        $payload = $this->__invoke($input);
        $payload['vote']->shouldHaveType(ProposalCollectVote::class);
        $payload['voteEdge']->shouldHaveType(Edge::class);
        $payload['proposal']->shouldHaveType(Proposal::class);
    }

    public function it_should_throw_unknown_proposal_user_error(
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

        $input
            ->offsetGet('token')
            ->shouldBeCalledOnce()
            ->willReturn($token)
        ;

        $participantHelper->getOrCreateParticipant($token)->willReturn($participant);

        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($stepId)
        ;
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($proposalId)
        ;

        $globalIdResolver
            ->resolve($proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn(null)
        ;
        $globalIdResolver
            ->resolve($stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step)
        ;

        $this->shouldThrow(new UserError('Unknown proposal with id: proposalId'))->during(
            '__invoke',
            [$input]
        );
    }

    public function it_should_throw_wrong_step_with_id_user_error(
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

        $input
            ->offsetGet('token')
            ->shouldBeCalledOnce()
            ->willReturn($token)
        ;

        $participantHelper->getOrCreateParticipant($token)->willReturn($participant);

        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($stepId)
        ;
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($proposalId)
        ;

        $globalIdResolver
            ->resolve($proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal)
        ;
        $globalIdResolver
            ->resolve($stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step)
        ;

        $this->shouldThrow(new UserError('Wrong step with id: stepId'))->during('__invoke', [
            $input,
        ]);
    }

    public function it_should_throw_this_step_is_no_longer_contribuable_user_error(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        ProposalForm $proposalForm,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ParticipantHelper $participantHelper,
        Participant $participant
    ) {
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $this->getMockedGraphQLArgumentFormatted($input);

        $input
            ->offsetGet('token')
            ->shouldBeCalledOnce()
            ->willReturn($token)
        ;

        $participantHelper->getOrCreateParticipant($token)->willReturn($participant);

        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($stepId)
        ;
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($proposalId)
        ;

        $globalIdResolver
            ->resolve($proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal)
        ;
        $globalIdResolver
            ->resolve($stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step)
        ;

        $proposal
            ->getProposalForm()
            ->shouldBeCalledOnce()
            ->willReturn($proposalForm)
        ;
        $proposalForm->getStep()->willReturn($step);
        $participant->getToken()->willReturn($token);
        $proposalCollectVoteRepository
            ->countByTokenAndStep($step, $token)
            ->shouldBeCalledOnce()
            ->willReturn(0)
        ;

        $step
            ->canContribute()
            ->shouldBeCalledOnce()
            ->willReturn(false)
        ;

        $this->shouldThrow(new UserError('This step is no longer contributable.'))->during(
            '__invoke',
            [$input]
        );
    }

    public function it_should_throw_this_step_is_not_votable_user_error(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        ProposalForm $proposalForm,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ParticipantHelper $participantHelper,
        Participant $participant
    ) {
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $this->getMockedGraphQLArgumentFormatted($input);

        $input
            ->offsetGet('token')
            ->shouldBeCalledOnce()
            ->willReturn($token)
        ;

        $participantHelper->getOrCreateParticipant($token)->willReturn($participant);

        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($stepId)
        ;
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($proposalId)
        ;

        $globalIdResolver
            ->resolve($proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal)
        ;
        $globalIdResolver
            ->resolve($stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step)
        ;

        $proposal
            ->getProposalForm()
            ->shouldBeCalledOnce()
            ->willReturn($proposalForm)
        ;
        $proposalForm->getStep()->willReturn($step);
        $participant->getToken()->willReturn($token);
        $proposalCollectVoteRepository
            ->countByTokenAndStep($step, $token)
            ->shouldBeCalledOnce()
            ->willReturn(0)
        ;

        $step
            ->canContribute()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;
        $step
            ->isVotable()
            ->shouldBeCalledOnce()
            ->willReturn(false)
        ;

        $this->shouldThrow(new UserError('This step is not votable.'))->during('__invoke', [
            $input,
        ]);
    }

    public function it_should_return_VOTE_LIMIT_REACHED_user_error(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        ProposalForm $proposalForm,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        Paginator $paginator,
        ArrayIterator $arrayIterator,
        ParticipantHelper $participantHelper,
        Participant $participant
    ) {
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $this->getMockedGraphQLArgumentFormatted($input);

        $input
            ->offsetGet('token')
            ->shouldBeCalledOnce()
            ->willReturn($token)
        ;

        $participantHelper->getOrCreateParticipant($token)->willReturn($participant);

        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($stepId)
        ;
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($proposalId)
        ;

        $globalIdResolver
            ->resolve($proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal)
        ;
        $globalIdResolver
            ->resolve($stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step)
        ;

        $proposal
            ->getProposalForm()
            ->shouldBeCalledOnce()
            ->willReturn($proposalForm)
        ;
        $proposalForm->getStep()->willReturn($step);
        $participant->getToken()->willReturn($token);
        $proposalCollectVoteRepository
            ->countByTokenAndStep($step, $token)
            ->shouldBeCalledOnce()
            ->willReturn(3)
        ;

        $step
            ->canContribute()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;
        $step
            ->isVotable()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;

        $step
            ->isNumberOfVotesLimitted()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;
        $step
            ->getVotesLimit()
            ->shouldBeCalledOnce()
            ->willReturn(3)
        ;

        $proposalCollectVoteRepository
            ->getByTokenAndStep($step, $token)
            ->shouldBeCalledOnce()
            ->willReturn($paginator)
        ;
        $paginator
            ->getIterator()
            ->shouldBeCalledOnce()
            ->willReturn($arrayIterator)
        ;
        $arrayIterator->getArrayCopy()->willReturn([]);

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe('VOTE_LIMIT_REACHED');
        $payload['votes']->shouldHaveType(Connection::class);
    }
}
