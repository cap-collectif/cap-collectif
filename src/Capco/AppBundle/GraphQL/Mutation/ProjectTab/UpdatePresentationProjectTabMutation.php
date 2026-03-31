<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProjectTab;

use Capco\AppBundle\Entity\ProjectTabPresentation;

class UpdatePresentationProjectTabMutation extends AbstractUpdateProjectTabMutation
{
    protected function getProjectTabClass(): string
    {
        return ProjectTabPresentation::class;
    }
}
