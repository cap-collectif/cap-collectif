<?php

namespace spec\Capco\AppBundle\Validator\Constraints;

use Capco\AppBundle\Entity\LogicJump;
use Capco\AppBundle\Entity\MultipleChoiceQuestionLogicJumpCondition;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Repository\RegistrationFormRepository;
use Capco\AppBundle\Validator\Constraints\HasResponsesToRequiredQuestions;
use PhpSpec\ObjectBehavior;
use Prophecy\Prophet;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

class HasResponsesToRequiredQuestionsValidatorSpec extends ObjectBehavior
{
    public function let(
        RegistrationFormRepository $formRepo,
        ExecutionContextInterface $context,
        Reply $reply,
        HasResponsesToRequiredQuestions $constraint,
        LoggerInterface $logger
    ) {
        $this->beConstructedWith($formRepo, $logger);
        $this->initialize($context);
        $constraint->formField = 'questionnaire';
        $reply->isDraft()->willReturn(false);
    }

    public function it_should_validate_drafts(
        Reply $reply,
        HasResponsesToRequiredQuestions $constraint,
        ExecutionContextInterface $context,
        RegistrationFormRepository $formRepo
    ) {
        $reply->isDraft()->willReturn(true);
        $context->buildViolation()->shouldNotBeCalled();
        $this->validate($reply, $constraint);
    }

    public function it_should_add_error_if_required_questions_are_not_answered(
        ConstraintViolationBuilderInterface $builder,
        ExecutionContextInterface $context,
        QuestionnaireAbstractQuestion $aq1,
        AbstractQuestion $question1,
        ValueResponse $response1,
        ValueResponse $response2,
        Questionnaire $questionnaire,
        Reply $reply,
        HasResponsesToRequiredQuestions $constraint
    ) {
        $question1->isRequired()->willReturn(true);
        $question1->getId()->willReturn(1);
        $question1->getJumps()->willReturn([]);
        $question1->hasAlwaysJumpDestinationQuestion()->willReturn(false);

        $aq1->getQuestion()->willReturn($question1);
        $questionnaire->getQuestionsArray()->willReturn([$aq1]);

        $response1->getQuestion()->willReturn($question1);
        // We didn't respond to this question.
        $response1->getValue()->willReturn(null);

        $reply->getQuestionnaire()->willReturn($questionnaire);
        $reply->getResponsesArray()->willReturn([$response1]);

        $this->shouldErrorForQuestionId(1, $builder, $context);
        $context->getObject()->willReturn(null);
        $this->validate($reply, $constraint);
    }

    public function it_should_add_error_if_required_questions_are_not_answered_with_fulfilled_jumps_select(
        ConstraintViolationBuilderInterface $builder,
        ExecutionContextInterface $context,
        Reply $reply,
        HasResponsesToRequiredQuestions $constraint,
        LoggerInterface $logger
    ) {
        $this->prepareFormWithLogicJumps($reply, AbstractQuestion::QUESTION_TYPE_SELECT, 'Choix 1');
        $this->shouldErrorForQuestionId(2, $builder, $context);
        $logger->debug('Validator found questions to validate: [1,2]')->shouldBeCalled();
        $context->getObject()->willReturn(null);
        $this->validate($reply, $constraint);
    }

    public function it_should_add_error_if_required_questions_are_not_answered_with_fulfilled_jumps_select_multiple(
        ConstraintViolationBuilderInterface $builder,
        ExecutionContextInterface $context,
        Reply $reply,
        HasResponsesToRequiredQuestions $constraint,
        LoggerInterface $logger
    ) {
        $this->prepareFormWithLogicJumps(
            $reply,
            AbstractQuestion::QUESTION_TYPE_SELECT,
            'Choix 1',
            true,
            "Choix 1 j'étais sûr."
        );
        $logger->debug('Validator found questions to validate: [1,2,4,5]')->shouldBeCalled();
        $this->shouldErrorForQuestionId(4, $builder, $context);
        $context->getObject()->willReturn(null);
        $this->validate($reply, $constraint);
    }

    public function it_should_add_error_if_required_questions_are_not_answered_with_a_fulfilled_jumps_among_multiples(
        ConstraintViolationBuilderInterface $builder,
        ExecutionContextInterface $context,
        Reply $reply,
        HasResponsesToRequiredQuestions $constraint,
        LoggerInterface $logger
    ) {
        $this->prepareFormWithLogicJumps($reply, AbstractQuestion::QUESTION_TYPE_SELECT, 'Choix 2');
        $this->shouldErrorForQuestionId(3, $builder, $context);
        $logger->debug('Validator found questions to validate: [1,3,5]')->shouldBeCalled();
        $context->getObject()->willReturn(null);
        $this->validate($reply, $constraint);
    }

    public function it_should_validate_if_required_questions_are_not_in_fulfilled_jumps_select(
        ConstraintViolationBuilderInterface $builder,
        ExecutionContextInterface $context,
        Reply $reply,
        HasResponsesToRequiredQuestions $constraint,
        LoggerInterface $logger
    ) {
        $this->prepareFormWithLogicJumps(
            $reply,
            AbstractQuestion::QUESTION_TYPE_SELECT,
            'Choix 2',
            false
        );
        $context->buildViolation()->shouldNotBeCalled();
        $logger->debug('Validator found questions to validate: [1,3,5]')->shouldBeCalled();
        $context->getObject()->willReturn(null);
        $this->validate($reply, $constraint);
    }

    public function it_should_validate_if_required_questions_are_not_in_fulfilled_jumps_radio(
        ConstraintViolationBuilderInterface $builder,
        ExecutionContextInterface $context,
        Reply $reply,
        HasResponsesToRequiredQuestions $constraint,
        LoggerInterface $logger
    ) {
        $this->prepareFormWithLogicJumps(
            $reply,
            AbstractQuestion::QUESTION_TYPE_RADIO,
            ['labels' => ['Choix 2']],
            false
        );
        $context->buildViolation()->shouldNotBeCalled();
        $logger->debug('Validator found questions to validate: [1,3,5]')->shouldBeCalled();
        $context->getObject()->willReturn(null);
        $this->validate($reply, $constraint);
    }

    public function it_should_validate_if_required_questions_are_not_in_fulfilled_jumps_checkbox(
        ConstraintViolationBuilderInterface $builder,
        ExecutionContextInterface $context,
        Reply $reply,
        HasResponsesToRequiredQuestions $constraint,
        LoggerInterface $logger
    ) {
        $this->prepareFormWithLogicJumps(
            $reply,
            AbstractQuestion::QUESTION_TYPE_CHECKBOX,
            ['labels' => ['Choix 2']],
            false
        );
        $context->buildViolation()->shouldNotBeCalled();
        $logger->debug('Validator found questions to validate: [1,3,5]')->shouldBeCalled();
        $context->getObject()->willReturn(null);
        $this->validate($reply, $constraint);
    }

    public function it_should_validate_if_required_questions_are_not_in_fulfilled_jumps_buttons(
        ConstraintViolationBuilderInterface $builder,
        ExecutionContextInterface $context,
        Reply $reply,
        HasResponsesToRequiredQuestions $constraint,
        LoggerInterface $logger
    ) {
        $this->prepareFormWithLogicJumps(
            $reply,
            AbstractQuestion::QUESTION_TYPE_BUTTON,
            ['labels' => ['Choix 2']],
            false
        );
        $context->buildViolation()->shouldNotBeCalled();
        $logger->debug('Validator found questions to validate: [1,3,5]')->shouldBeCalled();
        $context->getObject()->willReturn(null);
        $this->validate($reply, $constraint);
    }

    /**
     * This is an helper function to prepare a form with questions and jumps for our unit tests.
     *
     * It avoid duplicating code for all our tests.
     *
     * @param null|mixed $secondValue
     */
    private function prepareFormWithLogicJumps(
        Reply $reply,
        int $firstQuestionType,
        mixed $firstValue,
        bool $isQuestion3Required = true,
        $secondValue = null
    ) {
        $prophet = new Prophet();

        $question1 = $prophet->prophesize(MultipleChoiceQuestion::class);
        $response1 = $prophet->prophesize(ValueResponse::class);

        $response2 = $prophet->prophesize(ValueResponse::class);

        $questionnaire = $prophet->prophesize(Questionnaire::class);
        $choice1 = $prophet->prophesize(QuestionChoice::class);
        $choice2 = $prophet->prophesize(QuestionChoice::class);

        $q2choice1 = $prophet->prophesize(QuestionChoice::class);
        $q2choice2 = $prophet->prophesize(QuestionChoice::class);

        $jump1 = $prophet->prophesize(LogicJump::class);
        $jump2 = $prophet->prophesize(LogicJump::class);

        $q2jump1 = $prophet->prophesize(LogicJump::class);
        $q2jump2 = $prophet->prophesize(LogicJump::class);

        $question2 = $prophet->prophesize(MultipleChoiceQuestion::class);
        $question3 = $prophet->prophesize(MultipleChoiceQuestion::class);
        $question4 = $prophet->prophesize(MultipleChoiceQuestion::class);
        $question5 = $prophet->prophesize(MultipleChoiceQuestion::class);

        $aq1 = $prophet->prophesize(QuestionnaireAbstractQuestion::class);
        $aq2 = $prophet->prophesize(QuestionnaireAbstractQuestion::class);
        $aq3 = $prophet->prophesize(QuestionnaireAbstractQuestion::class);
        $aq4 = $prophet->prophesize(QuestionnaireAbstractQuestion::class);
        $aq5 = $prophet->prophesize(QuestionnaireAbstractQuestion::class);

        $jump1Condition = $prophet->prophesize(MultipleChoiceQuestionLogicJumpCondition::class);
        $jump2Condition = $prophet->prophesize(MultipleChoiceQuestionLogicJumpCondition::class);
        $q2jump1Condition = $prophet->prophesize(MultipleChoiceQuestionLogicJumpCondition::class);
        $q2jump2Condition = $prophet->prophesize(MultipleChoiceQuestionLogicJumpCondition::class);

        $response1->getQuestion()->willReturn($question1);
        $response1->getValue()->willReturn($firstValue);

        $responses = [$response1];
        if ($secondValue) {
            $response2->getQuestion()->willReturn($question2);
            $response2->getValue()->willReturn($secondValue);

            $responses[] = $response2;
        }

        $reply->getQuestionnaire()->willReturn($questionnaire);
        $reply->getResponsesArray()->willReturn($responses);

        $choice1->getTitle()->willReturn('Choix 1');
        $choice2->getTitle()->willReturn('Choix 2');

        $q2choice1->getTitle()->willReturn("Choix 1 j'étais sûr.");
        $q2choice2->getTitle()->willReturn("Choix 1 j'étais pas sûr.");

        $question1->isRequired()->willReturn(true);
        $question1->getId()->willReturn(1);
        $question1->getJumps()->willReturn([$jump1, $jump2]);
        $question1->getChoices()->willReturn([$choice1, $choice2]);
        $question1->hasAlwaysJumpDestinationQuestion()->willReturn(false);
        $question1->getType()->willReturn($firstQuestionType);

        $jump1Condition->getQuestion()->willReturn($question1);
        $jump1Condition->getValue()->willReturn($choice1);
        $jump1Condition->getOperator()->willReturn('IS');

        $jump2Condition->getQuestion()->willReturn($question1);
        $jump2Condition->getValue()->willReturn($choice1);
        $jump2Condition->getOperator()->willReturn('IS_NOT');

        $q2jump1Condition->getQuestion()->willReturn($question2);
        $q2jump1Condition->getValue()->willReturn($q2choice1);
        $q2jump1Condition->getOperator()->willReturn('IS');

        $jump1->getConditions()->willReturn([$jump1Condition]);
        $jump1->getDestination()->willReturn($question2);
        $jump1->getId()->willReturn('jump1');

        $jump2->getConditions()->willReturn([$jump2Condition]);
        $jump2->getDestination()->willReturn($question3);
        $jump2->getId()->willReturn('jump2');

        $q2jump1->getConditions()->willReturn([$q2jump1Condition]);
        $q2jump1->getDestination()->willReturn($question4);
        $q2jump1->getId()->willReturn('q2jump1');

        $question2->isRequired()->willReturn(true);
        $question2->getId()->willReturn(2);
        $question2->getJumps()->willReturn([$q2jump1]);
        $question2->hasAlwaysJumpDestinationQuestion()->willReturn(false);
        $question2->getType()->willReturn($firstQuestionType);

        $question3->isRequired()->willReturn($isQuestion3Required);
        $question3->getId()->willReturn(3);
        $question3->getJumps()->willReturn([]);
        $question3->hasAlwaysJumpDestinationQuestion()->willReturn(true);
        $question3->getAlwaysJumpDestinationQuestion()->willReturn($question5);

        $question4->isRequired()->willReturn(true);
        $question4->getId()->willReturn(4);
        $question4->getJumps()->willReturn([]);
        $question4->hasAlwaysJumpDestinationQuestion()->willReturn(true);
        $question4->getAlwaysJumpDestinationQuestion()->willReturn($question5);

        $question5->isRequired()->willReturn(false);
        $question5->getId()->willReturn(5);
        $question5->getJumps()->willReturn([]);
        $question5->hasAlwaysJumpDestinationQuestion()->willReturn(false);

        $aq1->getQuestion()->willReturn($question1);
        $aq1->getPosition()->willReturn(1);

        $aq2->getQuestion()->willReturn($question2);
        $aq2->getPosition()->willReturn(2);

        $aq3->getQuestion()->willReturn($question3);
        $aq3->getPosition()->willReturn(3);

        $aq4->getQuestion()->willReturn($question4);
        $aq4->getPosition()->willReturn(3);

        $aq5->getQuestion()->willReturn($question5);
        $aq5->getPosition()->willReturn(4);

        $questionnaire->getQuestionsArray()->willReturn([$aq1, $aq2, $aq3, $aq4, $aq5]);
    }

    private function shouldErrorForQuestionId(int $questionId, $builder, $context): void
    {
        $builder
            ->setParameter('missing', $questionId)
            ->willReturn($builder)
            ->shouldBeCalled()
        ;
        $builder
            ->atPath('responses')
            ->willReturn($builder)
            ->shouldBeCalled()
        ;
        $builder->addViolation()->shouldBeCalled();
        $context
            ->buildViolation('global.missing_required_responses')
            ->willReturn($builder)
            ->shouldBeCalled()
        ;
    }
}
