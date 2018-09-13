<?php

namespace Capco\AppBundle\Following;

interface ActivitiesResolverInterface
{
    public function getFollowedByUserId();
    public function getActivitiesByRelativeTime(string $relativeTime);
    public function getMatchingActivitiesByUserId(array $activitiesByUserId, array $activities);
}
