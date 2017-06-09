<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Validator\Constraints\HasOnlyOneSelectionPerStep;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class HasOnlyOneSelectionPerStepValidatorSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Validator\Constraints\HasOnlyOneSelectionPerStepValidator');
    }

    public function it_should_add_violation_if_there_is_more_than_one_selection_for_the_same_step(
        Proposal $proposal,
        HasOnlyOneSelectionPerStep $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $proposal->getSelectionStepsIds()->willReturn(['step1', 'step2', 'step3', 'step3'])->shouldBeCalled();

        $this->initialize($context);
        $builder->addViolation()->shouldBeCalled();
        $builder->atPath('selections')->willReturn($builder)->shouldBeCalled();
        $context->buildViolation($constraint->message)->willReturn($builder)->shouldBeCalled();
        $this->validate($proposal, $constraint);
    }

    public function it_should_not_add_violation_if_there_is_no_more_than_one_selection_for_the_same_step(
        Proposal $proposal,
        HasOnlyOneSelectionPerStep $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $proposal->getSelectionStepsIds()->willReturn(['step1', 'step2', 'step3'])->shouldBeCalled();
        $this->initialize($context);
        $builder->addViolation()->shouldNotBeCalled();
        $this->validate($proposal, $constraint);
    }
}
