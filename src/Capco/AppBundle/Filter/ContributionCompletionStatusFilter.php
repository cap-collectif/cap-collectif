<?php

namespace Capco\AppBundle\Filter;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Interfaces\ContributionInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query\Filter\SQLFilter;

class ContributionCompletionStatusFilter extends SQLFilter
{
    public const FILTER_NAME = 'contributionCompletionStatus';

    /**
     * @param ClassMetadata<ContributionInterface> $targetEntity
     * @param mixed                                $targetTableAlias
     */
    public function addFilterConstraint(ClassMetadata $targetEntity, $targetTableAlias): string
    {
        $validEntities = [
            Reply::class,
            AbstractVote::class,
            Proposal::class,
        ];

        if (\in_array($targetEntity->getName(), $validEntities)) {
            $completed = ContributionCompletionStatus::COMPLETED;

            return "{$targetTableAlias}.completion_status = '{$completed}'";
        }

        return '';
    }
}
