<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Validator\Constraints\CheckColor;
use Capco\AppBundle\Validator\Constraints\CheckColorValidator;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class CheckColorValidatorSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(CheckColorValidator::class);
    }

    public function it_should_not_add_violation(
        CheckColor $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $this->initialize($context);
        $builder->addViolation()->shouldNotBeCalled();
        $this->validate('#ff0000', $constraint);
    }

    public function it_should_add_violation_too_many_letters(
        CheckColor $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $this->initialize($context);
        $builder->addViolation()->shouldBeCalled();
        $context
            ->buildViolation($constraint->message)
            ->willReturn($builder)
            ->shouldBeCalled();
        $this->validate('#ff0000D', $constraint);
    }
}
