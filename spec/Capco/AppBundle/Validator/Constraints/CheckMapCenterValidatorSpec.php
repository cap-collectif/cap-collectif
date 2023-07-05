<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Validator\Constraints\CheckMapCenter;
use Capco\AppBundle\Validator\Constraints\CheckMapCenterValidator;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class CheckMapCenterValidatorSpec extends ObjectBehavior
{
    public const VALID_EXAMPLES = [
        '[{"formatted_address":"1 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris, France","geometry":{"location":{"lat":48.8539541,"lng":2.3483307},"location_type":"ROOFTOP","viewport":{"south":48.8526051197085,"west":2.346981719708498,"north":48.8553030802915,"east":2.349679680291502}},"types":["street_address"],"address_components":[{"long_name":"1","short_name":"1","types":["street_number"]},{"long_name":"Parvis Notre Dame - Place Jean-Paul II","short_name":"Parvis Notre-Dame - Pl. Jean-Paul II","types":["route"]},{"long_name":"Paris","short_name":"Paris","types":["locality","political"]},{"long_name":"Département de Paris","short_name":"Département de Paris","types":["administrative_area_level_2","political"]},{"long_name":"Île-de-France","short_name":"IDF","types":["administrative_area_level_1","political"]},{"long_name":"France","short_name":"FR","types":["country","political"]},{"long_name":"75004","short_name":"75004","types":["postal_code"]}],"place_id":"ChIJhSwqouFx5kcR6GyDR7SVHKI","plus_code":{"compound_code":"V83X+H8 Paris, France","global_code":"8FW4V83X+H8"}}]',
    ];

    public const INVALID_EXAMPLES = [
        '["[{\"formatted_address\":\"1 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris, France\",\"geometry\":{\"location\":{\"lat\":48.8535815,\"lng\":2.3489147},\"location_type\":\"ROOFTOP\",\"viewport\":{\"northeast\":{\"lat\":48.85493048029149,\"lng\":2.350263680291502},\"southwest\":{\"lat\":48.8522325197085,\"lng\":2.347565719708498}}},\"types\":[\"establishment\",\"point_of_interest\"],\"address_components\":[{\"long_name\":\"1\",\"short_name\":\"1\",\"types\":[\"street_number\"]},{\"long_name\":\"Parvis Notre Dame - Place Jean-Paul II\",\"short_name\":\"Parvis Notre-Dame - Pl. Jean-Paul II\",\"types\":[\"route\"]},{\"long_name\":\"Paris\",\"short_name\":\"Paris\",\"types\":[\"locality\",\"political\"]},{\"long_name\":\"Arrondissement de Paris\",\"short_name\":\"Arrondissement de Paris\",\"types\":[\"administrative_area_level_2\",\"political\"]},{\"long_name\":\"Île-de-France\",\"short_name\":\"IDF\",\"types\":[\"administrative_area_level_1\",\"political\"]},{\"long_name\":\"France\",\"short_name\":\"FR\",\"types\":[\"country\",\"political\"]},{\"long_name\":\"75004\",\"short_name\":\"75004\",\"types\":[\"postal_code\"]}],\"place_id\":\"ChIJA1ojduFx5kcRl9460pSuQnY\",\"plus_code\":{\"compound_code\":\"V83X+CH Paris, France\",\"global_code\":\"8FW4V83X+CH\"}}]"]',
    ];

    public function it_is_initializable()
    {
        $this->shouldHaveType(CheckMapCenterValidator::class);
    }

    public function it_should_add_violation_on_invalid(
        CheckMapCenter $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $this->initialize($context);
        $builder->addViolation()->shouldBeCalled();
        $context
            ->buildViolation($constraint->message)
            ->willReturn($builder)
            ->shouldBeCalled()
        ;
        foreach (self::INVALID_EXAMPLES as $example) {
            $this->validate($example, $constraint);
        }
    }

    public function it_should_not_add_violation_examples(
        CheckMapCenter $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $this->initialize($context);
        $builder->addViolation()->shouldNotBeCalled();
        foreach (self::VALID_EXAMPLES as $example) {
            $this->validate($example, $constraint);
        }
    }
}
