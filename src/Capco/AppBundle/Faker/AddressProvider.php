<?php

namespace Capco\AppBundle\Faker;

use Faker\Generator;
use Faker\Provider\Base as BaseProvider;

final class AddressProvider extends BaseProvider
{
    private const DEFAULT_DECIMALS = 5;

    private const IDF_MIN_LATITUDE = 48.11;
    private const IDF_MAX_LATITUDE = 49.24;

    private const IDF_MIN_LONGITUDE = 1.43;
    private const IDF_MAX_LONGITUDE = 3.50;

    public function __construct(
        Generator $generator,
        private readonly Generator $faker
    ) {
        parent::__construct($generator);
    }

    public function generateAddress(
        array $latitudeConfig = [self::IDF_MIN_LATITUDE, self::IDF_MAX_LATITUDE],
        array $longitudeConfig = [self::IDF_MIN_LONGITUDE, self::IDF_MAX_LONGITUDE],
        int $nbDecimals = self::DEFAULT_DECIMALS
    ) {
        [$latitudeMin, $latitudeMax] = $latitudeConfig;
        [$longitudeMin, $longitudeMax] = $longitudeConfig;

        $latitude = $this->faker->randomFloat($nbDecimals, $latitudeMin, $latitudeMax);
        $longitude = $this->faker->randomFloat($nbDecimals, $longitudeMin, $longitudeMax);

        // we could use reverserGeocodingAddress method from Utils/Map.php to generate the address, but it would make too much API calls, so we just hard code an adress and replace the lat/lng
        $fakeAddress = [
            [
                'address_components' => [
                    [
                        'long_name' => '155',
                        'short_name' => '155',
                        'types' => [
                            'street_number',
                        ],
                    ],

                    [
                        'long_name' => 'Boulevard Saint-Germain',
                        'short_name' => 'Boulevard Saint-Germain',
                        'types' => [
                            'route',
                        ],
                    ],

                    [
                        'long_name' => 'Paris',
                        'short_name' => 'Paris',
                        'types' => [
                            'locality',
                            'political',
                        ],
                    ],

                    [
                        'long_name' => 'Département de Paris',
                        'short_name' => 'Département de Paris',
                        'types' => [
                            'administrative_area_level_2',
                            'political',
                        ],
                    ],

                    [
                        'long_name' => 'Île-de-France',
                        'short_name' => 'IDF',
                        'types' => [
                            'administrative_area_level_1',
                            'political',
                        ],
                    ],

                    [
                        'long_name' => 'France',
                        'short_name' => 'FR',
                        'types' => [
                            'country',
                            'political',
                        ],
                    ],

                    [
                        'long_name' => '75006',
                        'short_name' => '75006',
                        'types' => [
                            'postal_code',
                        ],
                    ],
                ],
                'formatted_address' => 'Fake address, 75006 Paris, France',
                'geometry' => [
                    'location' => [
                        'lat' => $latitude,
                        'lng' => $longitude,
                    ],
                    'location_type' => 'ROOFTOP',
                    'viewport' => [
                        'northeast' => [
                            'lat' => 48.8551896802915,
                            'lng' => 2.333450380291502,
                        ],
                        'southwest' => [
                            'lat' => 48.8524917197085,
                            'lng' => 2.330752419708498,
                        ],
                    ],
                ],
                'place_id' => 'ChIJq9_ddtdx5kcRRoIJStYdLlA',
                'plus_code' => [
                    'compound_code' => 'V83J+GR Paris, France',
                    'global_code' => '8FW4V83J+GR',
                ],
                'types' => [
                    'street_address',
                ],
            ],
        ];

        return json_encode($fakeAddress);
    }
}
