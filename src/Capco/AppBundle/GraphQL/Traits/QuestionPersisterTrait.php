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
}
