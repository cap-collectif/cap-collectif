<?php

namespace Capco\AppBundle\GraphQL\Resolver\Source;

use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class SourceViewerHasVoteResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private SourceViewerVoteResolver $resolver
    ) {
    }

    public function __invoke(Source $source, $viewer): bool
    {
        $viewer = $this->preventNullableViewer($viewer);

        return null !== $this->resolver->__invoke($source, $viewer);
    }
}
