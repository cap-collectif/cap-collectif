<?php

namespace Capco\AppBundle\GraphQL\Resolver\Argument;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ArgumentViewerHasVoteResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private ArgumentViewerVoteResolver $resolver)
    {
    }

    public function __invoke(Argument $argument, $viewer): bool
    {
        $viewer = $this->preventNullableViewer($viewer);

        return null !== $this->resolver->__invoke($argument, $viewer);
    }
}
