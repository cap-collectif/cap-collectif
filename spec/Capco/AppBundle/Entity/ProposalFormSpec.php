<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\DisplayableInBOInterface;
use Capco\AppBundle\Entity\Interfaces\QuestionnableForm;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Prophecy\Prophet;

/**
 * @template TKey
 * @template TValue
 * @template-extends ObjectBehavior<TKey,TValue>
 */
class ProposalFormSpec extends ObjectBehavior
{
    public function let(): void
    {
        $this->beConstructedWith();
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ProposalForm::class);
    }

    public function it_is_a_questionnable(): void
    {
        $this->shouldImplement(QuestionnableForm::class);
    }

    public function it_is_displayable_in_bo(): void
    {
        $this->shouldImplement(DisplayableInBOInterface::class);
    }

    public function it_should_return_field_type_for_csv(
        MediaQuestion $mediaQuestion,
        SimpleQuestion $simpleQuestion,
        SimpleQuestion $editorTypeQuestion,
        SimpleQuestion $numberQuestion,
        MultipleChoiceQuestion $multipleChoiceQuestionSimpleResponse,
        MultipleChoiceQuestion $buttonQuestion,
        MultipleChoiceQuestion $multipleChoiceQuestionWithoutResponse,
        SimpleQuestion $majorityDecision,
        QuestionnaireAbstractQuestion $abstractQuestion1,
        QuestionnaireAbstractQuestion $abstractQuestion2,
        QuestionnaireAbstractQuestion $abstractQuestion3,
        QuestionnaireAbstractQuestion $abstractQuestion4,
        QuestionnaireAbstractQuestion $abstractQuestion5,
        QuestionnaireAbstractQuestion $abstractQuestion6,
        QuestionnaireAbstractQuestion $abstractQuestion7,
        QuestionnaireAbstractQuestion $abstractQuestion8,
        QuestionChoice $firstChoice,
        QuestionChoice $secondChoice,
        QuestionChoice $thirdChoice
    ): void {
        $editorTypeQuestion->getInputType()->willReturn('editor');
        $editorTypeQuestion->getType()->willReturn(AbstractQuestion::QUESTION_TYPE_EDITOR);
        $editorTypeQuestion->getTitle()->willReturn('Description');

        $numberQuestion->getInputType()->willReturn('number');
        $numberQuestion->getType()->willReturn(AbstractQuestion::QUESTION_TYPE_NUMBER);
        $numberQuestion->getTitle()->willReturn('NOMBRE');

        $buttonQuestion->getInputType()->willReturn('button');
        $buttonQuestion->getType()->willReturn(AbstractQuestion::QUESTION_TYPE_BUTTON);
        $buttonQuestion->getTitle()->willReturn('BUTTON');

        $majorityDecision->getInputType()->willReturn('majority');
        $majorityDecision->getType()->willReturn(AbstractQuestion::QUESTION_TYPE_MAJORITY_DECISION);
        $majorityDecision->getTitle()->willReturn('MAJORITY');

        $mediaQuestion->getTitle()->willReturn('Ajoutez un document');
        $mediaQuestion->getType()->willReturn(AbstractQuestion::QUESTION_TYPE_MEDIAS);
        $mediaQuestion->getInputType()->willReturn('medias');

        $simpleQuestion->getTitle()->willReturn('Ajoutez un texte');
        $simpleQuestion->getType()->willReturn(AbstractQuestion::QUESTION_TYPE_SIMPLE_TEXT);
        $simpleQuestion->getInputType()->willReturn('textarea');

        $prophet = new Prophet();
        $multipleChoiceQuestionMultiResponses = $prophet->prophesize(MultipleChoiceQuestion::class);
        $multipleChoiceQuestionMultiResponses
            ->getTitle()
            ->willReturn('Question multiple à choix multiple')
        ;
        $multipleChoiceQuestionMultiResponses
            ->getType()
            ->willReturn(AbstractQuestion::QUESTION_TYPE_SELECT)
        ;

        $multipleChoiceQuestionSimpleResponse
            ->getTitle()
            ->willReturn('Question multiple à choix unique')
        ;
        $multipleChoiceQuestionSimpleResponse
            ->getType()
            ->willReturn(AbstractQuestion::QUESTION_TYPE_RADIO)
        ;

        $firstChoice->getTitle()->willReturn('choice 1');
        $secondChoice->getTitle()->willReturn('choice 2');
        $thirdChoice->getTitle()->willReturn('choice 3');
        $choices = new ArrayCollection([
            $firstChoice->getWrappedObject(),
            $secondChoice->getWrappedObject(),
            $thirdChoice->getWrappedObject(),
        ]);
        $multipleChoiceQuestionSimpleResponse->getChoices()->willReturn($choices);
        $buttonQuestion->getChoices()->willReturn($choices);

        // Cas d'une question à choix multiple dont les réponses n'ont pas été configurées
        $multipleChoiceQuestionWithoutResponse->getChoices()->willReturn(new ArrayCollection());

        $multipleChoiceQuestionWithoutResponse
            ->getTitle()
            ->willReturn('Question multiple mal configurée')
        ;
        $multipleChoiceQuestionWithoutResponse
            ->getType()
            ->willReturn(AbstractQuestion::QUESTION_TYPE_SELECT)
        ;

        $abstractQuestion1->getQuestion()->willReturn($mediaQuestion->getWrappedObject());
        $abstractQuestion2->getQuestion()->willReturn($simpleQuestion->getWrappedObject());
        $abstractQuestion3->getQuestion()->willReturn($multipleChoiceQuestionMultiResponses);
        $abstractQuestion4
            ->getQuestion()
            ->willReturn($multipleChoiceQuestionSimpleResponse->getWrappedObject())
        ;
        $abstractQuestion5->getQuestion()->willReturn($editorTypeQuestion->getWrappedObject());
        $abstractQuestion6->getQuestion()->willReturn($numberQuestion->getWrappedObject());
        $abstractQuestion7->getQuestion()->willReturn($buttonQuestion->getWrappedObject());
        $abstractQuestion8->getQuestion()->willReturn($majorityDecision->getWrappedObject());

        $questions = new ArrayCollection([
            $mediaQuestion->getWrappedObject(),
            $simpleQuestion->getWrappedObject(),
            $multipleChoiceQuestionMultiResponses,
            $multipleChoiceQuestionSimpleResponse->getWrappedObject(),
            $editorTypeQuestion->getWrappedObject(),
            $numberQuestion->getWrappedObject(),
            $buttonQuestion->getWrappedObject(),
            $majorityDecision->getWrappedObject(),
            $multipleChoiceQuestionWithoutResponse->getWrappedObject(),
        ]);

        $fields = [
            'Ajoutez un texte' => 'texte brut',
            'Question multiple à choix unique' => 'choice 1',
            'Description' => 'texte brut ou html',
            'NOMBRE' => 'nombre',
            'BUTTON' => 'choice 1',
            'MAJORITY' => 'très bien',
            'Question multiple mal configurée' => '',
        ];

        // @phpstan-ignore-next-line-pattern '#Call to an undefined method [a-zA-Z0-9\\_]+::getFieldsType\(\)#'
        $this->getFieldsType($questions, false)->shouldReturn($fields);
        $fields = [
            'Ajoutez un texte' => 'texte brut',
            'Question multiple à choix unique' => 'choice 2',
            'Description' => 'texte brut ou html',
            'NOMBRE' => 'nombre',
            'BUTTON' => 'choice 2',
            'MAJORITY' => 'bien',
            'Question multiple mal configurée' => '',
        ];

        // @phpstan-ignore-next-line-pattern '#Call to an undefined method [a-zA-Z0-9\\_]+::getFieldsType\(\)#'
        $this->getFieldsType($questions, true)->shouldReturn($fields);
    }
}
