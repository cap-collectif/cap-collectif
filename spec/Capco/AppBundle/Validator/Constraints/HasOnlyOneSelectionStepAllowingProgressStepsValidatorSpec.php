<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Validator\Constraints\HasOnlyOneSelectionStepAllowingProgressSteps;
use Capco\AppBundle\Validator\Constraints\HasOnlyOneSelectionStepAllowingProgressStepsValidator;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class HasOnlyOneSelectionStepAllowingProgressStepsValidatorSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(HasOnlyOneSelectionStepAllowingProgressStepsValidator::class);
    }

    public function it_should_add_violation_if_there_is_more_than_one_selection_allowing_progress_steps_in_a_given_project(
        HasOnlyOneSelectionStepAllowingProgressSteps $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder,
        SelectionStep $selectionStep1,
        SelectionStep $selectionStep2
    ) {
        $selectionStep1->isSelectionStep()->willReturn(true);
        $selectionStep2->isSelectionStep()->willReturn(true);
        $selectionStep1->isAllowingProgressSteps()->willReturn(true);
        $selectionStep2->isAllowingProgressSteps()->willReturn(true);

        $builder->addViolation()->shouldBeCalled();
        $builder->atPath('project')->willReturn($builder)->shouldBeCalled();
        $context->buildViolation($constraint->message)->willReturn($builder)->shouldBeCalled();

        $this->initialize($context);
        $this->validate([$selectionStep1, $selectionStep2], $constraint)->shouldReturn(false);
    }

    public function it_should_not_add_violation_if_there_is_not_more_than_one_selection_allowing_progress_steps_in_a_given_project(
        HasOnlyOneSelectionStepAllowingProgressSteps $constraint,
        ExecutionContextInterface $context,
        SelectionStep $selectionStep,
        SelectionStep $selectionStepNotAllowing,
        AbstractStep $randomStep
    ) {
        $selectionStep->isSelectionStep()->willReturn(true);
        $selectionStepNotAllowing->isSelectionStep()->willReturn(true);
        $randomStep->isSelectionStep()->willReturn(false);
        $selectionStep->isAllowingProgressSteps()->willReturn(true);
        $selectionStepNotAllowing->isAllowingProgressSteps()->willReturn(false);

        $context->buildViolation($constraint->message)->shouldNotBeCalled();

        $this->initialize($context);
        $this->validate([$selectionStep, $selectionStepNotAllowing, $randomStep], $constraint)->shouldReturn(true);
    }

    public function it_should_not_add_violation_if_there_is_no_step_in_a_given_project(
        HasOnlyOneSelectionStepAllowingProgressSteps $constraint,
        ExecutionContextInterface $context
    ) {
        $context->buildViolation($constraint->message)->shouldNotBeCalled();

        $this->initialize($context);
        $this->validate([null, null], $constraint)->shouldReturn(true);
        $this->validate([], $constraint)->shouldReturn(true);
        $this->validate(new ArrayCollection([null, null]), $constraint)->shouldReturn(true);
    }
}
