<?php
namespace Capco\AppBundle\GraphQL\Traits;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Entity\RegistrationForm;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\PersistentCollection;

trait QuestionPersisterTrait
{
    public function persistQuestion(
        PersistentCollection $questionnaireAbstractQuestions,
        EntityManagerInterface $em,
        int $delta,
        ?array $questionsOrdered
    ): void {
        foreach ($questionnaireAbstractQuestions as $index => $abstractQuestion) {
            $question = $abstractQuestion->getQuestion();
            if (!empty($questionsOrdered)) {
                $newPosition = 0;
                foreach ($questionsOrdered as $key => $questionOrdered) {
                    //it compare string to int
                    if ($questionOrdered == $question->getId()) {
                        $newPosition = $key;
                    } elseif (trim($questionOrdered) === $question->getTitle()) {
                        //if the question is not in db, she doesn't have id
                        $newPosition = $key;
                    }
                }

                $abstractQuestion->setPosition($newPosition + $delta);
            } else {
                //no previous question so we just put the index
                $abstractQuestion->setPosition($index);
            }

            if (!$question->getId()) {
                $em->persist($question);
            }
            if ($question instanceof MultipleChoiceQuestion) {
                foreach ($question->getQuestionChoices() as $key => $questionChoice) {
                    $questionChoice->setQuestion($question);
                    $questionChoice->setPosition($key);
                    $em->persist($questionChoice);
                }
            }
            $em->persist($abstractQuestion);
        }
    }

    private function handleQuestionsPersisting($form, $questionsOrderedById): void
    {
        $qaq = $form->getQuestions();

        // We make sure a question position by questionnaire is unique
        if($form instanceof ProposalForm) {
            $delta =
                $this->questionRepo->getCurrentMaxPositionForProposalForm($form->getId()) +
                1;
        } elseif ($form instanceof RegistrationForm) {
            $delta =
                $this->questionRepo->getCurrentMaxPositionForRegistrationForm($form->getId()) +
                1;
        }

        $this->persistQuestion($qaq, $this->em, $delta, $questionsOrderedById);
    }

    private function handleQuestions($questions, $arguments, &$dataQuestion, $form, &$questionsOrderedById): void
    {

        $questionsOrderedByIdInDb = [];
        foreach ($questions as $question) {
            $questionsOrderedByIdInDb[] = $question->getId();
        }

        //we stock the order sent to apply it after
        $questionsOrderedById = [];
        // We need an array of questions ids from arguments
        $argumentsQuestionsId = [];
        foreach ($arguments['questions'] as $key => &$dataQuestion) {
            //we are updating a question
            if (isset($dataQuestion['question']['id'])) {
                $dataQuestionId = $dataQuestion['question']['id'];
                $questionsOrderedById[] = $dataQuestionId;
                $argumentsQuestionsId[] = $dataQuestionId;

                $abstractQuestion = $this->abstractQuestionRepo->find($dataQuestionId);
                // If it's not a multiple choice question
                if (!$abstractQuestion instanceof MultipleChoiceQuestion) {
                    continue;
                }

                $dataQuestionChoicesIds = [];
                foreach (
                    $dataQuestion['question']['questionChoices']
                    as $key => $dataQuestionChoice
                ) {
                    if (isset($dataQuestionChoice['id'])) {
                        $dataQuestionChoicesIds[] = $dataQuestionChoice['id'];
                    }
                }

                foreach (
                    $abstractQuestion->getQuestionChoices()
                    as $position => $questionChoice
                ) {
                    if (!in_array($questionChoice->getId(), $dataQuestionChoicesIds)) {
                        $deletedChoice = [
                            'id' => $abstractQuestion->getId(),
                            'title' => null,
                        ];
                        array_splice(
                            $dataQuestion['question']['questionChoices'],
                            $position,
                            0,
                            [$deletedChoice]
                        );
                    }
                }
            } else {
                //creating a question
                $questionsOrderedById[] = $dataQuestion['question']['title'];
            }
        }

        // we must reorder arguments datas to match database order (used in the symfony form)
        usort($arguments['questions'], function ($a, $b) use ($questionsOrderedByIdInDb) {
            if (isset($a['question']['id'], $b['question']['id'])) {
                return array_search($a['question']['id'], $questionsOrderedByIdInDb) >
                    array_search($b['question']['id'], $questionsOrderedByIdInDb);
            }
            //respect the user order, for now we just put new items at the end
            return isset($a['question']['id']) ? false : true;
        });

        foreach ($form->getQuestions() as $position => $proposalFormQuestion) {
            if (
            !in_array($proposalFormQuestion->getQuestion()->getId(), $argumentsQuestionsId)
            ) {
                // Put the title to null to be delete from delete_empty CollectionType field
                $deletedQuestion = [
                    'question' => [
                        'id' => $proposalFormQuestion->getQuestion()->getId(),
                        'type' => $proposalFormQuestion->getQuestion()->getType(),
                        'title' => null,
                    ],
                ];
                // Inject back the deleted question into the arguments question array
                array_splice($arguments['questions'], $position, 0, [$deletedQuestion]);
            }
        }
    }

}
