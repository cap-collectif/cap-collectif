<?php

namespace Capco\AppBundle\GraphQL\Resolver\CustomCode;

use Capco\AppBundle\Service\CustomCodeVersioningService;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class CustomCodeVersionsQueryResolver implements QueryInterface
{
    public function __construct(private readonly CustomCodeVersioningService $customCodeVersioning)
    {
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function __invoke(Argument $argument): array
    {
        return $this->customCodeVersioning->getVersionMetadataPage(
            $argument->offsetGet('keyname'),
            $argument->offsetGet('limit') ?? CustomCodeVersioningService::DEFAULT_VERSIONS_LIMIT,
            $argument->offsetGet('offset') ?? 0
        );
    }
}
