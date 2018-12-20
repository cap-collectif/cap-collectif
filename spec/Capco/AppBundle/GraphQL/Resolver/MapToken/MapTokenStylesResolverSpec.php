<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\MapToken;

use Capco\AppBundle\Client\MapboxClient;
use Capco\AppBundle\Entity\MapToken;
use Capco\AppBundle\Enum\MapProviderEnum;
use Capco\AppBundle\GraphQL\Resolver\MapToken\MapTokenStylesResolver;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;

class MapTokenStylesResolverSpec extends ObjectBehavior
{
    public function let(MapboxClient $client): void
    {
        $this->beConstructedWith($client);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(MapTokenStylesResolver::class);
    }

    public function it_can_resolve_a_map_token_styles(
        MapboxClient $client,
        Argument $argument,
        MapToken $mapToken
    ): void {
        $apiStyles = [
            0 => [
                'version' => 8,
                'name' => 'Modèle basique',
                'center' => [
                    0 => 2.3176,
                    1 => 48.8665,
                ],
                'zoom' => 12,
                'bearing' => 0,
                'pitch' => 0,
                'created' => '2018-11-27T10:12:58.576Z',
                'id' => 'cjozl22ik0law2smkaga7w4ac',
                'modified' => '2018-11-27T11:41:06.890Z',
                'owner' => 'capcollectif',
                'visibility' => 'public',
            ],
            1 => [
                'version' => 8,
                'name' => 'Template Nantes',
                'center' => [
                    0 => -1.5605535981234198,
                    1 => 47.2158940745264,
                ],
                'zoom' => 14.885551466285333,
                'bearing' => 0,
                'pitch' => 0,
                'created' => '2018-11-23T11:12:17.064Z',
                'id' => '***REMOVED***',
                'modified' => '2018-11-23T11:26:10.050Z',
                'owner' => 'capcollectif',
                'visibility' => 'private',
            ],
            2 => [
                'version' => 8,
                'name' => 'Streets',
                'center' => [
                    0 => -122.4241,
                    1 => 37.78,
                ],
                'zoom' => 9,
                'created' => '2018-11-22T11:41:55.793Z',
                'id' => '***REMOVED***',
                'modified' => '2018-11-23T11:24:43.133Z',
                'owner' => 'capcollectif',
                'visibility' => 'private',
            ],
            3 => [
                'version' => 8,
                'name' => 'Basic Template',
                'center' => [
                    0 => 2.3176,
                    1 => 48.8665,
                ],
                'zoom' => 12,
                'bearing' => 0,
                'pitch' => 0,
                'created' => '2018-10-01T15:31:16.335Z',
                'id' => 'cjmqgbug9vr842ss4gtt5xvg6',
                'modified' => '2018-10-01T15:31:16.335Z',
                'owner' => 'capcollectif',
                'visibility' => 'private',
            ],
            4 => [
                'version' => 8,
                'name' => 'Blank',
                'center' => [
                    0 => 0,
                    1 => 0,
                ],
                'zoom' => 0,
                'created' => '2018-10-01T15:30:33.062Z',
                'id' => 'cjmqgax1x36nx2rpg797fw1wv',
                'modified' => '2018-10-01T15:30:33.062Z',
                'owner' => 'capcollectif',
                'visibility' => 'private',
            ],
            5 => [
                'version' => 8,
                'name' => 'Streets-fr',
                'center' => [
                    0 => 0,
                    1 => -1.1368683772161603e-13,
                ],
                'zoom' => 1.0728024211770222,
                'bearing' => 0,
                'pitch' => 0,
                'created' => '2017-07-11T13:36:52.930Z',
                'id' => 'cj4zmeym20uhr2smcmgbf49cz',
                'modified' => '2017-07-11T13:40:21.772Z',
                'owner' => 'capcollectif',
                'visibility' => 'private',
            ],
        ];

        $publicToken =
            '***REMOVED***';
        $secretToken =
            '***REMOVED***';

        $argument->offsetGet('visibility')->willReturn(null);
        $mapToken->getInitialPublicToken()->willReturn($publicToken);
        $mapToken->getPublicToken()->willReturn($publicToken);
        $mapToken->getSecretToken()->willReturn($secretToken);
        $mapToken->getProvider()->willReturn(MapProviderEnum::MAPBOX);

        $client->getStylesForToken($secretToken)->willReturn($apiStyles);

        $this->__invoke($argument, $mapToken);
    }
}
