<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Requirement\Sms;

use Capco\AppBundle\Entity\UserPhoneVerificationSms;
use Capco\AppBundle\GraphQL\Mutation\Sms\SendSmsPhoneValidationCodeMutation;
use Capco\AppBundle\Helper\TwilioClient;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class SendSmsPhoneValidationCodeMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        TwilioClient $twilioClient,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository
    ) {
        $this->beConstructedWith($em, $twilioClient, $userPhoneVerificationSmsRepository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(SendSmsPhoneValidationCodeMutation::class);
    }

    public function it_should_send_a_phone_validation_sms_successfuly(
        TwilioClient $twilioClient,
        Arg $input,
        User $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        UserPhoneVerificationSms $sms,
        EntityManagerInterface $em
    ) {
        $to = '+3333333';
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false);
        $viewer
            ->getPhone()
            ->shouldBeCalledOnce()
            ->willReturn($to);

        $smsList = [$sms];
        $userPhoneVerificationSmsRepository
            ->findByUserWithinOneMinuteRange($viewer)
            ->shouldBeCalledOnce()
            ->willReturn($smsList);

        $response = [
            'statusCode' => 201,
            'data' => ['status' => 'pending'],
        ];

        $twilioClient
            ->sendVerificationCode($to)
            ->shouldBeCalledOnce()
            ->willReturn($response);

        $em->persist(Argument::type(UserPhoneVerificationSms::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(null);
    }

    public function it_should_return_phone_already_confirmed_error_code(User $viewer, Arg $input)
    {
        $viewer->isPhoneConfirmed()->willReturn(true);
        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe('PHONE_ALREADY_CONFIRMED');
    }

    public function it_should_return_retry_limit_reached_error_code(
        User $viewer,
        Arg $input,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        UserPhoneVerificationSms $sms,
        UserPhoneVerificationSms $sms2
    ) {
        $viewer->isPhoneConfirmed()->willReturn(false);

        $smsList = [$sms, $sms2];
        $userPhoneVerificationSmsRepository
            ->findByUserWithinOneMinuteRange($viewer)
            ->shouldBeCalledOnce()
            ->willReturn($smsList);

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe('RETRY_LIMIT_REACHED');
    }

    public function it_should_return_twilio_api_error_error_code(
        TwilioClient $twilioClient,
        Arg $input,
        User $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        UserPhoneVerificationSms $sms
    ) {
        $to = '+3333333';
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false);
        $viewer
            ->getPhone()
            ->shouldBeCalledOnce()
            ->willReturn($to);

        $smsList = [$sms];
        $userPhoneVerificationSmsRepository
            ->findByUserWithinOneMinuteRange($viewer)
            ->shouldBeCalledOnce()
            ->willReturn($smsList);

        $response = [
            'statusCode' => 404,
            'data' => [],
        ];

        $twilioClient
            ->sendVerificationCode($to)
            ->shouldBeCalledOnce()
            ->willReturn($response);

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe('TWILIO_API_ERROR');
    }

    public function it_should_return_invalid_number_error_code(
        TwilioClient $twilioClient,
        Arg $input,
        User $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        UserPhoneVerificationSms $sms
    ) {
        $to = '+3333333';
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false);
        $viewer
            ->getPhone()
            ->shouldBeCalledOnce()
            ->willReturn($to);

        $smsList = [$sms];
        $userPhoneVerificationSmsRepository
            ->findByUserWithinOneMinuteRange($viewer)
            ->shouldBeCalledOnce()
            ->willReturn($smsList);

        $response = [
            'statusCode' => 400,
            'data' => ['code' => 60200],
        ];

        $twilioClient
            ->sendVerificationCode($to)
            ->shouldBeCalledOnce()
            ->willReturn($response);

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe('INVALID_NUMBER');
    }
}
