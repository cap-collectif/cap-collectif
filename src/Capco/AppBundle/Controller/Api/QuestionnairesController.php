<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Questionnaire;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;

class QuestionnairesController extends FOSRestController
{
    /**
     * @ApiDoc(
     *  resource=true,
     *  description="Get a questionnaire",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion is not found",
     *  }
     * )
     * @Get("/questionnaires/{id}")
     * @ParamConverter("questionnaire", options={"mapping": {"id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=200, serializerGroups={"Questionnaires", "Questions"})
     * @Cache(smaxage="120", public=true)
     */
    public function getQuestionnaireAction(Questionnaire $questionnaire)
    {
        return $questionnaire;
    }

    /**
     * @Get("/questionnaires-stats")
     * @View(statusCode=200)
     */
    public function getQuestionnairesStatsAction()
    {
        $questionnaires = $this->getDoctrine()->getManager()
             ->getRepository('CapcoAppBundle:Questionnaire')
             ->findAll()
        ;
        $results = [];
        foreach ($questionnaires as $questionnaire) {
            $questions = $questionnaire->getRealQuestions();
            $rankingQuestions = [];
            $choiceQuestions = [];
            $multipleQuestions = [];
            foreach ($questions as $question) {
                $type = $question->getInputType();
                if ($type === 'ranking') {
                    $rankingQuestions[] = $question;
                }
                if ($type === 'radio' || $type === 'select') {
                    $choiceQuestions[] = $question;
                }
                if ($type === 'checkbox') {
                    $multipleQuestions[] = $question;
                }
            }
            foreach ($rankingQuestions as $rakingQuestion) {
                $questionChoices = $rakingQuestion->getQuestionChoices();
                $choices = $questionChoices->map(function ($choice) {
                    return $choice->getTitle();
                })->toArray();
                $scores = array_combine($choices, array_map(function ($h) {
                    return 0;
                }, $choices));
                foreach ($rakingQuestion->getResponses() as $response) {
                    $reply = $response->getReply();
                    if ($reply && $reply->isEnabled() && !$reply->isExpired()) {
                      // The score is the maximum number of choices for the question
                      // 4 replies gives 4 3 2 1 points
                      // 2 replies with maximum 4 gives 4 3 points
                      $score = $rakingQuestion->getValidationRule()
                        ? $rakingQuestion->getValidationRule()->getNumber()
                        : $rakingQuestion->getQuestionChoices()->count()
                      ;
                        foreach ($response->getValue()['labels'] as $label) {
                            $scores[$label] += $score;
                            --$score;
                        }
                    }
                }
                $results[] = [
              'questionnaire_id' => $questionnaire->getId(),
              'question_title' => $rakingQuestion->getTitle(),
              'scores' => $scores,
            ];
            }
            foreach ($multipleQuestions as $multipleQuestion) {
                $questionChoices = $multipleQuestion->getQuestionChoices();
                $choices = $questionChoices->map(function ($choice) {
                    return $choice->getTitle();
                })->toArray();
                $scores = array_combine($choices, array_map(function ($h) {
                    return 0;
                }, $choices));
                foreach ($multipleQuestion->getResponses() as $response) {
                    $reply = $response->getReply();
                    if ($reply && $reply->isEnabled() && !$reply->isExpired()) {
                        foreach ($response->getValue()['labels'] as $label) {
                            $scores[$label] += 1;
                        }
                    }
                }
                $results[] = [
              'questionnaire_id' => $questionnaire->getId(),
              'question_title' => $multipleQuestion->getTitle(),
              'scores' => $scores,
            ];
            }
            foreach ($choiceQuestions as $choiceQuestion) {
                $choices = $choiceQuestion->getQuestionChoices()->map(function ($choice) {
                    return $choice->getTitle();
                })->toArray();
                $scores = array_combine($choices, array_map(function ($h) {
                    return 0;
                }, $choices));
                foreach ($choiceQuestion->getResponses() as $response) {
                    $reply = $response->getReply();
                    if ($reply && $reply->isEnabled() && !$reply->isExpired()) {
                        foreach ($response->getValue()['labels'] as $label) {
                            $scores[$label] += 1;
                        }
                    }
                }
                $results[] = [
                'questionnaire_id' => $questionnaire->getId(),
                'question_title' => $choiceQuestion->getTitle(),
                'scores' => $scores,
              ];
            }
        }

        return $results;
    }
}
