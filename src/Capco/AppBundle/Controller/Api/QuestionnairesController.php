<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Questionnaire;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;

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
     *
     * @param Questionnaire $questionnaire
     *
     * @return array
     */
    public function getQuestionnaireAction(Questionnaire $questionnaire)
    {
        return $questionnaire;
    }
}
