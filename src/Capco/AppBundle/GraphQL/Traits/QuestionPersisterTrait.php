<?php
namespace Capco\AppBundle\GraphQL\Traits;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\PersistentCollection;
use Symfony\Component\Form\FormInterface;

trait QuestionPersisterTrait
{
    public function persistQuestion(
        PersistentCollection $questionnaireAbstractQuestions,
        EntityManagerInterface $em,
        int $delta,
        ?array $questionsOrdered
    ): void {
        foreach ($questionnaireAbstractQuestions as $index => $abstractQuestion) {
            /** @var AbstractQuestion $abstractQuestion **/
            $question = $abstractQuestion->getQuestion();

            if (!empty($questionsOrdered)) {
                $newPosition = 0;
                // we use the temporary id to update the questions position
                foreach ($questionsOrdered as $key => $questionOrdered) {
                    if ($questionOrdered === $question->temporaryId) {
                        $newPosition = $key;
                    }
                }
                $abstractQuestion->setPosition($newPosition + $delta);
            } else {
                //no question existing in DB so we just have to set index value
                $abstractQuestion->setPosition($index);
            }

            if (!$question->getId()) {
                $em->persist($question);
            }
            if ($question instanceof MultipleChoiceQuestion) {
                foreach ($question->getChoices() as $key => $questionChoice) {
                    $questionChoice->setQuestion($question);
                    $questionChoice->setPosition($key);
                    $em->persist($questionChoice);
                }
            }
            $em->persist($abstractQuestion);
        }
    }

    //  Handle the update of the questions and some painful issues :
    //   - Positionning
    //   - Deleting/Updating QuestionChoice
    public function handleQuestions(
        FormInterface $form,
        $entity,
        array $arguments,
        string $type
    ): void {
        $questionsOrderedByBase = $form
            ->getData()
            ->getRealQuestions()
            ->toArray();

        $questionsOrderedByIdInDb = [];
        foreach ($questionsOrderedByBase as $question) {
            $questionsOrderedByIdInDb[] = $question->getId();
        }

        //we stock the order sent to apply it after
        $questionsOrderedById = [];
        // We need an array of questions ids from arguments
        $argumentsQuestionsId = [];

        foreach ($arguments['questions'] as $key => &$dataQuestion) {
            // we create a unique identifier for the question because new questions didn't have id
            $dataQuestion['question']['temporaryId'] = uniqid('', false);
            $questionsOrderedById[] = $dataQuestion['question']['temporaryId'];

            //we are updating a question
            if (isset($dataQuestion['question']['id'])) {
                $dataQuestionId = $dataQuestion['question']['id'];
                $argumentsQuestionsId[] = $dataQuestionId;

                $abstractQuestion = $this->abstractQuestionRepo->find($dataQuestionId);
                // If it's not a multiple choice question
                if (!$abstractQuestion instanceof MultipleChoiceQuestion) {
                    continue;
                }

                $dataQuestionChoicesIds = [];
                foreach ($dataQuestion['question']['choices'] as $key => $dataQuestionChoice) {
                    if (isset($dataQuestionChoice['id'])) {
                        $dataQuestionChoicesIds[] = $dataQuestionChoice['id'];
                    }
                }

                foreach ($abstractQuestion->getChoices() as $position => $questionChoice) {
                    if (!in_array($questionChoice->getId(), $dataQuestionChoicesIds)) {
                        $deletedChoice = [
                            'id' => $abstractQuestion->getId(),
                            'title' => null,
                        ];
                        array_splice($dataQuestion['question']['choices'], $position, 0, [
                            $deletedChoice,
                        ]);
                    }
                }
            }
        }

        // we must reorder arguments datas to match database order (used in the symfony form)
        usort($arguments['questions'], function ($a, $b) use ($questionsOrderedByIdInDb) {
            if (isset($a['question']['id'], $b['question']['id'])) {
                return array_search($a['question']['id'], $questionsOrderedByIdInDb) >
                    array_search($b['question']['id'], $questionsOrderedByIdInDb);
            }
            //@todo respect the user order, for now we just put new items at the end
            return isset($a['question']['id']) ? false : true;
        });

        foreach ($entity->getQuestions() as $position => $questionnaireQuestion) {
            if (!in_array($questionnaireQuestion->getQuestion()->getId(), $argumentsQuestionsId)) {
                // Put the title to null to be delete from delete_empty CollectionType field
                $deletedQuestion = [
                    'question' => [
                        'id' => $questionnaireQuestion->getQuestion()->getId(),
                        'type' => $questionnaireQuestion->getQuestion()->getType(),
                        'title' => null,
                    ],
                ];
                // Inject back the deleted question into the arguments question array
                array_splice($arguments['questions'], $position, 0, [$deletedQuestion]);
            }
        }

        $form->submit($arguments, false);
        $qaq = $entity->getQuestions();

        // We make sure a question position by questionnaire is unique
        if ($type === 'questionnaire') {
            $delta =
                $this->questionRepo->getCurrentMaxPositionForQuestionnaire($entity->getId()) + 1;
        } elseif ($type === 'proposal') {
            $delta =
                $this->questionRepo->getCurrentMaxPositionForProposalForm($entity->getId()) + 1;
        } else {
            $delta =
                $this->questionRepo->getCurrentMaxPositionForRegistrationForm($entity->getId()) + 1;
        }

        $this->persistQuestion($qaq, $this->em, $delta, $questionsOrderedById);
    }
}
