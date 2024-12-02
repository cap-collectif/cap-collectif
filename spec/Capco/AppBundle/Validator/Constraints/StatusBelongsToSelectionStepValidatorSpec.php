<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Validator\Constraints\StatusBelongsToSelectionStep;
use Capco\AppBundle\Validator\Constraints\StatusBelongsToSelectionStepValidator;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class StatusBelongsToSelectionStepValidatorSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(StatusBelongsToSelectionStepValidator::class);
    }

    public function it_should_add_violation_if_status_does_not_belong_to_selection_step(
        Selection $selection,
        SelectionStep $step,
        SelectionStep $otherStep,
        Status $status,
        StatusBelongsToSelectionStep $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $status->getStep()->willReturn($otherStep)->shouldBeCalled();
        $selection->getStatus()->willReturn($status)->shouldBeCalled();
        $selection->getSelectionStep()->willReturn($step)->shouldBeCalled();

        $this->initialize($context);
        $builder->addViolation()->shouldBeCalled();
        $builder->atPath('status')->willReturn($builder)->shouldBeCalled();
        $context->buildViolation($constraint->message)->willReturn($builder)->shouldBeCalled();
        $this->validate($selection, $constraint);
    }

    public function it_should_not_add_violation_if_status_belongs_to_selection_step(
        Selection $selection,
        SelectionStep $step,
        Status $status,
        StatusBelongsToSelectionStep $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $status->getStep()->willReturn($step)->shouldBeCalled();
        $selection->getStatus()->willReturn($status)->shouldBeCalled();
        $selection->getSelectionStep()->willReturn($step)->shouldBeCalled();

        $this->initialize($context);
        $builder->addViolation()->shouldNotBeCalled();
        $this->validate($selection, $constraint);
    }
}
