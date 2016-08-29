<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Validator\Constraints\HasOnlyOneRealisationStep;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;
use Capco\AppBundle\Entity\Steps\RealisationStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Doctrine\Common\Collections\ArrayCollection;

class HasOnlyOneRealisationStepValidatorSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Validator\Constraints\HasOnlyOneRealisationStepValidator');
    }

    function it_should_add_violation_if_there_is_more_than_one_realisation_for_a_given_project(
        HasOnlyOneRealisationStep $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder,
        ProjectAbstractStep $pas1,
        ProjectAbstractStep $pas2,
        RealisationStep $realisationStep1,
        RealisationStep $realisationStep2
    )
    {
        $realisationStep1->isRealisationStep()->willReturn(true);
        $realisationStep2->isRealisationStep()->willReturn(true);

        $pas1->getStep()->willReturn($realisationStep1);
        $pas2->getStep()->willReturn($realisationStep2);

        $builder->addViolation()->shouldBeCalled();
        $builder->atPath('project')->willReturn($builder)->shouldBeCalled();
        $context->buildViolation($constraint->message)->willReturn($builder)->shouldBeCalled();

        $this->initialize($context);
        $this->validate([$pas1, $pas2], $constraint)->shouldReturn(false);
    }

    function it_should_not_add_violation_if_there_is_no_more_than_one_realisation_for_a_given_project(
        HasOnlyOneRealisationStep $constraint,
        ExecutionContextInterface $context,
        ProjectAbstractStep $pas1,
        ProjectAbstractStep $pas2,
        RealisationStep $realisationStep,
        AbstractStep $randomStep
    )
    {
      $realisationStep->isRealisationStep()->willReturn(true);
      $randomStep->isRealisationStep()->willReturn(false);

      $pas1->getStep()->willReturn($realisationStep);
      $pas2->getStep()->willReturn($randomStep);

      $context->buildViolation($constraint->message)->shouldNotBeCalled();

      $this->initialize($context);
      $this->validate([$pas1, $pas2], $constraint)->shouldReturn(true);
    }

}
