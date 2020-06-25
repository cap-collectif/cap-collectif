<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Steps\CollectStep;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;

class StatusesController extends AbstractFOSRestController
{
    /**
     * Get statuses.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get statuses",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when statuses are not found",
     *  }
     * )
     *
     * @Get("/collect_steps/{collectStepId}/statuses")
     * @Entity("collectStep", options={"mapping": {"collectStepId": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=200, serializerGroups={"Statuses"})
     */
    public function getStatusesAction(CollectStep $collectStep)
    {
        return $collectStep->getStatuses();
    }
}
