<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProjectTab;

use Capco\AppBundle\Entity\ProjectTabCustom;

class CreateCustomProjectTabMutation extends AbstractCreateProjectTabMutation
{
    protected function getProjectTabClass(): string
    {
        return ProjectTabCustom::class;
    }
}
