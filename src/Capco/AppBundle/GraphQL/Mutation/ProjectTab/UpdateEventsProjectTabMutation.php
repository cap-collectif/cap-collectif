<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProjectTab;

use Capco\AppBundle\Entity\ProjectTabEvents;

class UpdateEventsProjectTabMutation extends AbstractUpdateProjectTabMutation
{
    protected function getProjectTabClass(): string
    {
        return ProjectTabEvents::class;
    }
}
