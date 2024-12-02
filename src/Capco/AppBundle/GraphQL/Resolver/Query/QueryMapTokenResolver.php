<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\MapToken;
use Capco\AppBundle\Repository\MapTokenRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryMapTokenResolver implements QueryInterface
{
    public function __construct(private readonly MapTokenRepository $repository, private readonly ?string $defaultMapboxPublicToken, private readonly ?string $defaultMapboxSecretKey)
    {
    }

    public function __invoke(?Argument $args = null): ?MapToken
    {
        $provider = $args ? $args->offsetGet('provider') : 'MAPBOX';
        $setDefaultIfNull = $args ? $args->offsetGet('includeDefault') : true;

        $mapToken = $this->repository->getCurrentMapTokenForProvider($provider);

        // We assign default values, if needed…
        if ($setDefaultIfNull && $mapToken && !$mapToken->getPublicToken() && 'MAPBOX' === $provider) {
            $mapToken->setPublicToken($this->defaultMapboxPublicToken);
            $mapToken->setSecretToken($this->defaultMapboxSecretKey);
        }

        return $mapToken;
    }
}
