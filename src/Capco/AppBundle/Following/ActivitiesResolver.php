<?php

namespace Capco\AppBundle\Following;

use Capco\AppBundle\Following\ActivitiesResolverInterface;
use Capco\UserBundle\Entity\User;

abstract class ActivitiesResolver implements ActivitiesResolverInterface
{
    /**
     * You HAVE to define this const in child class.
     */
    const ACTIVITIES = [];

    abstract public function getFollowedByUserId();

    abstract public function getActivitiesByRelativeTime(string $relativeTime);

    abstract public function getMatchingActivitiesByUserId(
        array $activitiesByUserId,
        array $activities
    );

    /**
     * Count the number of activities
     */
    protected function countActivities(array $activities): int
    {
        $nbActivities = \count($this::ACTIVITIES);

        foreach ($this::ACTIVITIES as $activity) {
            if (!$activities[$activity]) {
                --$nbActivities;
            }
        }

        return $nbActivities;
    }

    protected function isUserEmailValid(User $user): bool
    {
        return filter_var($user->getEmailCanonical(), FILTER_VALIDATE_EMAIL);
    }
}
