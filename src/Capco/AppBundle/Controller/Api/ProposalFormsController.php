<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Form\ProposalFormCreateType;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;

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
     * @View(statusCode=200, serializerGroups={"ProposalForms", "Questions", "Districts"})
     */
    public function getProposalFormAction(ProposalForm $proposalForm)
    {
        return $proposalForm;
    }

    /**
     * @Put("/proposal_forms")
     * @Security("has_role('ROLE_ADMIN')")
     * @View(statusCode=201, serializerGroups={"ProposalForms", "Questions"})
     */
    public function putProposalFormAction(Request $request)
    {
        $proposalForm = new ProposalForm();

        $form = $this->createForm(ProposalFormCreateType::class, $proposalForm);

        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $em = $this->getDoctrine()->getManager();
        $em->persist($proposalForm);
        $em->flush();

        return $proposalForm;
    }
}
