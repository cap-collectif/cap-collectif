<?php

namespace Capco\AppBundle\GraphQL\Traits;

use Capco\MediaBundle\Entity\Media;
use Doctrine\ORM\PersistentCollection;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\Questionnaire;
use Symfony\Component\Form\FormInterface;
use Capco\AppBundle\Entity\QuestionChoice;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Repository\MultipleChoiceQuestionRepository;

trait QuestionPersisterTrait
{
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
                // decode GraphQL id to id
                $dataQuestion['question']['id'] = GlobalId::fromGlobalId(
                    $dataQuestion['question']['id']
                )['id'];
                $dataQuestionId = $dataQuestion['question']['id'];
                $argumentsQuestionsId[] = $dataQuestionId;

                $abstractQuestion = $this->abstractQuestionRepo->find($dataQuestionId);

                // If it's not a multiple choice question
                if (!$abstractQuestion instanceof MultipleChoiceQuestion) {
                    continue;
                }

                // Translate ids to GlobalId
                $dataQuestionChoicesIds = [];
                foreach ($dataQuestion['question']['choices'] as $key => &$dataQuestionChoice) {
                    if (isset($dataQuestionChoice['id'])) {
                        $dataQuestionChoicesIds[] = GlobalId::fromGlobalId(
                            $dataQuestionChoice['id']
                        )['id'];
                    }
                }

                // Mark as deleted every removed choice
                foreach ($abstractQuestion->getChoices() as $position => &$questionChoice) {
                    if (!\in_array($questionChoice->getId(), $dataQuestionChoicesIds, false)) {
                        $deletedChoice = [
                            'id' => GlobalId::toGlobalId(
                                'QuestionChoice',
                                $questionChoice->getId()
                            ),
                            'deleteMe' => true
                        ];
                        array_splice($dataQuestion['question']['choices'], $position, 0, [
                            $deletedChoice
                        ]);
                    }
                }
            }
        }

        // we must reorder arguments datas to match database order (used in the symfony form)
        usort($arguments['questions'], static function ($a, $b) use ($questionsOrderedByIdInDb) {
            if (isset($a['question']['id'], $b['question']['id'])) {
                return array_search($a['question']['id'], $questionsOrderedByIdInDb, false) >
                    array_search($b['question']['id'], $questionsOrderedByIdInDb, false);
            }

            //@todo respect the user order, for now we just put new items at the end
            return isset($a['question']['id']) ? false : true;
        });

        foreach ($entity->getQuestions() as $position => $questionnaireQuestion) {
            // Handle questions deletions
            /** @var AbstractQuestion $realQuestion */
            $realQuestion = $questionnaireQuestion->getQuestion();
            if (!\in_array($realQuestion->getId(), $argumentsQuestionsId, false)) {
                // Put the title to null to be delete from delete_empty CollectionType field
                $deletedQuestion = [
                    'question' => [
                        'id' => $realQuestion->getId(),
                        'type' => $realQuestion->getType(),
                        'title' => null
                    ]
                ];
                // Inject back the deleted question into the arguments question array
                array_splice($arguments['questions'], $position, 0, [$deletedQuestion]);
            }

            $questions = array_map(static function (array $question) {
                return $question['question'];
            }, $arguments['questions']);

            $realArgumentQuestion = array_reduce($questions, static function (
                ?array $acc,
                array $question
            ) use ($realQuestion) {
                if (isset($question['id']) && ((int) $question['id']) === $realQuestion->getId()) {
                    $acc = $question;
                }

                return $acc;
            });

            // Handle Question's logic jumps deletions
            if (isset($realArgumentQuestion['jumps'])) {
                $argumentsJumpsIds = array_map(static function (array $jump) {
                    return $jump['id'] ?? null;
                }, $realArgumentQuestion['jumps']);
                foreach ($realQuestion->getJumps() as $jumpPosition => $jump) {
                    // Handle jump deletion when a user delete a logic jump, and the conditions are handled automatically by
                    // doctrine by using the cascade remove and orphanRemoval=true
                    if (false === \in_array($jump->getId(), $argumentsJumpsIds, true)) {
                        $deletedJump = [
                            'id' => $jump->getId(),
                            'origin' => null,
                            'destination' => null
                        ];

                        // Inject back the deleted question's logic jump into the arguments question jumps array
                        array_splice(
                            $arguments['questions'][$position]['question']['jumps'],
                            $jumpPosition,
                            0,
                            [$deletedJump]
                        );
                    } elseif (isset($realArgumentQuestion['jumps'][$jumpPosition]['conditions'])) {
                        // Otherwise, we want to remove a condition in a logic jump
                        $argumentsJumpConditionsIds = array_map(static function (array $condition) {
                            return $condition['id'] ?? null;
                        }, $realArgumentQuestion['jumps'][$jumpPosition]['conditions']);
                        foreach ($jump->getConditions() as $conditionPosition => $condition) {
                            if (
                                false ===
                                \in_array($condition->getId(), $argumentsJumpConditionsIds, true)
                            ) {
                                $deletedJumpCondition = [
                                    'id' => $condition->getId(),
                                    'operator' => null
                                ];
                                // Inject back the deleted question's logic jump into the arguments question jumps array
                                array_splice(
                                    $arguments['questions'][$position]['question']['jumps'][
                                        $jumpPosition
                                    ]['conditions'],
                                    $conditionPosition,
                                    0,
                                    [$deletedJumpCondition]
                                );
                            }
                        }
                    }
                }
                // And we set manually question jumps position to keep the same order between the front-end and the back-end
                $arguments['questions'][$position]['question']['jumps'] = array_map(
                    static function (array $jump, $key) {
                        $jump['position'] = $key + 1;

                        return $jump;
                    },
                    $arguments['questions'][$position]['question']['jumps'],
                    array_keys($arguments['questions'][$position]['question']['jumps'])
                );

                foreach ($arguments['questions'][$position]['question']['jumps'] as &$jump) {
                    // We do the same things for a jump conditions list
                    if (isset($jump['conditions'])) {
                        $jump['conditions'] = array_map(
                            static function (array $condition, $key) {
                                $condition['position'] = $key + 1;
                                if (isset($condition['value'])) {
                                    $condition['value'] = GlobalId::fromGlobalId(
                                        $condition['value']
                                    )['id'];
                                }

                                return $condition;
                            },
                            $jump['conditions'],
                            array_keys($jump['conditions'])
                        );
                    }
                }
                unset($jump);
            }
        }

        try {
            $arguments['questions'] = array_map(static function (array $question) {
                if (isset($question['question']['choices'])) {
                    // delete duplicate choices
                    $question['question']['choices'] = \is_array($question['question']['choices'])
                        ? array_unique($question['question']['choices'], SORT_REGULAR)
                        : $question['question']['choices'];
                    foreach ($question['question']['choices'] as &$choice) {
                        // We need to check if the choice id is null in which case we cannot retrieve from a global Id
                        // If we use a global id for the Question Entity we will need to fix this part of code
                        if (
                            isset($choice['id']) &&
                            '' !== $choice['id'] &&
                            (int) $question['question']['id'] !== $choice['id']
                        ) {
                            $choice['id'] = GlobalId::fromGlobalId($choice['id'])['id'];
                        }
                    }
                }

                return $question;
            }, $arguments['questions']);

            $form->submit($arguments, false);
        } catch (\RuntimeException $exception) {
            $this->logger->error(
                __METHOD__ .
                    ' : ' .
                    $exception->getMessage() .
                    var_export($form->getExtraData(), true)
            );
        }

        /** @var $entity Questionnaire */
        $qaq = $entity->getQuestions();

        // We make sure a question position by questionnaire is unique
        if ('questionnaire' === $type) {
            $delta =
                $this->questionRepo->getCurrentMaxPositionForQuestionnaire($entity->getId()) + 1;
        } elseif ('proposal' === $type) {
            $delta =
                $this->questionRepo->getCurrentMaxPositionForProposalForm($entity->getId()) + 1;
        } else {
            $delta =
                $this->questionRepo->getCurrentMaxPositionForRegistrationForm($entity->getId()) + 1;
        }

        $this->persistQuestions(
            $qaq,
            $this->em,
            $delta,
            $questionsOrderedById,
            $arguments['questions']
        );
    }

    public function persistQuestions(
        PersistentCollection $questionnaireAbstractQuestions,
        EntityManagerInterface $em,
        int $delta,
        ?array $questionsOrdered,
        array $argumentsQuestions
    ): void {
        foreach ($questionnaireAbstractQuestions as $index => $abstractQuestion) {
            /** @var AbstractQuestion $abstractQuestion * */
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
                // no question existing in DB so we just have to set index value
                $abstractQuestion->setPosition($index);
            }

            if (!$question->getId()) {
                $em->persist($question);
            }
            if ($question instanceof MultipleChoiceQuestion) {
                $this->persistQuestionMultiChoice($question, $em, $argumentsQuestions, $index);
            }

            $em->persist($abstractQuestion);
        }
    }

    private function persistQuestionMultiChoice(
        MultipleChoiceQuestion $question,
        EntityManagerInterface $em,
        array $argumentsQuestions,
        int $index
    ) {
        $choicesData = $argumentsQuestions[$index]['question']['choices'];
        $choices = $question->getChoices();
        if (
            isset($argumentsQuestions[$index]['question']['validationRule']) &&
            empty($argumentsQuestions[$index]['question']['validationRule'])
        ) {
            $question->setValidationRule(null);
        }

        foreach ($choicesData as $choiceData) {
            $choice = null;
            if (isset($choiceData['id'])) {
                // Do not use `array_filter` because we are dealing with HUGE data
                // and we want to stop right after the element is found.
                foreach ($choices as $currentChoice) {
                    if ($currentChoice->getId() === $choiceData['id']) {
                        $choice = $currentChoice;

                        break;
                    }
                }
                if (!$choice) {
                    throw new \RuntimeException('Choice not found, this should never happen.', 1);
                }
                if (isset($choiceData['deleteMe'])) {
                    $question->removeChoice($choice);

                    continue;
                }
            } else {
                $choice = new QuestionChoice();
                $question->addChoice($choice);
            }
            $choice->setTitle($choiceData['title']);
            if (isset($choiceData['description'])) {
                $choice->setDescription($choiceData['description']);
            }

            if (isset($choiceData['color'])) {
                $choice->setColor($choiceData['color']);
            }
            if (isset($choiceData['image'])) {
                $image = null;
                if (null !== $choiceData['image']) {
                    $image = $em->getRepository(Media::class)->find($choiceData['image']);
                }
                $choice->setImage($image);
            }
        }
        foreach ($question->getChoices() as $key => $questionChoice) {
            $questionChoice->setQuestion($question);
            $questionChoice->setPosition($key);
            $em->persist($questionChoice);
        }
    }

    private function getQuestionChoicesValues(string $questionnableId): array
    {
        /** @var MultipleChoiceQuestionRepository $choiceRepo */
        $choiceRepo = $this->choiceQuestionRepository;
        $updatedMultipleChoiceQuestions = $choiceRepo->findMultipleChoiceQuestionsByQuestionable(
            $questionnableId
        );
        $choices = [];
        /** @var MultipleChoiceQuestion $question */
        foreach ($updatedMultipleChoiceQuestions as $question) {
            foreach ($question->getChoices() as $choice) {
                $choices[] = $choice->getId();
            }
        }

        return $choices;
    }

    private function indexQuestionChoicesValues(array $questionChoices): void
    {
        foreach ($questionChoices as $choice) {
            $this->indexer->index(QuestionChoice::class, $choice);
        }

        $this->indexer->finishBulk();
    }
}
