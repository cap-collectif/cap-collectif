<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Enum\RemainingSmsCreditStatus;
use Capco\AppBundle\Repository\AnonymousUserProposalSmsVoteRepository;
use Capco\AppBundle\Repository\SmsCreditRepository;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;

class SmsAnalyticsHelper
{
    public function __construct(private readonly SmsCreditRepository $smsCreditRepository, private readonly UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository, private readonly AnonymousUserProposalSmsVoteRepository $anonymousUserProposalSmsVoteRepository)
    {
    }

    public function getTotalCredits(): int
    {
        return $this->smsCreditRepository->sumAll();
    }

    public function getConsumedCredits(): int
    {
        $phoneVerified = $this->userPhoneVerificationSmsRepository->countApprovedSms() ?? 0;
        $smsVoteVerified = $this->anonymousUserProposalSmsVoteRepository->countApprovedSms() ?? 0;

        return $phoneVerified + $smsVoteVerified;
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
