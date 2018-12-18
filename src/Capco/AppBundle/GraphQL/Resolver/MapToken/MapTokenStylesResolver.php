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

    private $mapboxClient;

    public function __construct(MapboxClient $mapboxClient)
    {
        $this->mapboxClient = $mapboxClient;
    }

    public function __invoke(Argument $args, MapToken $mapToken)
    {
        $visibility = $args->offsetGet('visibility');
        if ($mapToken->getProvider() === MapProviderEnum::MAPBOX) {
            return $this->getMapboxStyles($mapToken, $visibility);
        }
    }

    private function getMapboxStyles(MapToken $mapToken, ?string $visibility): array
    {
        if (!$mapToken->getSecretToken()) {
            throw new UserError('A secret API key is required to list styles');
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

        $styles = array_map(function(array $apiStyle) use ($mapToken) {
            return MapboxStyle::fromMapboxApi($apiStyle, $mapToken->getPublicToken());
        }, $apiStyles);

        if ($visibility) {
            $styles = array_filter($styles, function(MapboxStyle $style) use ($visibility) {
                return $style->getVisibility() === $visibility;
            });
        }

        return $styles;
    }

}
