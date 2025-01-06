<?php

namespace Capco\AdminBundle\Controller;

use Box\Spout\Common\Type;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Resolver\ProposalResolver;
use Capco\AppBundle\Security\ProposalVoter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ProposalController extends CRUDController
{
    /**
     * @Security("is_granted('ROLE_ADMIN')")
     * @Route("/admin/capco/app/proposal/{proposalId}/download/followers/{_format}",
     *     requirements={
     *         "_format": "csv|xlsx",
     *     }, name="capco_admin_proposal_download_followers", options={"i18n" = false})
     * @Entity("proposal", options={"mapping": {"proposalId": "id"}})
     */
    public function downloadFollowerOfProposalAction(
        Request $request,
        Proposal $proposal,
        string $_format
    ): Response {
        $followerResolver = $this->get(ProposalResolver::class);

        $export = $followerResolver->exportProposalFollowers($proposal, $_format);
        $filename = $export['filename'];
        $absolutePath = $export['absolutePath'];

        $contentType = 'text/csv';
        if (TYPE::XLSX === $_format) {
            $contentType = 'application/vnd.ms-excel';
        }

        $response = $this->file($absolutePath, $filename);
        $response->headers->set('Content-Type', $contentType . '; charset=utf-8');

        return $response;
    }

    public function editAction(Request $request): Response
    {
        $this->throwIfNoAccess();

        return parent::editAction($request);
    }

    private function throwIfNoAccess()
    {
        if (!$this->isGranted(ProposalVoter::EDIT, $this->admin->getSubject())) {
            throw $this->createAccessDeniedException();
        }
    }
}
