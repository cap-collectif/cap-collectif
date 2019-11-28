<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Validator\Constraints\CheckGeoJson;
use Capco\AppBundle\Validator\Constraints\CheckGeoJsonValidator;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class CheckGeoJsonValidatorSpec extends ObjectBehavior
{
    private const EXAMPLES = [
        'w' => '{
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "geometry": {
              "type": "Point",
              "coordinates": [102.0, 0.5]
              },
              "properties": {
                "prop0": "value0"
              }
            },
            {
              "type": "Feature",
              "geometry": {
                "type": "LineString",
                "coordinates": [
                  [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
                ]
              },
              "properties": {
                "prop0": "value0",
                "prop1": 0.0
              }
            },
            {
              "type": "Feature",
              "geometry": {
                "type": "Polygon",
                "coordinates": [
                  [
                    [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
                    [100.0, 1.0], [100.0, 0.0]
                  ]
                ]
              },
              "properties": {
                "prop0": "value0",
                "prop1": { "this": "that" }
              }
            }
          ]
        }',
        'a' => '{
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "geometry": {
                "type": "Polygon",
                "coordinates": [
                  [
                    [
                      -4.3560791015625,
                      49.03786794532644
                    ],
                    [
                      -0.1373291015625,
                      39.36827914916013
                    ],
                    [
                      12.3431396484375,
                      44.21370990970205
                    ],
                    [
                      3.0267333984375,
                      52.696361078274485
                    ],
                    [
                      -4.3560791015625,
                      49.03786794532644
                    ]
                  ]
                ]
              },
              "properties": {}
            }
          ]
        }',
        'multi' => '{
          "type": "FeatureCollection",
          "features": [
            {
              "type": "Feature",
              "geometry": {
                "type": "MultiPoint", 
                "coordinates": [
                  [10, 40], [40, 30], [20, 20], [30, 10]
                ]
              },
              "properties": {}
            },
            {
              "type": "Feature",
              "geometry": {
                "type": "MultiLineString", 
                "coordinates": [
                  [[10, 10], [20, 20], [10, 40]], 
                  [[40, 40], [30, 30], [40, 20], [30, 10]]
                ]
              },
              "properties": {}
            },
            {
              "type": "Feature",
              "geometry": {
                "type": "MultiPolygon", 
                "coordinates": [
                  [
                    [[40, 40], [20, 45], [45, 30], [40, 40]]
                  ], 
                  [
                    [[20, 35], [10, 30], [10, 10], [30, 5], [45, 20], [20, 35]], 
                    [[30, 20], [20, 15], [20, 25], [30, 20]]
                  ]
                ]
              },
              "properties": {}
            }
          ]          
        }'
    ];

    public function it_is_initializable()
    {
        $this->shouldHaveType(CheckGeoJsonValidator::class);
    }

    public function it_should_add_violation_not_json(
        CheckGeoJson $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $this->initialize($context);
        $builder->addViolation()->shouldBeCalled();
        $context
            ->buildViolation($constraint->message)
            ->willReturn($builder)
            ->shouldBeCalled();
        $this->validate('ce_test_ne_marche_pas', $constraint);
    }

    public function it_should_add_violation_json_not_geo(
        CheckGeoJson $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $this->initialize($context);
        $builder->addViolation()->shouldBeCalled();
        $context
            ->buildViolation($constraint->message)
            ->willReturn($builder)
            ->shouldBeCalled();
        $this->validate(json_encode('ce_test_ne_marche_pas'), $constraint);
    }

    public function it_should_not_add_violation_examples(
        CheckGeoJson $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $this->initialize($context);
        $builder->addViolation()->shouldNotBeCalled();
        foreach (self::EXAMPLES as $example) {
            $this->validate($example, $constraint);
        }
    }
}
