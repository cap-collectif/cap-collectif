<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Questionnaire;
use Doctrine\Common\Collections\ArrayCollection;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Repository\RegistrationFormRepository;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Validator\Constraints\HasResponsesToRequiredQuestions;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class HasResponsesToRequiredQuestionsValidatorSpec extends ObjectBehavior
{
    function it_should_should_not_validate_a_draft(
        Reply $reply,
        HasResponsesToRequiredQuestions $constraint,
        ExecutionContextInterface $context,
        RegistrationFormRepository $formRepo
    ) {
        $this->beConstructedWith($formRepo);
        $this->initialize($context);
        $reply->isDraft()->willReturn(true);
        $context->buildViolation()->shouldNotBeCalled();
        $this->validate($reply, $constraint);
    }

    //TODO: Investiguer davantage concernant l'erreur avec le ArrayCollection sur PHPSpec x( $questionnaire->getQuestions()->willReturn(new ArrayCollection([$aq1])); )
    //    function it_should_should_validate_if_not_a_draft(
    //        ConstraintViolationBuilderInterface $builder,
    //        QuestionnaireAbstractQuestion $aq1,
    //        AbstractQuestion $question1,
    //        ValueResponse $response1,
    //        ValueResponse $response2,
    //        Questionnaire $questionnaire,
    //        Reply $reply,
    //        HasResponsesToRequiredQuestions $constraint,
    //        ExecutionContextInterface $context,
    //        RegistrationFormRepository $formRepo
    //    ) {
    //        $this->beConstructedWith($formRepo);
    //        $this->initialize($context);
    //        $question1->isRequired()->willReturn(true);
    //        $question1->getId()->willReturn(1);
    //        $aq1->getQuestion()->willReturn($question1);
    //        $questionnaire->getQuestions()->willReturn(new ArrayCollection([$aq1]));
    //        $reply->getQuestionnaire()->willReturn($questionnaire);
    //        $reply->getResponses()->willReturn(new ArrayCollection([$response1]));
    //        $builder->setParameter('missing', 1)->willReturn($builder);
    //        $builder->atPath('responses')->willReturn($builder);
    //        $builder->addViolation()->shouldBeCalled();
    //
    //        $constraint->formField = 'questionnaire';
    //        $reply->isDraft()->willReturn(false);
    //        $context
    //            ->buildViolation("global.missing_required_responses")
    //            ->willReturn($builder)
    //            ->shouldBeCalled();
    //        $this->validate($reply, $constraint);
    //    }
}
