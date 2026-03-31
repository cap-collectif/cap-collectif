<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProjectTab;

use Capco\AppBundle\Entity\ProjectTabPresentation;

class CreatePresentationProjectTabMutation extends AbstractCreateProjectTabMutation
{
    protected function getProjectTabClass(): string
    {
        return ProjectTabPresentation::class;
    }
}
