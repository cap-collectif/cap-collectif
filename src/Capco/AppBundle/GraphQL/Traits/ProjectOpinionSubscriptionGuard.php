<?php
namespace Capco\AppBundle\GraphQL\Traits;

use Capco\AppBundle\Entity\Opinion;

trait ProjectOpinionSubscriptionGuard
{
    protected function canBeFollowed(Opinion $opinion): bool
    {
        return $opinion->getProject() && $opinion->getProject()->isOpinionCanBeFollowed();
    }
}
