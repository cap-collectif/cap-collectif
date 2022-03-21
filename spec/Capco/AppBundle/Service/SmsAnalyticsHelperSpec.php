<?php

namespace spec\Capco\AppBundle\Service;

use Capco\AppBundle\Entity\SmsCredit;
use Capco\AppBundle\Enum\RemainingSmsCreditStatus;
use Capco\AppBundle\GraphQL\Resolver\Sms\SmsAnalyticsResolver;
use Capco\AppBundle\Repository\SmsCreditRepository;
use Capco\AppBundle\Service\SmsAnalyticsHelper;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;

class SmsAnalyticsHelperSpec extends ObjectBehavior
{
    function let(
        SmsCreditRepository $smsCreditRepository,
        UserRepository $userRepository
    )
    {
        $this->beConstructedWith($smsCreditRepository, $userRepository);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType(SmsAnalyticsHelper::class);
    }

    public function it_should_call_sum_all(
        SmsCreditRepository $smsCreditRepository
    )
    {
        $total = 5000;
        $smsCreditRepository->sumAll()->shouldBeCalledOnce()->willReturn($total);
        $this->getTotalCredits()->shouldReturn($total);
    }

    public function it_should_call_count_phone_confirmed_users(
        UserRepository $userRepository
    )
    {
        $confirmedUsersCount = 100;
        $userRepository->countPhoneConfirmedUsers()->shouldBeCalledOnce()->willReturn($confirmedUsersCount);
        $this->getConsumedCredits()->shouldReturn($confirmedUsersCount);
    }

    public function it_should_compute_remaining_credits_amount(
        SmsCreditRepository $smsCreditRepository,
        UserRepository $userRepository
    )
    {
        $total = 5000;
        $smsCreditRepository->sumAll()->shouldBeCalledOnce()->willReturn($total);

        $confirmedUsersCount = 100;
        $userRepository->countPhoneConfirmedUsers()->shouldBeCalledOnce()->willReturn($confirmedUsersCount);

        $remainingAmount = 4900;

        $this->getRemainingCreditsAmount()->shouldReturn($remainingAmount);
    }

    public function it_should_return_IDLE_status(
        SmsCreditRepository $smsCreditRepository,
        UserRepository $userRepository,
        SmsCredit $mostRecentRefill
    )
    {
        $totalCredits = 5000;
        $consumedCredits = 200;
        $status = RemainingSmsCreditStatus::IDLE;

        $smsCreditRepository->sumAll()->shouldBeCalledOnce()->willReturn($totalCredits);
        $userRepository->countPhoneConfirmedUsers()->shouldBeCalledOnce()->willReturn($consumedCredits);

        $smsCreditRepository->findMostRecent()->shouldBeCalledOnce()
            ->willReturn($mostRecentRefill);
        $mostRecentRefill->getAmount()->willReturn(1000);

        $this->getRemainingCreditsStatus()->shouldReturn($status);
    }

    public function it_should_return_LOW_status_when_75_percent_of_credits_are_consumed(
        SmsCreditRepository $smsCreditRepository,
        UserRepository $userRepository,
        SmsCredit $mostRecentRefill
    )
    {
        $totalCredits = 5000;
        $consumedCredits = 4750;
        $status = RemainingSmsCreditStatus::LOW;

        $smsCreditRepository->sumAll()->shouldBeCalledOnce()->willReturn($totalCredits);
        $userRepository->countPhoneConfirmedUsers()->shouldBeCalledOnce()->willReturn($consumedCredits);

        $smsCreditRepository->findMostRecent()->shouldBeCalledOnce()
            ->willReturn($mostRecentRefill);
        $mostRecentRefill->getAmount()->willReturn(1000);

        $this->getRemainingCreditsStatus()->shouldReturn($status);
    }

    public function it_should_return_VERY_LOW_status_when_90_percent_of_credits_are_consumed(
        SmsCreditRepository $smsCreditRepository,
        UserRepository $userRepository,
        SmsCredit $mostRecentRefill
    )
    {
        $totalCredits = 5000;
        $consumedCredits = 4910;
        $status = RemainingSmsCreditStatus::VERY_LOW;

        $smsCreditRepository->sumAll()->shouldBeCalledOnce()->willReturn($totalCredits);
        $userRepository->countPhoneConfirmedUsers()->shouldBeCalledOnce()->willReturn($consumedCredits);

        $smsCreditRepository->findMostRecent()->shouldBeCalledOnce()
            ->willReturn($mostRecentRefill);
        $mostRecentRefill->getAmount()->willReturn(1000);

        $this->getRemainingCreditsStatus()->shouldReturn($status);
    }

    public function it_should_return_TOTAL_status_when_all_credits_are_consummed(
        SmsCreditRepository $smsCreditRepository,
        UserRepository $userRepository,
        SmsCredit $mostRecentRefill
    )
    {
        $totalCredits = 5000;
        $consumedCredits = 5000;
        $status = RemainingSmsCreditStatus::TOTAL;

        $smsCreditRepository->sumAll()->shouldBeCalledOnce()->willReturn($totalCredits);
        $userRepository->countPhoneConfirmedUsers()->shouldBeCalledOnce()->willReturn($consumedCredits);

        $smsCreditRepository->findMostRecent()->shouldBeCalledOnce()
            ->willReturn($mostRecentRefill);
        $mostRecentRefill->getAmount()->willReturn(1000);

        $this->getRemainingCreditsStatus()->shouldReturn($status);
    }

    public function it_should_return_TOTAL_status_when_remaining_credits_is_negative(
        Argument $args,
        SmsCreditRepository $smsCreditRepository,
        UserRepository $userRepository,
        SmsCredit $mostRecentRefill
    )
    {
        $totalCredits = 5000;
        $consumedCredits = 6000;
        $status = RemainingSmsCreditStatus::TOTAL;

        $smsCreditRepository->sumAll()->shouldBeCalledOnce()->willReturn($totalCredits);
        $userRepository->countPhoneConfirmedUsers()->shouldBeCalledOnce()->willReturn($consumedCredits);

        $smsCreditRepository->findMostRecent()
            ->shouldBeCalledOnce()
            ->willReturn($mostRecentRefill);
        $mostRecentRefill->getAmount()->willReturn(1000);

        $this->getRemainingCreditsStatus()->shouldReturn($status);
    }




}
