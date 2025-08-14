<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\UserPhoneVerificationSms;
use Capco\AppBundle\Enum\SendSMSErrorCode;
use Capco\AppBundle\Fetcher\SmsProviderFetcher;
use Capco\AppBundle\GraphQL\Mutation\Sms\SendSmsPhoneValidationCodeMutation;
use Capco\AppBundle\Helper\TwilioSmsProvider;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\HttpKernel\KernelInterface;

class SendSmsPhoneValidationCodeMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        EntityManagerInterface $em,
        SmsProviderFetcher $smsProviderFactory,
        TwilioSmsProvider $smsProvider,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        KernelInterface $kernel
    ): void {
        $smsProviderFactory->fetch()->willReturn($smsProvider);
        $this->beConstructedWith($em, $smsProviderFactory, $userPhoneVerificationSmsRepository, $kernel);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(SendSmsPhoneValidationCodeMutation::class);
    }

    public function it_should_send_a_phone_validation_sms_successfuly(
        TwilioSmsProvider $smsProvider,
        Arg $input,
        User $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        UserPhoneVerificationSms $sms,
        EntityManagerInterface $em
    ): void {
        $to = '+3333333';
        $this->getMockedGraphQLArgumentFormatted($input);
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false)
        ;
        $viewer
            ->getPhone()
            ->shouldBeCalledOnce()
            ->willReturn($to)
        ;

        $smsList = [$sms];
        $userPhoneVerificationSmsRepository
            ->findSmsWithinOneMinuteRange($viewer)
            ->shouldBeCalledOnce()
            ->willReturn($smsList)
        ;

        $smsProvider
            ->sendVerificationSms($to)
            ->shouldBeCalledOnce()
            ->willReturn(null)
        ;

        $em->persist(Argument::type(UserPhoneVerificationSms::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(null);
    }

    public function it_should_return_phone_already_confirmed_error_code(User $viewer, Arg $input): void
    {
        $viewer->isPhoneConfirmed()->willReturn(true);
        $this->getMockedGraphQLArgumentFormatted($input);
        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe('PHONE_ALREADY_CONFIRMED');
    }

    public function it_should_return_retry_limit_reached_error_code(
        User $viewer,
        Arg $input,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        UserPhoneVerificationSms $sms,
        UserPhoneVerificationSms $sms2
    ): void {
        $viewer->isPhoneConfirmed()->willReturn(false);

        $smsList = [$sms, $sms2];
        $this->getMockedGraphQLArgumentFormatted($input);
        $userPhoneVerificationSmsRepository
            ->findSmsWithinOneMinuteRange($viewer)
            ->shouldBeCalledOnce()
            ->willReturn($smsList)
        ;

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe('RETRY_LIMIT_REACHED');
    }

    public function it_should_return_server_error_error_code(
        TwilioSmsProvider $smsProvider,
        Arg $input,
        User $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        UserPhoneVerificationSms $sms
    ): void {
        $to = '+3333333';
        $this->getMockedGraphQLArgumentFormatted($input);
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false)
        ;
        $viewer
            ->getPhone()
            ->shouldBeCalledOnce()
            ->willReturn($to)
        ;

        $smsList = [$sms];
        $userPhoneVerificationSmsRepository
            ->findSmsWithinOneMinuteRange($viewer)
            ->shouldBeCalledOnce()
            ->willReturn($smsList)
        ;

        $smsProvider
            ->sendVerificationSms($to)
            ->shouldBeCalledOnce()
            ->willReturn(SendSMSErrorCode::SERVER_ERROR)
        ;

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(SendSMSErrorCode::SERVER_ERROR);
    }

    public function it_should_return_invalid_number_error_code(
        TwilioSmsProvider $smsProvider,
        Arg $input,
        User $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        UserPhoneVerificationSms $sms
    ): void {
        $to = '+3333333';
        $this->getMockedGraphQLArgumentFormatted($input);
        $viewer->isPhoneConfirmed()->shouldBeCalledOnce()->willReturn(false);

        $viewer->getPhone()->shouldBeCalledOnce()->willReturn($to);

        $userPhoneVerificationSmsRepository->findSmsWithinOneMinuteRange($viewer)->shouldBeCalledOnce()->willReturn([$sms]);

        $smsProvider->sendVerificationSms($to)->shouldBeCalledOnce()->willReturn(SendSMSErrorCode::INVALID_NUMBER);

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(SendSMSErrorCode::INVALID_NUMBER);
    }
}
