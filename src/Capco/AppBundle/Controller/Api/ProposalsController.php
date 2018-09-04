<?php
namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Event\CommentChangedEvent;
use Capco\AppBundle\Form\CommentType;
use Capco\AppBundle\Form\ReportingType;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\Form\Form;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class ProposalsController extends FOSRestController
{
    /**
     * @Get("/proposal_forms/{proposal_form_id}/proposals/{proposal_id}")
     */
    public function getProposalAction()
    {
        throw new BadRequestHttpException('Not supported anymore, use GraphQL API instead.');
    }

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
     * @Security("has_role('ROLE_USER')")
     * @Post("/proposal_forms/{proposal_form_id}/proposals")
     * @ParamConverter("proposalForm", options={"mapping": {"proposal_form_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(statusCode=201, serializerGroups={"ProposalForms", "Proposals", "UsersInfos", "UserMedias"})
     */
    public function postProposalAction(Request $request, ProposalForm $proposalForm)
    {
        throw new BadRequestHttpException(
            'Not supported anymore, use GraphQL mutation "createProposal" instead.'
        );
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/proposal_forms/{proposal_form_id}/proposals/{proposal_id}")
     * @ParamConverter("proposalForm", options={"mapping": {"proposal_form_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=200)
     */
    public function putProposalAction(
        Request $request,
        ProposalForm $proposalForm,
        Proposal $proposal
    ) {
        throw new BadRequestHttpException(
            'Not supported anymore, use GraphQL mutation "changeProposalContent" instead.'
        );
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/proposals/{proposal_id}/reports")
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postProposalReportAction(Request $request, Proposal $proposal)
    {
        if ($this->getUser() === $proposal->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        $report = (new Reporting())->setReporter($this->getUser())->setProposal($proposal);
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
