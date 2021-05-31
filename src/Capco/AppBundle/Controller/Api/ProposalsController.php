<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\AbstractFOSRestController;

class ProposalsController extends AbstractFOSRestController
{
    /**
     * @Get("/proposals/{proposalId}/selections")
     * @View(serializerGroups={"Statuses", "SelectionStepId"})
     */
    public function getProposalSelectionsAction(string $proposalId)
    {
        $proposal = $this->get(GlobalIdResolver::class)->resolve($proposalId, $this->getUser());

        return $proposal->getSelections();
    }
}
