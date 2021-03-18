<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Steps\CollectStep;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;

class StatusesController extends AbstractFOSRestController
{
    /**
     * Get statuses.
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
