<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\Proposal;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Validator\Constraints\HasDistrictIfMandatory;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class HasDistrictIfMandatoryValidatorSpec extends ObjectBehavior
{
    public function it_is_initializable(Manager $manager)
    {
        $this->beConstructedWith($manager);
        $this->shouldHaveType(
            'Capco\AppBundle\Validator\Constraints\HasDistrictIfMandatoryValidator'
        );
    }

    public function it_should_validate_if_proposal_hasdistrict(
        Manager $manager,
        ExecutionContextInterface $context,
        HasDistrictIfMandatory $constraint,
        Proposal $proposal,
        ProposalDistrict $district
    ) {
        $proposal
            ->getDistrict()
            ->willReturn($district)
            ->shouldBeCalled();

        $context->buildViolation($constraint->message)->shouldNotBeCalled();
        $this->beConstructedWith($manager);
        $this->initialize($context);
        $this->validate($proposal, $constraint);
    }

    public function it_should_not_validate_if_proposal_hasnodistrict_and_districtismandatory_and_feature_isactive(
        Manager $manager,
        HasDistrictIfMandatory $constraint,
        ExecutionContextInterface $context,
        Proposal $proposal,
        ProposalForm $proposalForm,
        ConstraintViolationBuilderInterface $builder
    ) {
        $proposalForm
            ->isDistrictMandatory()
            ->willReturn(true)
            ->shouldBeCalled();
        $proposal
            ->getProposalForm()
            ->willReturn($proposalForm)
            ->shouldBeCalled();
        $proposal
            ->getDistrict()
            ->willReturn(null)
            ->shouldBeCalled();
        $manager
            ->isActive('districts')
            ->willReturn(true)
            ->shouldBeCalled();

        $this->beConstructedWith($manager);
        $this->initialize($context);
        $builder->addViolation()->shouldBeCalled();
        $context
            ->buildViolation($constraint->message)
            ->willReturn($builder)
            ->shouldBeCalled();

        $this->validate($proposal, $constraint);
    }
}
