<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\UserPhoneVerificationSms;
use Capco\AppBundle\GraphQL\Mutation\VerifyUserPhoneNumberMutation;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;

class VerifyUserPhoneNumberMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        UserPhoneVerificationSmsRepository $userPhoneVerificationRepository
    ) {
        $this->beConstructedWith($em, $userPhoneVerificationRepository);
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
        EntityManagerInterface $em
    ) {
        $code = 'abc';
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false);
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($code);

        $userPhoneVerificationRepository->findMostRecentSms($viewer)->willReturn($userPhoneVerificationSms);
        $userPhoneVerificationSms
            ->getCode()
            ->shouldBeCalledOnce()
            ->willReturn($code);

        $userPhoneVerificationSms->isExpired()->willReturn(false);

        $viewer->setPhoneConfirmed(true)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(null);
        $payload['user']->shouldBe($viewer);
    }

    public function it_should_verify_a_pending_phone_successfuly(
        Arg $input,
        User $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationRepository,
        UserPhoneVerificationSms $userPhoneVerificationSms,
        EntityManagerInterface $em
    ) {
        $code = 'abc';
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false);
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($code);

        $userPhoneVerificationRepository->findMostRecentSms($viewer)->willReturn($userPhoneVerificationSms);

        $userPhoneVerificationSms
            ->getCode()
            ->shouldBeCalledOnce()
            ->willReturn($code);

        $userPhoneVerificationSms->isExpired()->willReturn(false);

        $viewer->setPhoneConfirmed(true)->shouldBeCalledOnce();
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
        UserPhoneVerificationSmsRepository $userPhoneVerificationRepository,
        UserPhoneVerificationSms $userPhoneVerificationSms
    ) {
        $code = 'abc';
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false);
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($code);

        $userPhoneVerificationRepository->findMostRecentSms($viewer)->willReturn($userPhoneVerificationSms);

        $userPhoneVerificationSms
            ->getCode()
            ->shouldBeCalledOnce()
            ->willReturn('def');

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(VerifyUserPhoneNumberMutation::CODE_NOT_VALID);
    }

    public function it_should_return_code_not_valid_error_code_if_no_code_found(
        Arg $input,
        User $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationRepository
    ) {
        $code = 'abc';
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false);
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($code);

        $userPhoneVerificationRepository->findMostRecentSms($viewer)->willReturn(null);

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(VerifyUserPhoneNumberMutation::CODE_NOT_VALID);
    }

    public function it_should_return_code_expired_error_code(
        Arg $input,
        User $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationRepository,
        UserPhoneVerificationSms $userPhoneVerificationSms
    ) {
        $code = 'abc';
        $viewer
            ->isPhoneConfirmed()
            ->shouldBeCalledOnce()
            ->willReturn(false);
        $input
            ->offsetGet('code')
            ->shouldBeCalledOnce()
            ->willReturn($code);

        $userPhoneVerificationRepository->findMostRecentSms($viewer)->willReturn($userPhoneVerificationSms);

        $userPhoneVerificationSms
            ->getCode()
            ->shouldBeCalledOnce()
            ->willReturn($code);

        $userPhoneVerificationSms->isExpired()->willReturn(true);

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(VerifyUserPhoneNumberMutation::CODE_EXPIRED);
    }
}
