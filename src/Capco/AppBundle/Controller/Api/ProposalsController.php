<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Form\ReportingType;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ProposalsController extends FOSRestController
{
    /**
     * @Get("/proposals/{proposalId}/selections")
     * @ParamConverter("proposal", options={"mapping": {"proposalId": "id"}})
     * @View(serializerGroups={"Statuses", "SelectionStepId"})
     */
    public function getProposalSelectionsAction(Proposal $proposal)
    {
        return $proposal->getSelections();
    }

    /**
     * @Post("/proposals/{proposal_id}/reports")
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postProposalReportAction(Request $request, Proposal $proposal)
    {
        $viewer = $this->getUser();
        if (!$viewer || 'anon.' === $viewer || $viewer === $proposal->getAuthor()) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $report = (new Reporting())->setReporter($viewer)->setProposal($proposal);
        $form = $this->createForm(ReportingType::class, $report, ['csrf_protection' => false]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $this->getDoctrine()
            ->getManager()
            ->persist($report);
        $this->getDoctrine()
            ->getManager()
            ->flush();
        $this->get('capco.report_notifier')->onCreate($report);

        return $report;
    }
}
