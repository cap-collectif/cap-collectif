<?php
namespace Capco\AppBundle\Service;

use Capco\AppBundle\Enum\RemainingSmsCreditStatus;
use Capco\AppBundle\Repository\SmsCreditRepository;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\UserBundle\Repository\UserRepository;

class SmsAnalyticsHelper
{
    private SmsCreditRepository $smsCreditRepository;
    private UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository;

    public function __construct(
        SmsCreditRepository $smsCreditRepository,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository
    )
    {
        $this->smsCreditRepository = $smsCreditRepository;
        $this->userPhoneVerificationSmsRepository = $userPhoneVerificationSmsRepository;
    }

    public function getTotalCredits(): int
    {
        return $this->smsCreditRepository->sumAll();
    }

    public function getConsumedCredits(): int
    {
        return $this->userPhoneVerificationSmsRepository->countApprovedSms() ?? 0;
    }

    public function getRemainingCreditsAmount(): int
    {
        return $this->getTotalCredits() - $this->getConsumedCredits();
    }

    public function getRemainingCreditsStatus(): string
    {
        $remainingCreditsAmount = $this->getRemainingCreditsAmount();
        $mostRecentRefill = $this->smsCreditRepository->findMostRecent();

        if (!$mostRecentRefill) return RemainingSmsCreditStatus::IDLE;

        $remainingCreditsPercentOfLastRefill = intval(round(($remainingCreditsAmount * 100) / $mostRecentRefill->getAmount()));

        if ($remainingCreditsPercentOfLastRefill <= 25 && $remainingCreditsPercentOfLastRefill >= 10 ) {
            return RemainingSmsCreditStatus::LOW;
        }
        if ($remainingCreditsPercentOfLastRefill < 10 && $remainingCreditsPercentOfLastRefill > 0 ) {
            return RemainingSmsCreditStatus::VERY_LOW;
        }
        if ($remainingCreditsPercentOfLastRefill <= 0) {
            return RemainingSmsCreditStatus::TOTAL;
        }
        return RemainingSmsCreditStatus::IDLE;
    }
}