<?php

namespace spec\Capco\AppBundle\DTO;

use Capco\AppBundle\DTO\GoogleMapsAddress;
use PhpSpec\ObjectBehavior;

class GoogleMapsAddressSpec extends ObjectBehavior
{
    private const DEFAULT_LOCALITY_COMPONENT = [
        'long_name' => 'Agde',
        'short_name' => 'Agde',
        'types' => ['locality', 'political'],
    ];
    private const DEFAULT_COUNTRY_COMPONENT = [
        'long_name' => 'France',
        'short_name' => 'FR',
        'types' => ['country', 'political'],
    ];
    private const DEFAULT_CODE_COMPONENT = [
        'long_name' => '34300',
        'short_name' => '34300',
        'types' => ['postal_code'],
    ];
    private const DEFAULT_GEOMETRY = [
        'location_type' => 'ROOFTOP',
        'location' => [
            'lat' => 48.1051781,
            'lng' => -1.6744521,
        ],
    ];

    public function let()
    {
        $json =
            '[{"address_components":[{"long_name":"10","short_name":"10","types":["street_number"]},{"long_name":"Cours des Alliés","short_name":"Cours des Alliés","types":["route"]},{"long_name":"Rennes","short_name":"Rennes","types":["locality","political"]},{"long_name":"Ille-et-Vilaine","short_name":"Ille-et-Vilaine","types":["administrative_area_level_2","political"]},{"long_name":"Bretagne","short_name":"Bretagne","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"35000","short_name":"35000","types":["postal_code"]}],"formatted_address":"10 Cours des Alliés, 35000 Rennes, France","geometry":{"location":{"lat":48.1051781,"lng":-1.6744521},"location_type":"ROOFTOP","viewport":{"northeast":{"lat":48.1065270802915,"lng":-1.673103119708498},"southwest":{"lat":48.1038291197085,"lng":-1.675801080291502}}},"place_id":"ChIJ59pcgLXfDkgR8WJ9mp5A204","types":["establishment","library","point_of_interest"]}]';

        $this->beConstructedWith($json, [], 34.2, 35.2, '');
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(GoogleMapsAddress::class);
    }

    public function it_should_return_a_correct_instance_when_provided_with_a_correct_address(): void
    {
        $addressFromApi =
            '[{"address_components":[{"long_name":"10","short_name":"10","types":["street_number"]},{"long_name":"Cours des Alliés","short_name":"Cours des Alliés","types":["route"]},{"long_name":"Rennes","short_name":"Rennes","types":["locality","political"]},{"long_name":"Ille-et-Vilaine","short_name":"Ille-et-Vilaine","types":["administrative_area_level_2","political"]},{"long_name":"Bretagne","short_name":"Bretagne","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"35000","short_name":"35000","types":["postal_code"]}],"formatted_address":"10 Cours des Alliés, 35000 Rennes, France","geometry":{"location":{"lat":48.1051781,"lng":-1.6744521},"location_type":"ROOFTOP","viewport":{"northeast":{"lat":48.1065270802915,"lng":-1.673103119708498},"southwest":{"lat":48.1038291197085,"lng":-1.675801080291502}}},"place_id":"ChIJ59pcgLXfDkgR8WJ9mp5A204","types":["establishment","library","point_of_interest"]}]';
        $this->beConstructedThrough('fromApi', [$addressFromApi]);

        $this->shouldBeAnInstanceOf(GoogleMapsAddress::class);
    }

    public function it_should_return_a_correct_Google_Maps_object_when_provided_with_a_correct_address(): void
    {
        $addressFromApi =
            '[{"address_components":[{"long_name":"10","short_name":"10","types":["street_number"]},{"long_name":"Cours des Alliés","short_name":"Cours des Alliés","types":["route"]},{"long_name":"Rennes","short_name":"Rennes","types":["locality","political"]},{"long_name":"Ille-et-Vilaine","short_name":"Ille-et-Vilaine","types":["administrative_area_level_2","political"]},{"long_name":"Bretagne","short_name":"Bretagne","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"35000","short_name":"35000","types":["postal_code"]}],"formatted_address":"10 Cours des Alliés, 35000 Rennes, France","geometry":{"location":{"lat":48.1051781,"lng":-1.6744521},"location_type":"ROOFTOP","viewport":{"northeast":{"lat":48.1065270802915,"lng":-1.673103119708498},"southwest":{"lat":48.1038291197085,"lng":-1.675801080291502}}},"place_id":"ChIJ59pcgLXfDkgR8WJ9mp5A204","types":["establishment","library","point_of_interest"]}]';
        $this->beConstructedThrough('fromApi', [$addressFromApi]);

        $this->getFormatted()->shouldReturn('10 Cours des Alliés, 35000 Rennes, France');
        $this->getLat()->shouldReturn(48.1051781);
        $this->getLng()->shouldReturn(-1.6744521);
        $this->getJson()->shouldReturn($addressFromApi);
        $this->getTypes()->shouldReturn(['ROOFTOP']);
    }

    public function it_should_decompose_correctly(): void
    {
        $decomposed = $this->decompose();
        $decomposed->shouldHaveCount(5);
        $decomposed['street_number']->shouldBe('10');
        $decomposed['route']->shouldBe('Cours des Alliés');
        $decomposed['postal_code']->shouldBe('35000');
        $decomposed['locality']->shouldBe('Rennes');
        $decomposed['country']->shouldBe('France');
    }

    public function it_should_decompose_correctly_without_street_number(): void
    {
        $addressFromApi =
            '[{"address_components":[{"long_name":"Cours des Alliés","short_name":"Cours des Alliés","types":["route"]},{"long_name":"Rennes","short_name":"Rennes","types":["locality","political"]},{"long_name":"Ille-et-Vilaine","short_name":"Ille-et-Vilaine","types":["administrative_area_level_2","political"]},{"long_name":"Bretagne","short_name":"Bretagne","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"35000","short_name":"35000","types":["postal_code"]}],"formatted_address":"10 Cours des Alliés, 35000 Rennes, France","geometry":{"location":{"lat":48.1051781,"lng":-1.6744521},"location_type":"ROOFTOP","viewport":{"northeast":{"lat":48.1065270802915,"lng":-1.673103119708498},"southwest":{"lat":48.1038291197085,"lng":-1.675801080291502}}},"place_id":"ChIJ59pcgLXfDkgR8WJ9mp5A204","types":["establishment","library","point_of_interest"]}]';
        $this->beConstructedThrough('fromApi', [$addressFromApi]);
        $decomposed = $this->decompose();
        $decomposed->shouldHaveCount(4);
        $decomposed['route']->shouldBe('Cours des Alliés');
        $decomposed['postal_code']->shouldBe('35000');
        $decomposed['locality']->shouldBe('Rennes');
        $decomposed['country']->shouldBe('France');
    }

    public function it_should_decompose_correctly_with_point_of_interest(): void
    {
        $addressFromApi = json_encode([
            [
                'address_components' => [
                    [
                        'long_name' => 'Père Noël',
                        'short_name' => 'Père Noël',
                        'types' => ['point_of_interest'],
                    ],
                    self::DEFAULT_LOCALITY_COMPONENT,
                    self::DEFAULT_COUNTRY_COMPONENT,
                    self::DEFAULT_CODE_COMPONENT,
                ],
                'geometry' => self::DEFAULT_GEOMETRY,
            ],
        ]);
        $this->beConstructedThrough('fromApi', [$addressFromApi]);
        $decomposed = $this->decompose();
        $decomposed->shouldHaveCount(4);
        $decomposed['point_of_interest']->shouldBe('Père Noël');
        $decomposed['postal_code']->shouldBe('34300');
        $decomposed['locality']->shouldBe('Agde');
        $decomposed['country']->shouldBe('France');
    }

    public function it_should_decompose_correctly_with_neighborhood(): void
    {
        $addressFromApi = json_encode([
            [
                'address_components' => [
                    [
                        'long_name' => 'Les Halles',
                        'short_name' => 'Les Halles',
                        'types' => ['neighborhood'],
                    ],
                    self::DEFAULT_LOCALITY_COMPONENT,
                    self::DEFAULT_COUNTRY_COMPONENT,
                    self::DEFAULT_CODE_COMPONENT,
                ],
                'geometry' => self::DEFAULT_GEOMETRY,
            ],
        ]);
        $this->beConstructedThrough('fromApi', [$addressFromApi]);
        $decomposed = $this->decompose();
        $decomposed->shouldHaveCount(4);
        $decomposed['point_of_interest']->shouldBe('Les Halles');
        $decomposed['postal_code']->shouldBe('34300');
        $decomposed['locality']->shouldBe('Agde');
        $decomposed['country']->shouldBe('France');
    }

    // This test shows an anti pattern about returning null instead of a NullObject.
    // @TODO When parsing a malformed address, it should not return null but a NullGoogleMapAddress object.
    // See: https://designpatternsphp.readthedocs.io/en/latest/Behavioral/NullObject/README.html
    /*
    public function it_should_return_null_with_a_malformed_address(): void
    {
        $addressFromApi =
            '[{},{":"Cours des Alliés","short_name":"Cours des Alliés","types":["route"]},{"long_na}]';
        $this->beConstructedThrough('fromApi', [$addressFromApi]);
        $this->shouldReturn(null);
    } */
}
