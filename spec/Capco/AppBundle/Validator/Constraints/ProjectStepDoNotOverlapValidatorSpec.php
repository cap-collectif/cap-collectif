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
        $steps = new ArrayCollection([]);
        $this->validate($steps, $constraint)->shouldReturn(true);
    }

    public function it_should_not_validate_if_steps_overlap(
        ConstraintViolationBuilderInterface $builder,
        ProjectStepDoNotOverlapConstraint $constraint,
        ExecutionContextInterface $context,
        ProjectAbstractStep $projectAbstractStepA,
        ProjectAbstractStep $projectAbstractStepB,
        AbstractStep $collectStep,
        AbstractStep $selectionStep
    ) {
        $collectStep->getStartAt()->willReturn((new \DateTime())->modify('-2 weeks'));
        $collectStep->getEndAt()->willReturn((new \DateTime())->modify('+2 weeks'));

        $selectionStep->getStartAt()->willReturn((new \DateTime())->modify('+1 day'));
        $selectionStep->getEndAt()->willReturn((new \DateTime())->modify('+1 weeks'));

        $projectAbstractStepA->getStep()->willReturn($collectStep);
        $projectAbstractStepB->getStep()->willReturn($selectionStep);

        $context->buildViolation($constraint->message)->willReturn($builder)->shouldBeCalled();
        $this->initialize($context);
        $this->validate(
            [
              $projectAbstractStepA,
              $projectAbstractStepB,
            ],
           $constraint
        )->shouldReturn(false);
    }

    public function it_should_validate_if_steps_do_not_overlap(
        ProjectStepDoNotOverlapConstraint $constraint,
        ExecutionContextInterface $context,
        ProjectAbstractStep $projectAbstractStepA,
        ProjectAbstractStep $projectAbstractStepB,
        ProjectAbstractStep $projectAbstractStepC,
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

        $projectAbstractStepA->getStep()->willReturn($collectStep);
        $projectAbstractStepB->getStep()->willReturn($selectionStep);
        $projectAbstractStepC->getStep()->willReturn($selectionStep2);

        $context->buildViolation($constraint->message)->shouldNotBeCalled();
        $this->initialize($context);
        $this->validate(
            [
                $projectAbstractStepA,
                $projectAbstractStepB,
                $projectAbstractStepC,
            ],
           $constraint
        )->shouldReturn(true);
    }
}
