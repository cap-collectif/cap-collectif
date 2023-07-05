<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Type\FormattedAddressTypeResolver;
use PhpSpec\ObjectBehavior;

class FormattedAddressTypeResolverSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(FormattedAddressTypeResolver::class);
    }

    public function it_should_return_a_correct_formatted_address_given_a_google_maps_api_response(Proposal $proposal): void
    {
        $address = <<<'EOF'
            [{"address_components":[{"long_name":"10","short_name":"10","types":["street_number"]},{"long_name":"Cours des Alliés","short_name":"Cours des Alliés","types":["route"]},{"long_name":"Rennes","short_name":"Rennes","types":["locality","political"]},{"long_name":"Ille-et-Vilaine","short_name":"Ille-et-Vilaine","types":["administrative_area_level_2","political"]},{"long_name":"Bretagne","short_name":"Bretagne","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"35000","short_name":"35000","types":["postal_code"]}],"formatted_address":"10 Cours des Alliés, 35000 Rennes, France","geometry":{"location":{"lat":48.1051781,"lng":-1.6744521},"location_type":"ROOFTOP","viewport":{"northeast":{"lat":48.1065270802915,"lng":-1.673103119708498},"southwest":{"lat":48.1038291197085,"lng":-1.675801080291502}}},"place_id":"ChIJ59pcgLXfDkgR8WJ9mp5A204","types":["establishment","library","point_of_interest"]}]
            EOF;
        $proposal->getAddress()->willReturn($address);
        $this($proposal)->shouldReturn('10 Cours des Alliés, 35000 Rennes, France');
    }

    public function it_should_return_null_if_address_is_not_set(Proposal $proposal): void
    {
        $proposal->getAddress()->willReturn(null);
        $this($proposal)->shouldReturn(null);
    }
}
