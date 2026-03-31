<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProjectTab;

use Capco\AppBundle\Entity\ProjectTabNews;

class CreateNewsProjectTabMutation extends AbstractCreateProjectTabMutation
{
    protected function getProjectTabClass(): string
    {
        return ProjectTabNews::class;
    }
}
