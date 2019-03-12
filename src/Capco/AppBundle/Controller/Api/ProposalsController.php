<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Form\ReportingType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Notifier\ReportNotifier;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ProposalsController extends FOSRestController
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

    /**
     * @Post("/proposals/{proposalId}/reports")
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postProposalReportAction(Request $request, string $proposalId)
    {
        $viewer = $this->getUser();
        $proposal = $this->get(GlobalIdResolver::class)->resolve($proposalId, $this->getUser());

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
        $this->get(ReportNotifier::class)->onCreate($report);

        return $report;
    }
}
