<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProjectTab;

use Capco\AppBundle\Entity\ProjectTabEvents;

class CreateEventsProjectTabMutation extends AbstractCreateProjectTabMutation
{
    protected function getProjectTabClass(): string
    {
        return ProjectTabEvents::class;
    }
}
