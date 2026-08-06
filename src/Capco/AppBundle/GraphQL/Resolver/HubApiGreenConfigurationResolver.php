<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class HubApiGreenConfigurationResolver implements QueryInterface
{
    public function __construct(
        private readonly ExternalServiceConfigurationRepository $repository
    ) {
    }

    /**
     * @return array{isConfigured: bool}
     */
    public function __invoke(): array
    {
        $token = $this->repository->findHubApiGreenToken()?->getValue();

        return ['isConfigured' => null !== $token && '' !== trim($token)];
    }
}
