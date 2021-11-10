<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\Interfaces\ReplyInterface;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\ReplyAnonymous;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ReplyTypeResolver implements ResolverInterface
{
    private TypeResolver $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function __invoke(ReplyInterface $reply): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($reply instanceof Reply) {
            if ($currentSchemaName === 'preview') {
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
