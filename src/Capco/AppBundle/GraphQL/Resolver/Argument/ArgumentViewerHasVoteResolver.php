<?php

namespace Capco\AppBundle\GraphQL\Resolver\Argument;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ArgumentViewerHasVoteResolver implements ResolverInterface
{
    use ResolverTrait;

    private $resolver;

    public function __construct(ArgumentViewerVoteResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function __invoke(Argument $argument, User $viewer): bool
    {
        $viewer = $this->preventNullableViewer($viewer);

        return null !== $this->resolver->__invoke($argument, $viewer);
    }
}
