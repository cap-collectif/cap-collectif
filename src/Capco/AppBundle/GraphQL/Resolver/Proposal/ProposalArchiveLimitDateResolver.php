<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ProposalArchivedUnitTime;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalArchiveLimitDateResolver implements ResolverInterface
{
    public function __invoke(Proposal $proposal): ?\DateTime
    {
        $config = $proposal->getArchivableStepConfig();

        if (!$config) {
            return null;
        }

        list('step' => $step, 'startDate' => $startDate) = $config;

        if (false === $step instanceof CollectStep && false === $step instanceof SelectionStep) {
            throw new \Exception('Step should be either CollectStep or SelectionStep');
        }

        $units = [
            ProposalArchivedUnitTime::MONTHS => 'month',
            ProposalArchivedUnitTime::DAYS => 'day',
        ];

        $unit = $units[$step->getProposalArchivedUnitTime()];

        /** * @var \DateTime $dateLimit  */
        $dateLimit = clone $startDate;
        // we reset the time to 00:00:00 and add one day so the limit date in the front end is matching the cron's
        $dateLimit->setTime(0, 0, 0);
        $dateLimit->modify('+1 day');

        $dateLimit->modify("+{$step->getProposalArchivedTime()} {$unit}");

        return $dateLimit;
    }
}
