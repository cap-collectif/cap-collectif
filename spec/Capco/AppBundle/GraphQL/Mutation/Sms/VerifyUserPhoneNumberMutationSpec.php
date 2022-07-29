<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\UserPhoneVerificationSms;
use Capco\AppBundle\GraphQL\Mutation\Sms\VerifyUserPhoneNumberMutation;
use Capco\AppBundle\Helper\TwilioHelper;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;

class VerifyUserPhoneNumberMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        TwilioHelper $twilioHelper,
        UserPhoneVerificationSmsRepository $userPhoneVerificationRepository
    ) {
        $this->beConstructedWith($em, $twilioHelper, $userPhoneVerificationRepository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(VerifyUserPhoneNumberMutation::class);
    }

    public function it_should_verify_a_phone_successfuly(
        Arg $input,
        User $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationRepository,
        UserPhoneVerificationSms $userPhoneVerificationSms,
        EntityManagerInterface $em,
        TwilioHelper $twilioHelper
    ) {
        $code = '123456';
        $phone = '+33695688423';
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false);
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($code);
        $viewer
            ->getPhone()
            ->shouldBeCalledOnce()
            ->willReturn($phone);

        $twilioHelper->verifySms($phone, $code)->willReturn(null);

        $viewer->setPhoneConfirmed(true)->shouldBeCalledOnce();

        $userPhoneVerificationRepository
            ->findMostRecentSms($viewer)
            ->willReturn($userPhoneVerificationSms);
        $userPhoneVerificationSms->setApproved()->shouldBeCalledOnce();

        $em->flush()->shouldBeCalledOnce();

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(null);
        $payload['user']->shouldBe($viewer);
    }

    public function it_should_return_phone_already_confirmed_error_code(User $viewer, Arg $input)
    {
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(true);

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(VerifyUserPhoneNumberMutation::PHONE_ALREADY_CONFIRMED);
    }

    public function it_should_return_code_not_valid_error_code(
        Arg $input,
        User $viewer,
        TwilioHelper $twilioHelper
    ) {
        $code = '325456';
        $phone = '+33695688423';
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false);
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($code);
        $viewer
            ->getPhone()
            ->shouldBeCalledOnce()
            ->willReturn($phone);

        $twilioHelper->verifySms($phone, $code)->willReturn(TwilioHelper::CODE_NOT_VALID);

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(TwilioHelper::CODE_NOT_VALID);
    }

    public function it_should_return_code_expired_error_code(
        Arg $input,
        User $viewer,
        TwilioHelper $twilioHelper
    ) {
        $code = '123456';
        $phone = '+33695688423';
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false);
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($code);
        $viewer
            ->getPhone()
            ->shouldBeCalledOnce()
            ->willReturn($phone);

        $twilioHelper->verifySms($phone, $code)->willReturn(TwilioHelper::CODE_EXPIRED);

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(TwilioHelper::CODE_EXPIRED);
    }
}
