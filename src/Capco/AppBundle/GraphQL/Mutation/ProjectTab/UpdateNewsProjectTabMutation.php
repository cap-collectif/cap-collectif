<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProjectTab;

use Capco\AppBundle\Entity\ProjectTabNews;

class UpdateNewsProjectTabMutation extends AbstractUpdateProjectTabMutation
{
    protected function getProjectTabClass(): string
    {
        return ProjectTabNews::class;
    }
}
