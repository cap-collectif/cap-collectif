<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\AbstractReply;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class ReplyTypeResolver implements QueryInterface
{
    private TypeResolver $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke(AbstractReply $reply): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($reply instanceof Reply) {
            if ('preview' === $currentSchemaName) {
                return $this->typeResolver->resolve('PreviewUserReply');
            }

            return $this->typeResolver->resolve('InternalUserReply');
        }
        if ($reply instanceof ReplyAnonymous) {
            return $this->typeResolver->resolve('InternalAnonymousReply');
        }

        throw new UserError('Could not resolve type of Reply.');
    }
}
