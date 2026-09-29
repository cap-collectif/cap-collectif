<?php

namespace Capco\AppBundle\GraphQL\Resolver\CustomCode;

use Capco\AppBundle\Service\CustomCodeVersioningService;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class CustomCodeConfigurationQueryResolver implements QueryInterface
{
    public function __construct(private readonly CustomCodeVersioningService $customCodeVersioning)
    {
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function __invoke(Argument $argument): array
    {
        return $this->customCodeVersioning->getConfiguration(
            $argument->offsetGet('versionsLimit') ?? CustomCodeVersioningService::DEFAULT_VERSIONS_LIMIT
        );
    }
}
