<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Validator\Constraints\HasAddressIfMandatory;
use Capco\AppBundle\Validator\Constraints\HasAddressIfMandatoryValidator;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class HasAddressIfMandatoryValidatorSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(HasAddressIfMandatoryValidator::class);
    }

    public function it_should_validate_if_proposal_location_is_in_zone(
        ExecutionContextInterface $context,
        HasAddressIfMandatory $constraint,
        Proposal $proposal,
        ProposalForm $proposalForm,
        ProposalDistrict $district,
        ConstraintViolationBuilderInterface $builder
    ) {
        // France geojson (rough !)
        $district->getGeojson()->willReturn('{
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
}');
        $districts = [$district];

        $proposalForm
            ->getUsingAddress()
            ->willReturn(true)
            ->shouldBeCalled();
        $proposalForm
            ->isProposalInAZoneRequired()
            ->willReturn(true)
            ->shouldBeCalled();
        $proposalForm
            ->getDistricts()
            ->willReturn($districts)
            ->shouldBeCalled();

        $proposal
            ->getProposalForm()
            ->willReturn($proposalForm)
            ->shouldBeCalled();

        // Paris
        $proposal
            ->getAddress()
            ->willReturn('[{"geometry": { "location": {"lat": 48.866667, "lng": 2.333333 }}}]')
            ->shouldBeCalled();

        $builder->addViolation()->shouldNotBeCalled();
        $context->buildViolation()->shouldNotBeCalled();

        $this->initialize($context);
        $this->validate($proposal, $constraint);
    }

    public function it_should_not_validate_if_proposal_location_is_not_in_zone(
        ExecutionContextInterface $context,
        HasAddressIfMandatory $constraint,
        Proposal $proposal,
        ProposalForm $proposalForm,
        ProposalDistrict $district,
        ConstraintViolationBuilderInterface $builder
    ) {
        // France geojson (rough !)
        $district->getGeojson()->willReturn('{
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
}');
        $districts = [$district];

        $proposalForm
            ->getUsingAddress()
            ->willReturn(true)
            ->shouldBeCalled();
        $proposalForm
            ->isProposalInAZoneRequired()
            ->willReturn(true)
            ->shouldBeCalled();
        $proposalForm
            ->getDistricts()
            ->willReturn($districts)
            ->shouldBeCalled();

        $proposal
            ->getProposalForm()
            ->willReturn($proposalForm)
            ->shouldBeCalled();
        $proposal
            ->getAddress()
            ->willReturn('[{"geometry": { "location": {"lat": 0, "lng": 0 }}}]')
            ->shouldBeCalled();

        $builder->addViolation()->shouldBeCalled();
        $context
            ->buildViolation($constraint->addressNotInZoneMessage)
            ->willReturn($builder)
            ->shouldBeCalled();

        $this->initialize($context);
        $this->validate($proposal, $constraint);
    }

    public function it_should_not_validate_if_proposal_not_valid_json_address(
        ExecutionContextInterface $context,
        HasAddressIfMandatory $constraint,
        Proposal $proposal,
        ProposalForm $proposalForm,
        ConstraintViolationBuilderInterface $builder
    ) {
        $proposalForm
            ->getUsingAddress()
            ->willReturn(true)
            ->shouldBeCalled();

        $proposal
            ->getAddress()
            ->willReturn('popo')
            ->shouldBeCalled();
        $proposal
            ->getProposalForm()
            ->willReturn($proposalForm)
            ->shouldBeCalled();

        $builder->addViolation()->shouldBeCalled();
        $context
            ->buildViolation($constraint->noValidJsonAddressMessage)
            ->willReturn($builder)
            ->shouldBeCalled();
        $this->initialize($context);
        $this->validate($proposal, $constraint);
    }

    public function it_should_validate_if_proposal_has_location(
        ExecutionContextInterface $context,
        HasAddressIfMandatory $constraint,
        Proposal $proposal,
        ProposalForm $proposalForm,
        ConstraintViolationBuilderInterface $builder
    ) {
        $proposalForm
            ->getUsingAddress()
            ->willReturn(true)
            ->shouldBeCalled();
        $proposalForm
            ->isProposalInAZoneRequired()
            ->willReturn(false)
            ->shouldBeCalled();
        $proposal
            ->getAddress()
            ->willReturn('[{}]')
            ->shouldBeCalled();
        $proposal
            ->getProposalForm()
            ->willReturn($proposalForm)
            ->shouldBeCalled();

        $builder->addViolation()->shouldNotBeCalled();
        $context->buildViolation()->shouldNotBeCalled();
        $this->initialize($context);
        $this->validate($proposal, $constraint);
    }

    public function it_should_not_validate_if_proposal_has_no_location(
        ExecutionContextInterface $context,
        HasAddressIfMandatory $constraint,
        Proposal $proposal,
        ProposalForm $proposalForm,
        ConstraintViolationBuilderInterface $builder
    ) {
        $proposalForm
            ->getUsingAddress()
            ->willReturn(true)
            ->shouldBeCalled();

        $proposal
            ->getAddress()
            ->willReturn(null)
            ->shouldBeCalled();
        $proposal
            ->getProposalForm()
            ->willReturn($proposalForm)
            ->shouldBeCalled();

        $builder->addViolation()->shouldBeCalled();
        $context
            ->buildViolation($constraint->noAddressMessage)
            ->willReturn($builder)
            ->shouldBeCalled();
        $this->initialize($context);
        $this->validate($proposal, $constraint);
    }
}
