<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\District;
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
        $this->shouldHaveType('Capco\AppBundle\Validator\Constraints\HasDistrictIfMandatoryValidator');
    }

     public function it_should_validate_if_proposal_hasdistrict(
         Manager $manager,
         HasDistrictIfMandatory $constraint,
         Proposal $proposal,
         District $district
     ) {
         $this->beConstructedWith($manager);

        $proposal->getDistrict()->willReturn($district)->shouldBeCalled();

        $this->validate($proposal, $constraint)->shouldReturn(true);

     }

    public function it_should_not_validate_if_proposal_hasnodistrict_and_districtismandatory_and_feature_isactive(
        Manager $manager,
        HasDistrictIfMandatory $constraint,
         ExecutionContextInterface $context,
        Proposal $proposal,
         ProposalForm $proposalForm,
        ConstraintViolationBuilderInterface $builder
    ) {
        $this->beConstructedWith($manager);

        $proposalForm->isUsingDistrict()->willReturn(true)->shouldBeCalled();
        $proposalForm->isDistrictMandatory()->willReturn(true)->shouldBeCalled();
        $proposal->getProposalForm()->willReturn($proposalForm)->shouldBeCalled();
        $proposal->getDistrict()->willReturn(null)->shouldBeCalled();
        $manager->isActive('districts')->willReturn(true)->shouldBeCalled();

        $this->initialize($context);
        $builder->addViolation()->shouldBeCalled();
        $context->buildViolation($constraint->message)->willReturn($builder)->shouldBeCalled();

        $this->validate($proposal, $constraint)->shouldReturn(false);

    }
}
