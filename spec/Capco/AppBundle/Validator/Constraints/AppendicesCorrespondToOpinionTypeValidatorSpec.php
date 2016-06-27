<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Capco\AppBundle\Validator\Constraints\AppendicesCorrespondToOpinionType;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Entity\AppendixType;
use Capco\AppBundle\Entity\OpinionTypeAppendixType;


class AppendicesCorrespondToOpinionTypeValidatorSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Validator\Constraints\AppendicesCorrespondToOpinionTypeValidator');
    }

    function it_should_add_violation_if_there_is_an_appendice_a_not_available_type(
      Opinion $opinion,
      OpinionType $opinionType,
      OpinionAppendix $appendix1,
      AppendixType $appendixType1,
      AppendixType $appendixType2,
      OpinionTypeAppendixType $otat1,
      AppendicesCorrespondToOpinionType $constraint,
      ExecutionContextInterface $context,
      ConstraintViolationBuilderInterface $builder
      )
    {
      $appendixType1->getId()->willReturn(1)->shouldBeCalled();
      $appendixType2->getId()->willReturn(2)->shouldBeCalled();

      $otat1->getAppendixType()->willReturn($appendixType1)->shouldBeCalled();
      $opinionType->getAppendixTypes()->willReturn([$otat1])->shouldBeCalled();
      $appendix1->getAppendixType()->willReturn($appendixType2)->shouldBeCalled();

      $opinion->getAppendices()->willReturn([$appendix1])->shouldBeCalled();
      $opinion->getOpinionType()->willReturn($opinionType)->shouldBeCalled();

      $this->initialize($context);
      $builder->addViolation()->shouldBeCalled();
      $builder->atPath('selections')->willReturn($builder)->shouldBeCalled();
      $context->buildViolation($constraint->message)->willReturn($builder)->shouldBeCalled();
      $this->validate($opinion, $constraint);
    }

    function it_should_not_add_violation_if_there_is_an_appendice_for_available_type(
      Opinion $opinion,
      OpinionType $opinionType,
      OpinionAppendix $appendix1,
      AppendixType $appendixType1,
      OpinionTypeAppendixType $otat1,
      AppendicesCorrespondToOpinionType $constraint,
      ExecutionContextInterface $context,
      ConstraintViolationBuilderInterface $builder
      )
    {
      $appendixType1->getId()->willReturn(1)->shouldBeCalled();

      $otat1->getAppendixType()->willReturn($appendixType1)->shouldBeCalled();
      $opinionType->getAppendixTypes()->willReturn([$otat1])->shouldBeCalled();
      $appendix1->getAppendixType()->willReturn($appendixType1)->shouldBeCalled();

      $opinion->getAppendices()->willReturn([$appendix1])->shouldBeCalled();
      $opinion->getOpinionType()->willReturn($opinionType)->shouldBeCalled();

      $this->initialize($context);
      $builder->addViolation()->shouldNotBeCalled();
      $this->validate($opinion, $constraint);
    }

    function it_should_not_add_violation_if_there_is_no_opinion_appendices(
      Opinion $opinion,
      AppendicesCorrespondToOpinionType $constraint,
      ExecutionContextInterface $context,
      ConstraintViolationBuilderInterface $builder
      )
    {
      $opinion->getAppendices()->willReturn([]);
      $this->initialize($context);
      $builder->addViolation()->shouldNotBeCalled();
      $this->validate($opinion, $constraint);
    }

}
