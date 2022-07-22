<?php

namespace spec\Capco\AppBundle\Service;

use Capco\AppBundle\Entity\SmsCredit;
use Capco\AppBundle\Enum\RemainingSmsCreditStatus;
use Capco\AppBundle\Repository\AnonymousUserProposalSmsVoteRepository;
use Capco\AppBundle\Repository\SmsCreditRepository;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\AppBundle\Service\SmsAnalyticsHelper;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;

class SmsAnalyticsHelperSpec extends ObjectBehavior
{
    function let(
        SmsCreditRepository $smsCreditRepository,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository
    )
    {
        $this->beConstructedWith($smsCreditRepository, $userPhoneVerificationSmsRepository, $anonymousUserProposalSmsVoteRepository);
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
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository
    )
    {
        $confirmedUsersCount = 100;
        $anonVoteConfirmedUsersCount = 50;
        $userPhoneVerificationSmsRepository->countApprovedSms()->shouldBeCalledOnce()->willReturn($confirmedUsersCount);
        $anonymousUserProposalSmsVoteRepository->countApprovedSms()->shouldBeCalledOnce()->willReturn($anonVoteConfirmedUsersCount);
        $this->getConsumedCredits()->shouldReturn($confirmedUsersCount + $anonVoteConfirmedUsersCount);
    }

    public function it_should_compute_remaining_credits_amount(
        SmsCreditRepository $smsCreditRepository,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository
    )
    {
        $total = 5000;
        $smsCreditRepository->sumAll()->shouldBeCalledOnce()->willReturn($total);

        $confirmedUsersCount = 100;
        $anonVoteConfirmedUsersCount = 50;
        $userPhoneVerificationSmsRepository->countApprovedSms()->shouldBeCalledOnce()->willReturn($confirmedUsersCount);
        $anonymousUserProposalSmsVoteRepository->countApprovedSms()->shouldBeCalledOnce()->willReturn($anonVoteConfirmedUsersCount);

        $remainingAmount = 4850;

        $this->getRemainingCreditsAmount()->shouldReturn($remainingAmount);
    }

    public function it_should_return_IDLE_status(
        SmsCreditRepository $smsCreditRepository,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        SmsCredit $mostRecentRefill,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository
    )
    {
        $totalCredits = 5000;
        $status = RemainingSmsCreditStatus::IDLE;

        $smsCreditRepository->sumAll()->shouldBeCalledOnce()->willReturn($totalCredits);
        $userPhoneVerificationSmsRepository->countApprovedSms()->shouldBeCalledOnce()->willReturn(150);
        $anonymousUserProposalSmsVoteRepository->countApprovedSms()->shouldBeCalledOnce()->willReturn(50);

        $smsCreditRepository->findMostRecent()->shouldBeCalledOnce()
            ->willReturn($mostRecentRefill);
        $mostRecentRefill->getAmount()->willReturn(1000);

        $this->getRemainingCreditsStatus()->shouldReturn($status);
    }

    public function it_should_return_LOW_status_when_75_percent_of_credits_are_consumed(
        SmsCreditRepository $smsCreditRepository,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        SmsCredit $mostRecentRefill,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository
    )
    {
        $totalCredits = 5000;
        $status = RemainingSmsCreditStatus::LOW;

        $smsCreditRepository->sumAll()->shouldBeCalledOnce()->willReturn($totalCredits);
        $userPhoneVerificationSmsRepository->countApprovedSms()->shouldBeCalledOnce()->willReturn(4700);
        $anonymousUserProposalSmsVoteRepository->countApprovedSms()->shouldBeCalledOnce()->willReturn(50);

        $smsCreditRepository->findMostRecent()->shouldBeCalledOnce()
            ->willReturn($mostRecentRefill);
        $mostRecentRefill->getAmount()->willReturn(1000);

        $this->getRemainingCreditsStatus()->shouldReturn($status);
    }

    public function it_should_return_VERY_LOW_status_when_90_percent_of_credits_are_consumed(
        SmsCreditRepository $smsCreditRepository,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        SmsCredit $mostRecentRefill,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository
    )
    {
        $totalCredits = 5000;
        $consumedCredits = 4910;
        $status = RemainingSmsCreditStatus::VERY_LOW;

        $smsCreditRepository->sumAll()->shouldBeCalledOnce()->willReturn($totalCredits);
        $userPhoneVerificationSmsRepository->countApprovedSms()->shouldBeCalledOnce()->willReturn(4900);
        $anonymousUserProposalSmsVoteRepository->countApprovedSms()->shouldBeCalledOnce()->willReturn(10);

        $smsCreditRepository->findMostRecent()->shouldBeCalledOnce()
            ->willReturn($mostRecentRefill);
        $mostRecentRefill->getAmount()->willReturn(1000);

        $this->getRemainingCreditsStatus()->shouldReturn($status);
    }

    public function it_should_return_TOTAL_status_when_all_credits_are_consummed(
        SmsCreditRepository $smsCreditRepository,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        SmsCredit $mostRecentRefill,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository
    )
    {
        $totalCredits = 5000;
        $status = RemainingSmsCreditStatus::TOTAL;

        $smsCreditRepository->sumAll()->shouldBeCalledOnce()->willReturn($totalCredits);
        $userPhoneVerificationSmsRepository->countApprovedSms()->shouldBeCalledOnce()->willReturn(4900);
        $anonymousUserProposalSmsVoteRepository->countApprovedSms()->shouldBeCalledOnce()->willReturn(100);

        $smsCreditRepository->findMostRecent()->shouldBeCalledOnce()
            ->willReturn($mostRecentRefill);
        $mostRecentRefill->getAmount()->willReturn(1000);

        $this->getRemainingCreditsStatus()->shouldReturn($status);
    }

    public function it_should_return_TOTAL_status_when_remaining_credits_is_negative(
        Argument $args,
        SmsCreditRepository $smsCreditRepository,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        SmsCredit $mostRecentRefill,
        AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository
    )
    {
        $totalCredits = 5000;
        $status = RemainingSmsCreditStatus::TOTAL;

        $smsCreditRepository->sumAll()->shouldBeCalledOnce()->willReturn($totalCredits);
        $userPhoneVerificationSmsRepository->countApprovedSms()->shouldBeCalledOnce()->willReturn(6000);
        $anonymousUserProposalSmsVoteRepository->countApprovedSms()->shouldBeCalledOnce()->willReturn(100);

        $smsCreditRepository->findMostRecent()
            ->shouldBeCalledOnce()
            ->willReturn($mostRecentRefill);
        $mostRecentRefill->getAmount()->willReturn(1000);

        $this->getRemainingCreditsStatus()->shouldReturn($status);
    }




}
