<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\AnonymousUserProposalSmsVote;
use Capco\AppBundle\Entity\PhoneToken;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Fetcher\SmsProviderFetcher;
use Capco\AppBundle\GraphQL\Mutation\Sms\VerifySmsVotePhoneNumberMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\TwilioSmsProvider;
use Capco\AppBundle\Repository\AnonymousUserProposalSmsVoteRepository;
use Capco\AppBundle\Repository\PhoneTokenRepository;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGenerator;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;

class VerifySmsVotePhoneNumberMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    private string $code = '123456';
    private string $phone = '+33611111111';
    private string $proposalId = 'proposalId';
    private string $stepId = 'stepId';
    private string $token = 'abcdef';

    public function let(
        EntityManagerInterface $em,
        SmsProviderFetcher $smsProviderFactory,
        TwilioSmsProvider $smsProvider,
        GlobalIdResolver $globalIdResolver,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository,
        TokenGenerator $tokenGenerator,
        PhoneTokenRepository $phoneTokenRepository
    ): void {
        $smsProviderFactory->fetch()->willReturn($smsProvider);
        $this->beConstructedWith(
            $em,
            $smsProviderFactory,
            $globalIdResolver,
            $anonymousUserProposalSmsVoteRepository,
            $tokenGenerator,
            $phoneTokenRepository
        );
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(VerifySmsVotePhoneNumberMutation::class);
    }

    public function it_should_verify_the_sms_successfuly(
        Arg $input,
        EntityManagerInterface $em,
        TwilioSmsProvider $smsProvider,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository,
        AnonymousUserProposalSmsVote $anonymousUserProposalSmsVote,
        TokenGenerator $tokenGenerator,
        PhoneTokenRepository $phoneTokenRepository,
        PhoneToken $phoneToken
    ): void {
        $this->getMockedGraphQLArgumentFormatted($input);
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

        $smsProvider->verifySms($this->phone, $this->code)->willReturn(null);

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
        TwilioSmsProvider $smsProvider,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step
    ): void {
        $this->getMockedGraphQLArgumentFormatted($input);
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

        $smsProvider->verifySms($this->phone, $this->code)->willReturn(TwilioSmsProvider::CODE_EXPIRED);

        $this->__invoke($input)->shouldReturn([
            'errorCode' => TwilioSmsProvider::CODE_EXPIRED,
        ]);
    }

    public function it_should_return_CODE_NOT_VALID(
        Arg $input,
        TwilioSmsProvider $smsProvider,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step
    ): void {
        $this->getMockedGraphQLArgumentFormatted($input);
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

        $smsProvider
            ->verifySms($this->phone, $this->code)
            ->willReturn(TwilioSmsProvider::CODE_NOT_VALID)
        ;

        $this->__invoke($input)->shouldReturn([
            'errorCode' => TwilioSmsProvider::CODE_NOT_VALID,
        ]);
    }

    public function it_should_return_TWILIO_API_ERROR(
        Arg $input,
        TwilioSmsProvider $smsProvider,
        GlobalIdResolver $globalIdResolver,
        Proposal $proposal,
        CollectStep $step
    ): void {
        $this->getMockedGraphQLArgumentFormatted($input);
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

        $smsProvider
            ->verifySms($this->phone, $this->code)
            ->willReturn(TwilioSmsProvider::TWILIO_API_ERROR)
        ;

        $this->__invoke($input)->shouldReturn([
            'errorCode' => TwilioSmsProvider::TWILIO_API_ERROR,
        ]);
    }
}
