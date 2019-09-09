<?php

namespace Capco\AppBundle\GraphQL\Traits;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;

trait ProjectOpinionSubscriptionGuard
{
    protected function canBeFollowed(Opinion $opinion): bool
    {
        return $opinion->getProject() && $opinion->getProject()->isOpinionCanBeFollowed();
    }

    protected function versionCanBeFollowed(OpinionVersion $opinionVersion): bool
    {
        return $opinionVersion->getProject() &&
            $opinionVersion->getProject()->isOpinionCanBeFollowed();
    }
}
