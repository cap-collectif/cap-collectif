<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Enum\RemainingSmsCreditStatus;
use Capco\AppBundle\Repository\AnonymousUserProposalSmsVoteRepository;
use Capco\AppBundle\Repository\ParticipantPhoneVerificationSmsRepository;
use Capco\AppBundle\Repository\SmsCreditRepository;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;

class SmsAnalyticsHelper
{
    public function __construct(
        private readonly SmsCreditRepository $smsCreditRepository,
        private readonly UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        private readonly AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository,
        private readonly ParticipantPhoneVerificationSmsRepository $participantPhoneVerificationSmsRepository
    ) {
    }

    public function getTotalCredits(): int
    {
        return $this->smsCreditRepository->sumAll();
    }

    public function getConsumedCredits(): int
    {
        $userPhoneVerified = $this->userPhoneVerificationSmsRepository->countApprovedSms();
        $smsVoteVerified = $this->anonymousUserProposalSmsVoteRepository->countApprovedSms();
        $participantPhoneVerified = $this->participantPhoneVerificationSmsRepository->countApprovedSms();

        return $userPhoneVerified + $smsVoteVerified + $participantPhoneVerified;
    }

    public function getRemainingCreditsAmount(): int
    {
        return $this->getTotalCredits() - $this->getConsumedCredits();
    }

    public function getRemainingCreditsStatus(): string
    {
        $remainingCreditsAmount = $this->getRemainingCreditsAmount();
        $mostRecentRefill = $this->smsCreditRepository->findMostRecent();

        if (!$mostRecentRefill) {
            return RemainingSmsCreditStatus::IDLE;
        }

        $remainingCreditsPercentOfLastRefill = (int) round(
            ($remainingCreditsAmount * 100) / $mostRecentRefill->getAmount()
        );

        if (
            $remainingCreditsPercentOfLastRefill <= 25
            && $remainingCreditsPercentOfLastRefill >= 10
        ) {
            return RemainingSmsCreditStatus::LOW;
        }
        if ($remainingCreditsPercentOfLastRefill < 10 && $remainingCreditsPercentOfLastRefill > 0) {
            return RemainingSmsCreditStatus::VERY_LOW;
        }
        if ($remainingCreditsPercentOfLastRefill <= 0) {
            return RemainingSmsCreditStatus::TOTAL;
        }

        return RemainingSmsCreditStatus::IDLE;
    }
}
