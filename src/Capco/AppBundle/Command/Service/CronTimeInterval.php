<?php

namespace Capco\AppBundle\Command\Service;

use Symfony\Contracts\Translation\TranslatorInterface;

class CronTimeInterval
{
    private TranslatorInterface $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    public function getRemainingCronExecutionTime(int $cronTriggerMinute = 0, string $datetime = 'now'): string
    {
        $currentTime = new \DateTime($datetime);
        $currentMinute = (int) $currentTime->format('i');
        $currentHour = (int) $currentTime->format('H');

        if ($currentMinute < $cronTriggerMinute) {
            $nextCronExecutionTime = (clone $currentTime)->setTime($currentHour, $cronTriggerMinute);
        } else {
            $nextCronExecutionTime = (clone $currentTime)->modify('+1 hour')->setTime($currentHour + 1, $cronTriggerMinute);
            if (24 === $currentHour + 1) {
                $nextCronExecutionTime->modify('tomorrow')->setTime(0, $cronTriggerMinute);
            }
        }

        $timeDifference = $currentTime->diff($nextCronExecutionTime);
        $remainingMinutes = $timeDifference->format('%i');

        if ('0' === $remainingMinutes) {
            return $this->translator->trans('cron_time_remaining_after_trigger');
        }

        return $this->translator->trans('cron_time_remaining', [
            'remainingMinutes' => $remainingMinutes,
            'plural' => $remainingMinutes > 1 ? 's' : '',
        ]);
    }
}
