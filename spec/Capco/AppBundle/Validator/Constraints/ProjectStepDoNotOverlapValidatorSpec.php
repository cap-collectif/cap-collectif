<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Validator\Constraints\ProjectStepDoNotOverlapConstraint;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class ProjectStepDoNotOverlapValidatorSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Validator\Constraints\ProjectStepDoNotOverlapValidator');
    }

    public function it_should_validate_if_no_steps(
        ProjectStepDoNotOverlapConstraint $constraint,
        ExecutionContextInterface $context
    ) {
        $context->buildViolation($constraint->message)->shouldNotBeCalled();
        $this->initialize($context);
        $this->validate([], $constraint);
    }

    public function it_should_not_validate_if_steps_overlap(
        ConstraintViolationBuilderInterface $builder,
        ProjectStepDoNotOverlapConstraint $constraint,
        ExecutionContextInterface $context,
        AbstractStep $collectStep,
        AbstractStep $selectionStep
    ) {
        $collectStep->getStartAt()->willReturn((new \DateTime())->modify('-2 weeks'));
        $collectStep->getEndAt()->willReturn((new \DateTime())->modify('+2 weeks'));

        $selectionStep->getStartAt()->willReturn((new \DateTime())->modify('+1 day'));
        $selectionStep->getEndAt()->willReturn((new \DateTime())->modify('+1 weeks'));

        $context->buildViolation($constraint->message)->willReturn($builder)->shouldBeCalled();
        $this->initialize($context);
        $this->validate(
            [
              $collectStep,
              $selectionStep,
            ],
           $constraint
        );
    }

    public function it_should_validate_if_steps_do_not_overlap(
        ProjectStepDoNotOverlapConstraint $constraint,
        ExecutionContextInterface $context,
        AbstractStep $collectStep,
        AbstractStep $selectionStep,
        AbstractStep $selectionStep2
    ) {
        $collectStep->getStartAt()->willReturn((new \DateTime())->modify('-2 weeks'));
        $collectStep->getEndAt()->willReturn((new \DateTime())->modify('-1 weeks'));

        $selectionStep->getStartAt()->willReturn((new \DateTime())->modify('+1 day'));
        $selectionStep->getEndAt()->willReturn((new \DateTime())->modify('+1 weeks'));

        $selectionStep2->getStartAt()->willReturn((new \DateTime())->modify('-1 day'));
        $selectionStep2->getEndAt()->willReturn((new \DateTime())->modify('-1 second'));

        $context->buildViolation($constraint->message)->shouldNotBeCalled();
        $this->initialize($context);
        $this->validate(
            [
                $collectStep,
                $selectionStep,
                $selectionStep2,
            ],
           $constraint
        );
    }
}
