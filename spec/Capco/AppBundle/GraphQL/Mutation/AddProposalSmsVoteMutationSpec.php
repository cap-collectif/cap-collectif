<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use ArrayIterator;
use Capco\AppBundle\Entity\PhoneToken;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectSmsVote;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Mutation\AddProposalSmsVoteMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\PhoneTokenRepository;
use Capco\AppBundle\Repository\ProposalCollectSmsVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionSmsVoteRepository;
use Capco\AppBundle\Utils\RequestGuesser;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Doctrine\ORM\EntityManagerInterface;
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
        ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository,
        ProposalSelectionSmsVoteRepository $proposalSelectionSmsVoteRepository,
        RequestGuesser $requestGuesser,
        PhoneTokenRepository $phoneTokenRepository
    ) {
        $this->beConstructedWith(
            $em,
            $validator,
            $logger,
            $proposalVotesDataLoader,
            $proposalViewerVoteDataLoader,
            $proposalViewerHasVoteDataLoader,
            $globalIdResolver,
            $proposalCollectSmsVoteRepository,
            $proposalSelectionSmsVoteRepository,
            $requestGuesser,
            $phoneTokenRepository
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
        ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository,
        Proposal $proposal,
        CollectStep $step,
        ProposalForm $proposalForm,
        ConstraintViolationListInterface $violationList,
        PhoneTokenRepository $phoneTokenRepository,
        PhoneToken $phoneToken
    ) {
        $token = 'SAJOJOFHOHX=';
        $phone = '33611111111';
        $stepId = 'stepId';
        $proposalId = 'proposalId';
        $consentSmsCommunication = true;

        $this->getMockedGraphQLArgumentFormatted($input);

        $input
            ->offsetGet('token')
            ->shouldBeCalledOnce()
            ->willReturn($token)
        ;
        $phoneTokenRepository
            ->findOneBy(['token' => $token])
            ->shouldBeCalledOnce()
            ->willReturn($phoneToken)
        ;
        $phoneToken->getPhone()->willReturn($phone);

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
            ->offsetGet('consentSmsCommunication')
            ->shouldBeCalledOnce()
            ->willReturn($consentSmsCommunication)
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
        $countUserVotes = 0;
        $proposalCollectSmsVoteRepository
            ->countByTokenAndStep($step, $token)
            ->shouldBeCalledOnce()
            ->willReturn($countUserVotes)
        ;
        $step
            ->canContribute()
            ->shouldBeCalledOnce()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;
        $step
            ->isVotable()
            ->shouldBeCalledOnce()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;
        $step
            ->isNumberOfVotesLimitted()
            ->shouldBeCalledOnce()
            ->willReturn(false)
        ;

        $proposal
            ->addCollectSmsVote(Argument::type(ProposalCollectSmsVote::class))
            ->shouldBeCalledOnce()
            ->willReturn($proposal)
        ;

        $validator
            ->validate(Argument::type(ProposalCollectSmsVote::class))
            ->shouldBeCalledOnce()
            ->willReturn($violationList)
        ;
        $em->persist(Argument::type(ProposalCollectSmsVote::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalled();

        $proposalVotesDataLoader->invalidate($proposal)->shouldBeCalledOnce();
        $proposalViewerVoteDataLoader->invalidate($proposal)->shouldBeCalledOnce();
        $proposalViewerHasVoteDataLoader->invalidate($proposal)->shouldBeCalledOnce();

        $payload = $this->__invoke($input);
        $payload['vote']->shouldHaveType(ProposalCollectSmsVote::class);
        $payload['voteEdge']->shouldHaveType(Edge::class);
        $payload['proposal']->shouldHaveType(Proposal::class);
    }

    public function it_should_throw_unknown_proposal_user_error(
        Arg $input,
        GlobalIdResolver $globalIdResolver,
        CollectStep $step,
        PhoneTokenRepository $phoneTokenRepository,
        PhoneToken $phoneToken
    ) {
        $token = 'SAJOJOFHOHX=';
        $phone = '33611111111';
        $stepId = 'stepId';
        $proposalId = 'proposalId';
        $consentSmsCommunication = true;

        $this->getMockedGraphQLArgumentFormatted($input);

        $input
            ->offsetGet('token')
            ->shouldBeCalledOnce()
            ->willReturn($token)
        ;
        $phoneTokenRepository
            ->findOneBy(['token' => $token])
            ->shouldBeCalledOnce()
            ->willReturn($phoneToken)
        ;
        $phoneToken->getPhone()->willReturn($phone);

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
            ->offsetGet('consentSmsCommunication')
            ->shouldBeCalledOnce()
            ->willReturn($consentSmsCommunication)
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
        PhoneTokenRepository $phoneTokenRepository,
        PhoneToken $phoneToken
    ) {
        $token = 'SAJOJOFHOHX=';
        $phone = '33611111111';
        $stepId = 'stepId';
        $proposalId = 'proposalId';
        $consentSmsCommunication = true;

        $this->getMockedGraphQLArgumentFormatted($input);

        $input
            ->offsetGet('token')
            ->shouldBeCalledOnce()
            ->willReturn($token)
        ;
        $phoneTokenRepository
            ->findOneBy(['token' => $token])
            ->shouldBeCalledOnce()
            ->willReturn($phoneToken)
        ;
        $phoneToken->getPhone()->willReturn($phone);

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
            ->offsetGet('consentSmsCommunication')
            ->shouldBeCalledOnce()
            ->willReturn($consentSmsCommunication)
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
        ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository,
        PhoneTokenRepository $phoneTokenRepository,
        PhoneToken $phoneToken
    ) {
        $token = 'SAJOJOFHOHX=';
        $phone = '33611111111';
        $stepId = 'stepId';
        $proposalId = 'proposalId';
        $consentSmsCommunication = true;

        $this->getMockedGraphQLArgumentFormatted($input);

        $input
            ->offsetGet('token')
            ->shouldBeCalledOnce()
            ->willReturn($token)
        ;
        $phoneTokenRepository
            ->findOneBy(['token' => $token])
            ->shouldBeCalledOnce()
            ->willReturn($phoneToken)
        ;
        $phoneToken->getPhone()->willReturn($phone);

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
            ->offsetGet('consentSmsCommunication')
            ->shouldBeCalledOnce()
            ->willReturn($consentSmsCommunication)
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
        $proposalCollectSmsVoteRepository
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
        ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository,
        PhoneTokenRepository $phoneTokenRepository,
        PhoneToken $phoneToken
    ) {
        $token = 'SAJOJOFHOHX=';
        $phone = '33611111111';
        $stepId = 'stepId';
        $proposalId = 'proposalId';
        $consentSmsCommunication = true;

        $this->getMockedGraphQLArgumentFormatted($input);

        $input
            ->offsetGet('token')
            ->shouldBeCalledOnce()
            ->willReturn($token)
        ;
        $phoneTokenRepository
            ->findOneBy(['token' => $token])
            ->shouldBeCalledOnce()
            ->willReturn($phoneToken)
        ;
        $phoneToken->getPhone()->willReturn($phone);

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
            ->offsetGet('consentSmsCommunication')
            ->shouldBeCalledOnce()
            ->willReturn($consentSmsCommunication)
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
        $proposalCollectSmsVoteRepository
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
        ProposalCollectSmsVoteRepository $proposalCollectSmsVoteRepository,
        PhoneTokenRepository $phoneTokenRepository,
        PhoneToken $phoneToken,
        Paginator $paginator,
        ArrayIterator $arrayIterator
    ) {
        $token = 'SAJOJOFHOHX=';
        $phone = '33611111111';
        $stepId = 'stepId';
        $proposalId = 'proposalId';
        $consentSmsCommunication = true;

        $this->getMockedGraphQLArgumentFormatted($input);

        $input
            ->offsetGet('token')
            ->shouldBeCalledOnce()
            ->willReturn($token)
        ;
        $phoneTokenRepository
            ->findOneBy(['token' => $token])
            ->shouldBeCalledOnce()
            ->willReturn($phoneToken)
        ;
        $phoneToken->getPhone()->willReturn($phone);

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
            ->offsetGet('consentSmsCommunication')
            ->shouldBeCalledOnce()
            ->willReturn($consentSmsCommunication)
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
        $proposalCollectSmsVoteRepository
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

        $proposalCollectSmsVoteRepository
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
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe('VOTE_LIMIT_REACHED');
        $payload['votes']->shouldHaveType(Connection::class);
    }

    public function it_should_return_phone_PHONE_NOT_FOUND_error_code(
        Arg $input,
        PhoneTokenRepository $phoneTokenRepository
    ) {
        $token = 'SAJOJOFHOHX=';
        $stepId = 'stepId';
        $proposalId = 'proposalId';

        $this->getMockedGraphQLArgumentFormatted($input);

        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($proposalId)
        ;
        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($stepId)
        ;
        $input
            ->offsetGet('token')
            ->shouldBeCalledOnce()
            ->willReturn($token)
        ;

        $phoneTokenRepository
            ->findOneBy(['token' => $token])
            ->shouldBeCalledOnce()
            ->willReturn(null)
        ;
        $this->__invoke($input)->shouldReturn([
            'errorCode' => 'PHONE_NOT_FOUND',
        ]);
    }
}
