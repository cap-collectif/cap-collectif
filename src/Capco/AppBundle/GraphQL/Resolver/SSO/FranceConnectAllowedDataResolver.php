<?php

namespace Capco\AppBundle\GraphQL\Resolver\SSO;

use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class FranceConnectAllowedDataResolver implements QueryInterface
{
    private readonly FranceConnectSSOConfigurationRepository $configurationRepository;

    public function __construct(FranceConnectSSOConfigurationRepository $configurationRepository)
    {
        $this->configurationRepository = $configurationRepository;
    }

    public function __invoke(): array
    {
        $fc = $this->configurationRepository->find('franceConnect');
        $allowedData = $fc->getAllowedData();

        return array_map('strtoupper', array_keys(array_filter($allowedData)));
    }
}
