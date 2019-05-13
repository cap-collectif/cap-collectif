<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Theme;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Resolver\TypeResolver;

class PostRelatedContentTypeResolver implements ResolverInterface
{
    protected $typeResolver;

    public function __construct(TypeResolver $resolver)
    {
        $this->typeResolver = $resolver;
    }

    public function __invoke($node)
    {
        if ($node instanceof Theme) {
            return $this->typeResolver->resolve('Theme');
        }
        if ($node instanceof Proposal) {
            return $this->typeResolver->resolve('InternalProposal');
        }
        if ($node instanceof Project) {
            return $this->typeResolver->resolve('InternalProject');
        }

        throw new UserError('Could not resolve type of the related post content.');
    }
}
