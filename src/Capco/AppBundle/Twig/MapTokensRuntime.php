<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\MapTokenRepository;
use Twig\Extension\RuntimeExtensionInterface;

class MapTokensRuntime implements RuntimeExtensionInterface
{
    private $repository;

    public function __construct(MapTokenRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getMapTokens(): array
    {
        $mapTokens = [];
        foreach ($this->repository->getMapTokensGroupByProviders() as $mapToken) {
            list($styleId, $styleOwner, $initialPublicToken, $publicToken) = [
                $mapToken->getStyleId(),
                $mapToken->getStyleOwner(),
                $mapToken->getInitialPublicToken(),
                $mapToken->getPublicToken(),
            ];
            $mapTokens[$mapToken->getProvider()] = compact(
                'styleId',
                'styleOwner',
                'initialPublicToken',
                'publicToken'
            );
        }

        return $mapTokens;
    }
}
