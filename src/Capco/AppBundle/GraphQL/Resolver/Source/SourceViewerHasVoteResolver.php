<?php
namespace Capco\AppBundle\GraphQL\Resolver\Source;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Source;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\Source\SourceViewerVoteResolver;

class SourceViewerHasVoteResolver implements ResolverInterface
{
    private $resolver;

    public function __construct(SourceViewerVoteResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function __invoke(Source $source, User $user): bool
    {
        return $this->resolver->__invoke($source, $user) !== null;
    }
}
