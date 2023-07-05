<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\AnonymousUserProposalSmsVote;
use Capco\AppBundle\Entity\PhoneToken;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\Mutation\Sms\VerifySmsVotePhoneNumberMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\TwilioHelper;
use Capco\AppBundle\Repository\AnonymousUserProposalSmsVoteRepository;
use Capco\AppBundle\Repository\PhoneTokenRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGenerator;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;

class VerifySmsVotePhoneNumberMutationSpec extends ObjectBehavior
{
    private string $code = '123456';
    private string $phone = '+33611111111';
    private string $proposalId = 'proposalId';
    private string $stepId = 'stepId';
    private string $token = 'abcdef';

    public function let(
        EntityManagerInterface $em,
        TwilioHelper $twilioHelper,
        GlobalIdResolver $globalIdResolver,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository,
        TokenGenerator $tokenGenerator,
        PhoneTokenRepository $phoneTokenRepository
    ) {
        $this->beConstructedWith(
            $em,
            $twilioHelper,
            $globalIdResolver,
            $anonymousUserProposalSmsVoteRepository,
            $tokenGenerator,
            $phoneTokenRepository
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(VerifySmsVotePhoneNumberMutation::class);
    }

    public function it_should_verify_the_sms_successfuly(
        Arg $input,
        EntityManagerInterface $em,
        TwilioHelper $twilioHelper,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository,
        AnonymousUserProposalSmsVote $anonymousUserProposalSmsVote,
        TokenGenerator $tokenGenerator,
        PhoneTokenRepository $phoneTokenRepository,
        PhoneToken $phoneToken
    ) {
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($this->code)
        ;
        $input
            ->offsetGet('phone')
            ->shouldBeCalledOnce()
            ->willReturn($this->phone)
        ;
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($this->proposalId)
        ;
        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($this->stepId)
        ;

        $globalIdResolver
            ->resolve($this->proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal)
        ;
        $globalIdResolver
            ->resolve($this->stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step)
        ;

        $twilioHelper->verifySms($this->phone, $this->code)->willReturn(null);

        $anonymousUserProposalSmsVoteRepository
            ->findMostRecentSmsByCollectStep($this->phone, $proposal, $step)
            ->shouldBeCalledOnce()
            ->willReturn($anonymousUserProposalSmsVote)
        ;

        $anonymousUserProposalSmsVote->setApproved()->shouldBeCalledOnce();
        $em->flush()->shouldBeCalled();

        $tokenGenerator->generateToken()->willReturn($this->token);
        $phoneTokenRepository->findOneBy(['phone' => $this->phone])->willReturn($phoneToken);
        $phoneToken->setToken($this->token)->shouldBeCalledOnce();

        $em->persist($phoneToken)->shouldBeCalledOnce();

        $this->__invoke($input)->shouldReturn([
            'errorCode' => null,
            'token' => $this->token,
        ]);
    }

    public function it_should_return_CODE_EXPIRED(
        Arg $input,
        EntityManagerInterface $em,
        TwilioHelper $twilioHelper,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step
    ) {
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($this->code)
        ;
        $input
            ->offsetGet('phone')
            ->shouldBeCalledOnce()
            ->willReturn($this->phone)
        ;
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($this->proposalId)
        ;
        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($this->stepId)
        ;

        $globalIdResolver
            ->resolve($this->proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal)
        ;
        $globalIdResolver
            ->resolve($this->stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step)
        ;

        $twilioHelper->verifySms($this->phone, $this->code)->willReturn(TwilioHelper::CODE_EXPIRED);

        $this->__invoke($input)->shouldReturn([
            'errorCode' => TwilioHelper::CODE_EXPIRED,
        ]);
    }

    public function it_should_return_CODE_NOT_VALID(
        Arg $input,
        EntityManagerInterface $em,
        TwilioHelper $twilioHelper,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step
    ) {
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($this->code)
        ;
        $input
            ->offsetGet('phone')
            ->shouldBeCalledOnce()
            ->willReturn($this->phone)
        ;
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($this->proposalId)
        ;
        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($this->stepId)
        ;

        $globalIdResolver
            ->resolve($this->proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal)
        ;
        $globalIdResolver
            ->resolve($this->stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step)
        ;

        $twilioHelper
            ->verifySms($this->phone, $this->code)
            ->willReturn(TwilioHelper::CODE_NOT_VALID)
        ;

        $this->__invoke($input)->shouldReturn([
            'errorCode' => TwilioHelper::CODE_NOT_VALID,
        ]);
    }

    public function it_should_return_TWILIO_API_ERROR(
        Arg $input,
        EntityManagerInterface $em,
        TwilioHelper $twilioHelper,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step
    ) {
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($this->code)
        ;
        $input
            ->offsetGet('phone')
            ->shouldBeCalledOnce()
            ->willReturn($this->phone)
        ;
        $input
            ->offsetGet('proposalId')
            ->shouldBeCalledOnce()
            ->willReturn($this->proposalId)
        ;
        $input
            ->offsetGet('stepId')
            ->shouldBeCalledOnce()
            ->willReturn($this->stepId)
        ;

        $globalIdResolver
            ->resolve($this->proposalId, null)
            ->shouldBeCalledOnce()
            ->willReturn($proposal)
        ;
        $globalIdResolver
            ->resolve($this->stepId, null)
            ->shouldBeCalledOnce()
            ->willReturn($step)
        ;

        $twilioHelper
            ->verifySms($this->phone, $this->code)
            ->willReturn(TwilioHelper::TWILIO_API_ERROR)
        ;

        $this->__invoke($input)->shouldReturn([
            'errorCode' => TwilioHelper::TWILIO_API_ERROR,
        ]);
    }
}
