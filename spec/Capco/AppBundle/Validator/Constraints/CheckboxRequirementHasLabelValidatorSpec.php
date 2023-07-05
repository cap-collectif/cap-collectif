<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Validator\Constraints\CheckboxRequirementHasLabel;
use Capco\AppBundle\Validator\Constraints\CheckboxRequirementHasLabelValidator;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class CheckboxRequirementHasLabelValidatorSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(CheckboxRequirementHasLabelValidator::class);
    }

    public function it_should_add_violation_if_checkbox_without_label(
        CheckboxRequirementHasLabel $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder,
        Requirement $requirement
    ) {
        $this->initialize($context);
        $builder->addViolation()->shouldBeCalled();
        $context
            ->buildViolation($constraint->message)
            ->willReturn($builder)
            ->shouldBeCalled()
        ;

        $requirement
            ->getType()
            ->shouldBeCalled()
            ->willReturn(Requirement::CHECKBOX)
        ;
        $requirement
            ->getLabel()
            ->shouldBeCalled()
            ->willReturn('')
        ;

        $this->validate([$requirement], $constraint);
    }

    public function it_should_pass_if_checkbox_with_label(
        CheckboxRequirementHasLabel $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder,
        Requirement $requirement
    ) {
        $this->initialize($context);
        $builder->addViolation()->shouldNotBeCalled();

        $requirement
            ->getType()
            ->shouldBeCalled()
            ->willReturn(Requirement::CHECKBOX)
        ;
        $requirement
            ->getLabel()
            ->shouldBeCalled()
            ->willReturn('a')
        ;

        $this->validate([$requirement], $constraint);
    }

    public function it_should_pass_if_firstname_without_label(
        CheckboxRequirementHasLabel $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder,
        Requirement $requirement
    ) {
        $this->initialize($context);
        $builder->addViolation()->shouldNotBeCalled();

        $requirement
            ->getType()
            ->shouldBeCalled()
            ->willReturn(Requirement::FIRSTNAME)
        ;

        $this->validate([$requirement], $constraint);
    }
}
