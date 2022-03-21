<?php
namespace Capco\AppBundle\Service;

use Capco\AppBundle\Enum\RemainingSmsCreditStatus;
use Capco\AppBundle\Repository\SmsCreditRepository;
use Capco\UserBundle\Repository\UserRepository;

class SmsAnalyticsHelper
{
    private SmsCreditRepository $smsCreditRepository;
    private UserRepository $userRepository;

    public function __construct(SmsCreditRepository $smsCreditRepository, UserRepository $userRepository)
    {
        $this->smsCreditRepository = $smsCreditRepository;
        $this->userRepository = $userRepository;
    }

    public function getTotalCredits(): int
    {
        return $this->smsCreditRepository->sumAll();
    }

    public function getConsumedCredits(): int
    {
        return $this->userRepository->countPhoneConfirmedUsers();
    }

    public function getRemainingCreditsAmount(): int
    {
        return $this->getTotalCredits() - $this->getConsumedCredits();
    }

    public function getRemainingCreditsStatus(): string
    {
        $remainingCreditsAmount = $this->getRemainingCreditsAmount();
        $mostRecentRefill = $this->smsCreditRepository->findMostRecent();
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