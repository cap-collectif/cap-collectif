<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reply;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class ReplyTypeResolver implements QueryInterface
{
    public function __construct(private readonly TypeResolver $typeResolver)
    {
    }

    public function __invoke(Reply $reply): Type
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ('preview' === $currentSchemaName) {
            return $this->typeResolver->resolve('PreviewReply');
        }

        if (\in_array($currentSchemaName, ['internal', 'dev'])) {
            return $this->typeResolver->resolve('InternalReply');
        }

        throw new UserError('Could not resolve type of Reply.');
    }
}
