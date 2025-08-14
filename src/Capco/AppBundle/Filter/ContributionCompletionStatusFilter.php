<?php

namespace Capco\AppBundle\Filter;

use Capco\AppBundle\Entity\Interfaces\ContributionInterface;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query\Filter\SQLFilter;

class ContributionCompletionStatusFilter extends SQLFilter
{
    public const FILTER_NAME = 'contributionCompletionStatus';

    /**
     * @param ClassMetadata<ContributionInterface> $targetEntity
     * @param $targetTableAlias
     */
    public function addFilterConstraint(ClassMetadata $targetEntity, $targetTableAlias): string
    {
        $validEntities = [
            \Capco\AppBundle\Entity\Reply::class,
            \Capco\AppBundle\Entity\AbstractVote::class,
        ];

        if (\in_array($targetEntity->getName(), $validEntities)) {
            $completed = ContributionCompletionStatus::COMPLETED;

            return "{$targetTableAlias}.completion_status = '{$completed}'";
        }

        return '';
    }
}
