<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\ProposalForm;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Request\ParamFetcherInterface;
use FOS\RestBundle\Util\Codes;

class ProposalFormsController extends FOSRestController
{
    /**
     * Get a proposal form.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get a proposal form",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion is not found",
     *  }
     * )
     *
     * @Get("/proposal_forms/{id}")
     * @ParamConverter("proposalForm", options={"mapping": {"id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(statusCode=200, serializerGroups={"ProposalForms", "ProposalResponses", "Questions"})
     * @param ProposalForm $proposalForm
     * @return array
     */
    public function getProposalFormAction(ProposalForm $proposalForm)
    {
        return $proposalForm;
    }
}
