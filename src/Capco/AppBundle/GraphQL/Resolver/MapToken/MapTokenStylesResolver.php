<?php

namespace Capco\AppBundle\GraphQL\Resolver\MapToken;

use Capco\AppBundle\Client\MapboxClient;
use Capco\AppBundle\DTO\MapboxStyle;
use Capco\AppBundle\Entity\MapToken;
use Capco\AppBundle\Enum\MapProviderEnum;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class MapTokenStylesResolver implements QueryInterface
{
    public function __construct(
        private readonly MapboxClient $mapboxClient,
        private readonly ?string $defaultMapboxPublicToken,
        private readonly ?string $defaultMapboxSecretKey
    ) {
    }

    public function __invoke(Argument $args, MapToken $mapToken)
    {
        $visibility = $args->offsetGet('visibility');
        if (MapProviderEnum::MAPBOX === $mapToken->getProvider()) {
            return $this->getMapboxStyles($mapToken, $visibility);
        }

        throw new \LogicException(sprintf('Trying to get styles for unknown provider "%s". Available providers : %s', $mapToken->getProvider(), implode(' | ', MapProviderEnum::getAvailableProviders())));
    }

    private function getMapboxStyles(MapToken $mapToken, ?string $visibility): array
    {
        // We assign default values, if needed…
        if (!$mapToken->getSecretToken() || !$mapToken->getPublicToken()) {
            $mapToken->setPublicToken($this->defaultMapboxPublicToken);
            $mapToken->setSecretToken($this->defaultMapboxSecretKey);
        }

        $apiStyles = $this->mapboxClient->getStylesForToken($mapToken->getSecretToken());

        $styles = array_map(fn (array $apiStyle) => MapboxStyle::fromMapboxApi($apiStyle)
            ->setPublicToken($mapToken->getPublicToken())
            ->setMapToken($mapToken), $apiStyles);

        if ($visibility) {
            $styles = array_filter($styles, fn (MapboxStyle $style) => $style->getVisibility() === $visibility);
        }

        return $styles;
    }
}
