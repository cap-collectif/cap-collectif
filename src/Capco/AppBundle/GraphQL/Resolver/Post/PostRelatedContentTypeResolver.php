<?php

namespace Capco\AppBundle\GraphQL\Resolver\Post;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Theme;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;

class PostRelatedContentTypeResolver implements ResolverInterface
{
    protected $typeResolver;

    public function __construct(TypeResolver $resolver)
    {
        $this->typeResolver = $resolver;
    }

    public function __invoke($node)
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($node instanceof Theme) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewTheme');
            }

            return $this->typeResolver->resolve('InternalTheme');
        }
        if ($node instanceof Proposal) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProposal');
            }

            return $this->typeResolver->resolve('InternalProposal');
        }
        if ($node instanceof Project) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProject');
            }

            return $this->typeResolver->resolve('InternalProject');
        }

        throw new UserError('Could not resolve type of the related post content.');
    }
}
