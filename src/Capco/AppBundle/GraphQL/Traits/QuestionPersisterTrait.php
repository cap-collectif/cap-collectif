<?php
namespace Capco\AppBundle\GraphQL\Traits;

use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
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
                // we use the temporary id to update the questions position
                foreach ($questionsOrdered as $key => $questionOrdered) {
                    if ($questionOrdered === $question->getTemporaryId()) {
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
}
