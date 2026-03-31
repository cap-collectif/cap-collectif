<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProjectTab;

use Capco\AppBundle\Entity\ProjectTabCustom;

class UpdateCustomProjectTabMutation extends AbstractUpdateProjectTabMutation
{
    protected function getProjectTabClass(): string
    {
        return ProjectTabCustom::class;
    }
}
