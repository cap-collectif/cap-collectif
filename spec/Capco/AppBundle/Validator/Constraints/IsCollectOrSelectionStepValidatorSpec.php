<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Validator\Constraints\IsCollectOrSelectionStep;
use Capco\AppBundle\Validator\Constraints\IsCollectOrSelectionStepValidator;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class IsCollectOrSelectionStepValidatorSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(IsCollectOrSelectionStepValidator::class);
    }

    public function it_should_add_violation_if_step_is_consultation_step(
        ConsultationStep $step,
        IsCollectOrSelectionStep $constraint,
        ExecutionContextInterface $context
    ) {
        $step->isSelectionStep()->willReturn(false)->shouldBeCalled();
        $step->isCollectStep()->willReturn(false)->shouldBeCalled();

        $this->initialize($context);
        $context->addViolation($constraint->message, [])->shouldBeCalled();
        $this->validate($step, $constraint);
    }

    public function it_should_not_add_violation_if_step_is_selection_step(
        SelectionStep $step,
        IsCollectOrSelectionStep $constraint,
        ExecutionContextInterface $context
    ) {
        $step->isSelectionStep()->willReturn(true)->shouldBeCalled();
        $this->initialize($context);
        $context->addViolation($constraint->message, [])->shouldNotBeCalled();
        $this->validate($step, $constraint);
    }

    public function it_should_not_add_violation_if_step_is_collect_step(
        CollectStep $step,
        IsCollectOrSelectionStep $constraint,
        ExecutionContextInterface $context
    ) {
        $step->isSelectionStep()->willReturn(false)->shouldBeCalled();
        $step->isCollectStep()->willReturn(true)->shouldBeCalled();
        $this->initialize($context);
        $context->addViolation($constraint->message, [])->shouldNotBeCalled();
        $this->validate($step, $constraint);
    }
}
