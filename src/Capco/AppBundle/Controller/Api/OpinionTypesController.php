<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\OpinionType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use JMS\Serializer\SerializationContext;

class OpinionTypesController extends FOSRestController
{
    /**
     * Get an opinionType.
     *
     * @Get("/opinion_types/{id}")
     * @ParamConverter("opinionType", options={"mapping": {"id": "id"}})
     * @View(statusCode=200, serializerGroups={"OpinionTypeDetails", "OpinionTypeLinks"})
     */
    public function getOpinionTypeAction(OpinionType $opinionType)
    {
        return $opinionType;
    }
}
