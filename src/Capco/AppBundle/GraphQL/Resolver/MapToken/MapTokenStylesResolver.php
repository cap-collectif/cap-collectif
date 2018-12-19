<?php

namespace Capco\AppBundle\GraphQL\Resolver\MapToken;

use Capco\AppBundle\Client\MapboxClient;
use Capco\AppBundle\DTO\MapboxStyle;
use Capco\AppBundle\Entity\MapToken;
use Capco\AppBundle\Enum\MapProviderEnum;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class MapTokenStylesResolver implements ResolverInterface
{
    public const ERROR_SECRET_API_KEY_REQUIRED = 'error-map-secret-api-key-required';

    private $mapboxClient;

    public function __construct(MapboxClient $mapboxClient)
    {
        $this->mapboxClient = $mapboxClient;
    }

    public function __invoke(Argument $args, MapToken $mapToken)
    {
        $visibility = $args->offsetGet('visibility');
        if (MapProviderEnum::MAPBOX === $mapToken->getProvider()) {
            return $this->getMapboxStyles($mapToken, $visibility);
        }
    }

    private function getMapboxStyles(MapToken $mapToken, ?string $visibility): array
    {
        if (!$mapToken->getSecretToken()) {
            throw new UserError(self::ERROR_SECRET_API_KEY_REQUIRED);
        }

        $owner = $this->mapboxClient
            ->endpoint('tokens')
            ->addParameter('access_token', $mapToken->getPublicToken())
            ->get()['token']['user'];

        $apiStyles = $this->mapboxClient
            ->version('v1')
            ->endpoint('styles')
            ->path($owner)
            ->addParameter('access_token', $mapToken->getSecretToken())
            ->get();

        $styles = array_map(function (array $apiStyle) use ($mapToken) {
            return MapboxStyle::fromMapboxApi($apiStyle)
                ->setPublicToken($mapToken->getPublicToken())
                ->setMapToken($mapToken);
        }, $apiStyles);

        if ($visibility) {
            $styles = array_filter($styles, function(MapboxStyle $style) use ($visibility) {
                return $style->getVisibility() === $visibility;
            });
        }

        return $styles;
    }
}
