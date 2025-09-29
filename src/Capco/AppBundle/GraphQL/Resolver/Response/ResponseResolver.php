<?php

namespace Capco\AppBundle\GraphQL\Resolver\Response;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\GraphQL\Resolver\TypeResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class ResponseResolver implements QueryInterface
{
    public function __construct(
        private readonly TypeResolver $typeResolver
    ) {
    }

    public function __invoke(AbstractResponse $response)
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
