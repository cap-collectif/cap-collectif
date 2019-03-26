<?php

namespace Capco\AppBundle\GraphQL\Resolver\Response;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Resolver\TypeResolver;

class ResponseResolver implements ResolverInterface
{
    private $typeResolver;

    public function __construct(TypeResolver $typeResolver)
    {
        $this->typeResolver = $typeResolver;
    }

    public function resolveResponseType(AbstractResponse $response)
    {
        $currentSchemaName = $this->typeResolver->getCurrentSchemaName();

        if ($response instanceof MediaResponse) {
            if (\in_array($currentSchemaName, ['public', 'preview'], true)) {
                return $this->typeResolver->resolve('PreviewMediaResponse');
            }

            return $this->typeResolver->resolve('InternalMediaResponse');
        }

        if ($response instanceof ValueResponse) {
            if (\in_array($currentSchemaName, ['public', 'preview'], true)) {
                return $this->typeResolver->resolve('PreviewValueResponse');
            }

            return $this->typeResolver->resolve('InternalValueResponse');
        }

        throw new UserError('Could not resolve type of Response.');
    }
}
