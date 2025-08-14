<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\UserPhoneVerificationSms;
use Capco\AppBundle\Enum\VerifySMSErrorCode;
use Capco\AppBundle\Fetcher\SmsProviderFetcher;
use Capco\AppBundle\GraphQL\Mutation\Sms\VerifyUserPhoneNumberMutation;
use Capco\AppBundle\Helper\TwilioSmsProvider;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpKernel\KernelInterface;

class VerifyUserPhoneNumberMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        EntityManagerInterface $em,
        SmsProviderFetcher $smsProviderFactory,
        TwilioSmsProvider $smsProvider,
        UserPhoneVerificationSmsRepository $userPhoneVerificationRepository,
        KernelInterface $kernel
    ): void {
        $smsProviderFactory->fetch()->willReturn($smsProvider);
        $this->beConstructedWith($em, $smsProviderFactory, $userPhoneVerificationRepository, $kernel);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(VerifyUserPhoneNumberMutation::class);
    }

    public function it_should_verify_a_phone_successfuly(
        Arg $input,
        User $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationRepository,
        UserPhoneVerificationSms $userPhoneVerificationSms,
        EntityManagerInterface $em,
        TwilioSmsProvider $smsProvider
    ): void {
        $code = '123456';
        $phone = '+33695688423';
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false)
        ;
        $this->getMockedGraphQLArgumentFormatted($input);
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($code)
        ;
        $viewer
            ->getPhone()
            ->shouldBeCalledOnce()
            ->willReturn($phone)
        ;

        $smsProvider->verifySms($phone, $code)->willReturn(null);

        $viewer->setPhoneConfirmed(true)->shouldBeCalledOnce();

        $userPhoneVerificationRepository
            ->findMostRecentSms($viewer)
            ->willReturn($userPhoneVerificationSms)
        ;
        $userPhoneVerificationSms->setApproved()->shouldBeCalledOnce();

        $em->flush()->shouldBeCalledOnce();

        $this->__invoke($input, $viewer)->shouldReturn(['errorCode' => null, 'user' => $viewer]);
    }

    public function it_should_return_phone_already_confirmed_error_code(User $viewer, Arg $input): void
    {
        $this->getMockedGraphQLArgumentFormatted($input);

        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(VerifyUserPhoneNumberMutation::PHONE_ALREADY_CONFIRMED);
    }

    public function it_should_return_code_not_valid_error_code(
        Arg $input,
        User $viewer,
        TwilioSmsProvider $smsProvider
    ): void {
        $code = '325456';
        $phone = '+33695688423';
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false)
        ;
        $this->getMockedGraphQLArgumentFormatted($input);
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($code)
        ;
        $viewer
            ->getPhone()
            ->shouldBeCalledOnce()
            ->willReturn($phone)
        ;

        $viewer->setPhoneConfirmed(true)->willReturn($viewer);

        $smsProvider->verifySms($phone, $code)->willReturn(VerifySMSErrorCode::CODE_NOT_VALID);

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(VerifySMSErrorCode::CODE_NOT_VALID);
    }

    public function it_should_return_code_expired_error_code(
        Arg $input,
        User $viewer,
        TwilioSmsProvider $smsProvider
    ): void {
        $code = '123456';
        $phone = '+33695688423';
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false)
        ;
        $this->getMockedGraphQLArgumentFormatted($input);
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($code)
        ;
        $viewer
            ->getPhone()
            ->shouldBeCalledOnce()
            ->willReturn($phone)
        ;

        $viewer->setPhoneConfirmed(true)->willReturn($viewer);

        $smsProvider->verifySms($phone, $code)->willReturn(VerifySMSErrorCode::CODE_EXPIRED);

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(VerifySMSErrorCode::CODE_EXPIRED);
    }
}
