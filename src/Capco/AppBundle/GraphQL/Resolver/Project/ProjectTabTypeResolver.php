<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\ProjectTab;
use Capco\AppBundle\Entity\ProjectTabCustom;
use Capco\AppBundle\Entity\ProjectTabEvents;
use Capco\AppBundle\Entity\ProjectTabNews;
use Capco\AppBundle\Entity\ProjectTabPresentation;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class ProjectTabTypeResolver implements QueryInterface
{
    public function __construct(
        private readonly TypeResolver $typeResolver
    ) {
    }

    public function __invoke(ProjectTab $projectTab): Type
    {
        if ($projectTab instanceof ProjectTabPresentation) {
            return $this->typeResolver->resolve('InternalProjectTabPresentation');
        }

        if ($projectTab instanceof ProjectTabNews) {
            return $this->typeResolver->resolve('InternalProjectTabNews');
        }

        if ($projectTab instanceof ProjectTabEvents) {
            return $this->typeResolver->resolve('InternalProjectTabEvents');
        }

        if ($projectTab instanceof ProjectTabCustom) {
            return $this->typeResolver->resolve('InternalProjectTabCustom');
        }

        throw new UserError('Could not resolve type of ProjectTab.');
    }
}
