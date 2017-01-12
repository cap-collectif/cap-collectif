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
     * Get a questionnaire.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get a questionnaire",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion is not found",
     *  }
     * )
     *
     * @Get("/questionnaires/{id}")
     * @ParamConverter("questionnaire", options={"mapping": {"id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=200, serializerGroups={"Questionnaires", "Questions"})
     * @Cache(smaxage="120", public=true)
     *
     * @param Questionnaire $questionnaire
     *
     * @return array
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
            foreach ($questions as $question) {
                if ($question->getInputType() === 'ranking') {
                    $rankingQuestions[] = $question;
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
                    $score = count($response->getValue()['labels']);
                    foreach ($response->getValue()['labels'] as $label) {
                        $scores[$label] += $score;
                        --$score;
                    }
                }
                $results[] = [
              'questionnaire_id' => $questionnaire->getId(),
              'question_title' => $rakingQuestion->getTitle(),
              'scores' => $scores,
            ];
            }
        }

        return $results;
    }
}
