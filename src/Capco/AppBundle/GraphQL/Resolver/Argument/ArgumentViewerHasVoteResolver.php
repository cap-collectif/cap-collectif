<?php
namespace Capco\AppBundle\GraphQL\Resolver\Argument;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\Argument\ArgumentViewerVoteResolver;

class ArgumentViewerHasVoteResolver implements ResolverInterface
{
    private $resolver;

    public function __construct(ArgumentViewerVoteResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function __invoke(Argument $argument, User $user): bool
    {
        return $this->resolver->__invoke($argument, $user) !== null;
    }
}
