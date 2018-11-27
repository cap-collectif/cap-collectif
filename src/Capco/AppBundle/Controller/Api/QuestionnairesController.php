<?php
namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Questionnaire;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;

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
        $questionnaires = $this->get('capco.questionnaire.repository')->findAll();
        $results = [];
        foreach ($questionnaires as $questionnaire) {
            $questions = $questionnaire->getRealQuestions();
            $questionsResults = [];
            foreach ($questions as $question) {
                $scores = [];
                $type = $question->getInputType();
                if ('ranking' === $type) {
                    $questionChoices = $question->getChoices();
                    $choices = $questionChoices
                        ->map(function ($choice) {
                            return $choice->getTitle();
                        })
                        ->toArray();
                    $scores = array_combine(
                        $choices,
                        array_map(function ($h) {
                            return 0;
                        }, $choices)
                    );
                    foreach ($question->getResponses() as $response) {
                        $reply = $response->getReply();
                        $responseValue = $response->getValue();
                        if ($reply && $responseValue && $reply->isPublished()) {
                            // The score is the maximum number of choices for the question
                            // 4 replies gives 4 3 2 1 points
                            // 2 replies with maximum 4 gives 4 3 points
                            $score = $question->getValidationRule()
                                ? $question->getValidationRule()->getNumber()
                                : $question->getChoices()->count();
                            foreach ($responseValue['labels'] as $label) {
                                $scores[$label] += $score;
                                --$score;
                            }
                        }
                    }
                }
                if ('radio' === $type || 'select' === $type || 'checkbox' === $type) {
                    $choices = $question
                        ->getChoices()
                        ->map(function ($choice) {
                            return $choice->getTitle();
                        })
                        ->toArray();
                    $scores = array_combine(
                        $choices,
                        array_map(function ($h) {
                            return 0;
                        }, $choices)
                    );
                    foreach ($question->getResponses() as $response) {
                        $reply = $response->getReply();
                        $responseValue = $response->getValue();
                        if ($reply && $responseValue && $reply->isPublished()) {
                            if (\is_string($responseValue)) {
                                ++$scores[$responseValue];
                            } else {
                                foreach ($responseValue['labels'] as $label) {
                                    ++$scores[$label];
                                }
                            }
                        }
                    }
                }
                $data = [
                    'question_title' => $question->getTitle(),
                    'question_id' => $question->getId(),
                    'question_type' => $question->getInputType(),
                ];
                if (\count($scores) > 0) {
                    $data['scores'] = $scores;
                }
                $questionsResults[] = $data;
            }
            $results[] = [
                'questionnaire_id' => $questionnaire->getId(),
                'questionnaire_title' => $questionnaire->getTitle(),
                'questions' => $questionsResults,
            ];
        }

        return $results;
    }
}
