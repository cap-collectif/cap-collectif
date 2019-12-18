<?php

namespace Capco\AppBundle\GraphQL\Resolver\Commentable;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Proposal;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;

class CommentableTypeResolver implements ResolverInterface
{
    private $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke($data): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($data instanceof Event) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewEvent');
            }

            return $this->typeResolver->resolve('InternalEvent');
        }
        if ($data instanceof Proposal) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewProposal');
            }

            return $this->typeResolver->resolve('InternalProposal');
        }
        if ($data instanceof Comment) {
            return $this->typeResolver->resolve('Comment');
        }
        if ($data instanceof Post) {
            return $this->typeResolver->resolve('InternalPost');
        }

        throw new UserError('Could not resolve type of Commentable.');
    }
}
