<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\RealisationStep;
use Capco\AppBundle\Validator\Constraints\HasOnlyOneRealisationStep;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

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
        ArrayCollection $arrayCollection
    )
    {
        $arrayCollection->exists(Argument::type('Closure'))->willReturn(true);

        $this->initialize($context);
        $builder->addViolation()->shouldBeCalled();
        $builder->atPath('project')->willReturn($builder)->shouldBeCalled();
        $context->buildViolation($constraint->message)->willReturn($builder)->shouldBeCalled();
        $this->hasRealisationStep($arrayCollection)->shouldReturn(true);
        $this->validate($arrayCollection, $constraint);
    }

    function it_should_not_add_violation_if_there_is_no_more_than_one_realisation_for_a_given_project(
        HasOnlyOneRealisationStep $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder,
        ArrayCollection $arrayCollection
    )
    {
        $arrayCollection->exists(Argument::type('Closure'))->willReturn(false);

        $this->initialize($context);
        $builder->addViolation()->shouldNotBeCalled();
        $builder->atPath('project')->willReturn($builder)->shouldNotBeCalled();
        $context->buildViolation($constraint->message)->willReturn($builder)->shouldNotBeCalled();
        $this->hasRealisationStep($arrayCollection)->shouldReturn(false);
        $this->validate($arrayCollection, $constraint);
    }

}
