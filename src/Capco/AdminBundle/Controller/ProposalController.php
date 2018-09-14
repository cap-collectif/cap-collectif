<?php
namespace Capco\AdminBundle\Controller;

use Box\Spout\Common\Type;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Resolver\ProposalResolver;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

class ProposalController extends CRUDController
{
    /**
     * @Security("has_role('ROLE_ADMIN')")
     * @Route("/admin/capco/app/proposal/{proposalId}/download/followers/{_format}",
     *     requirements={
     *         "_format": "csv|xlsx",
     *     }, name="capco_admin_proposal_download_followers")
     * @ParamConverter("proposal", options={"mapping": {"proposalId": "id"}})
     */
    public function downloadFollowerOfProposalAction(
        Request $request,
        Proposal $proposal,
        string $_format
    ): Response {
        $followerResolver = $this->get(ProposalResolver::class);

        $export = $followerResolver->exportProposalFollowers($proposal, $_format);
        $filename = $export['filename'];
        $content = $export['content'];

        $contentType = 'text/csv';
        if (TYPE::XLSX === $_format) {
            $contentType = 'application/vnd.ms-excel';
        }

        $request->headers->set('X-Sendfile-Type', 'X-Accel-Redirect');
        $response = new Response($content);
        $disposition = $response->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $filename
        );

        $response->headers->set('Content-Disposition', $disposition);
        $response->headers->set('Content-Type', $contentType . '; charset=utf-8');
        $response->headers->set('Pragma', 'public');
        $response->headers->set('Cache-Control', 'maxage=1');

        return $response;
    }
}
