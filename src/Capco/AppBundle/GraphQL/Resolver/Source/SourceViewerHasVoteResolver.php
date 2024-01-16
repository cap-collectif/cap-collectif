<?php

namespace Capco\AppBundle\GraphQL\Resolver\Source;

use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class SourceViewerHasVoteResolver implements QueryInterface
{
    use ResolverTrait;

    private $resolver;

    public function __construct(SourceViewerVoteResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function __invoke(Source $source, $viewer): bool
    {
        $viewer = $this->preventNullableViewer($viewer);

        return null !== $this->resolver->__invoke($source, $viewer);
    }
}
