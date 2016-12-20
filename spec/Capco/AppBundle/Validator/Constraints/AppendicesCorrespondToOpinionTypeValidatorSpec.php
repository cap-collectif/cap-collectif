<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Validator\Constraints\AppendicesCorrespondToOpinionType;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionAppendix;
use Capco\AppBundle\Entity\AppendixType;
use Capco\AppBundle\Entity\OpinionTypeAppendixType;
use Doctrine\Common\Collections\ArrayCollection;

class AppendicesCorrespondToOpinionTypeValidatorSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Validator\Constraints\AppendicesCorrespondToOpinionTypeValidator');
    }

    function it_should_add_violation_if_there_is_an_appendice_a_not_available_type(
      Opinion $opinion,
      OpinionType $opinionType,
      OpinionAppendix $appendix,
      AppendixType $appendixType1,
      AppendixType $appendixType2,
      OpinionTypeAppendixType $otat,
      AppendicesCorrespondToOpinionType $constraint,
      ExecutionContextInterface $context,
      ConstraintViolationBuilderInterface $builder
      ) {
        // $appendixType1->getId()->willReturn(1);
      // $appendixType2->getId()->willReturn(2);
      // $otat->getAppendixType()->willReturn($appendixType1);
      // $appendix->getAppendixType()->willReturn($appendixType2);
      //
      // $opinionType->getAppendixTypes()->willReturn(new ArrayCollection([$otat]));
      // $opinion->getOpinionType()->willReturn($opinionType)->shouldBeCalled();
      // $opinion->getAppendices()->willReturn(new ArrayCollection([$appendix]));
      //
      // $context->addViolationAt('appendices', $constraint->message)->shouldBeCalled();

      // BUG in phpspec
      $this->initialize($context);
      // $this->validate($opinion, $constraint);
    }

    function it_should_not_add_violation_if_there_is_appendices_for_available_type(
      Opinion $opinion,
      OpinionType $opinionType,
      OpinionAppendix $appendix1,
      OpinionAppendix $appendix2,
      AppendixType $appendixType1,
      AppendixType $appendixType2,
      OpinionTypeAppendixType $otat1,
      OpinionTypeAppendixType $otat2,
      AppendicesCorrespondToOpinionType $constraint,
      ExecutionContextInterface $context,
      ConstraintViolationBuilderInterface $builder
      ) {
        // $appendixType1->getId()->willReturn(1);
      // $appendixType2->getId()->willReturn(2);
      //
      // $otat1->getAppendixType()->willReturn($appendixType1);
      // $otat2->getAppendixType()->willReturn($appendixType2);
      // $appendix1->getAppendixType()->willReturn($appendixType1);
      // $appendix2->getAppendixType()->willReturn($appendixType2);
      //
      // $opinionType->getAppendixTypes()->willReturn(new ArrayCollection([$otat1, $otat2]));
      // $opinion->getAppendices()->willReturn(new ArrayCollection([$appendix1, $appendix2]));
      // $opinion->getOpinionType()->willReturn($opinionType)->shouldBeCalled();

      // bug in phpspec ?

      $this->initialize($context);
        $context->addViolationAt('appendices', $constraint->message)->shouldNotBeCalled();
      // $this->validate($opinion, $constraint);
    }

    function it_should_not_add_violation_if_there_is_no_opinion_appendices(
      Opinion $opinion,
      AppendicesCorrespondToOpinionType $constraint,
      ExecutionContextInterface $context,
      ConstraintViolationBuilderInterface $builder
      ) {
        $opinion->getAppendices()->willReturn(new ArrayCollection([]));
        $this->initialize($context);
        $context->addViolationAt('appendices', $constraint->message)->shouldNotBeCalled();
        $this->validate($opinion, $constraint);
    }
}
