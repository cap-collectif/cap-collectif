<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Synthesis\Synthesis;
use FOS\RestBundle\Controller\FOSRestController;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;

use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;

class SynthesisController extends FOSRestController
{
    /**
     * Get a synthesis by id
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get the synthesis with all elements",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Synthesis does not exist",
     *  }
     * )
     *
     * @Get("/api/synthesis/{id}")
     * @ParamConverter("synthesis", options={"mapping": {"id": "id"}})
     * @View(serializerGroups={"Default"})
     */
    public function getSynthesisAction(Synthesis $synthesis)
    {
        dump($synthesis);
        return $synthesis;
    }
}