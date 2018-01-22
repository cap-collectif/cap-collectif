<?php

namespace spec\Capco\AdminBundle\Validator\Constraints;


use Capco\AdminBundle\Validator\Constraints\LessThanIfMetaDescription;
use Capco\AdminBundle\Validator\Constraints\LessThanIfMetaDescriptionValidator;
use Capco\AppBundle\Entity\SiteParameter;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class LessThanIfMetaDescriptionValidatorSpec extends ObjectBehavior
{

    public function it_is_initializable()
    {
        $this->shouldHaveType(LessThanIfMetaDescriptionValidator::class);
    }

    public function it_should_add_violation_if_metadescription_exceed_max(
        SiteParameter $parameter,
        LessThanIfMetaDescription $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $parameter->isSocialNetworkDescription()->willReturn(true)->shouldBeCalled();
        $str = "";
        for($i = 0; $i < $constraint->max + 10; $i++) {
            $str .= $i;
        }
        $parameter->getValue()->willReturn($str)->shouldBeCalled();
        $builder->addViolation()->shouldBeCalled();
        $context->buildViolation($constraint->message)->willReturn($builder)->shouldBeCalled();
        $this->initialize($context);
        $this->validate($parameter, $constraint);
    }

    public function it_should_not_add_violation_if_metadescription_dont_exceed_max(
        SiteParameter $parameter,
        LessThanIfMetaDescription $constraint,
        ExecutionContextInterface $context,
        ConstraintViolationBuilderInterface $builder
    ) {
        $parameter->isSocialNetworkDescription()->willReturn(true)->shouldBeCalled();
        $parameter->getValue()->willReturn("Je suis une description.")->shouldBeCalled();
        $builder->addViolation()->shouldNotBeCalled();
        $context->buildViolation($constraint->message)->willReturn($builder)->shouldNotBeCalled();
        $this->initialize($context);
        $this->validate($parameter, $constraint);
    }

}
