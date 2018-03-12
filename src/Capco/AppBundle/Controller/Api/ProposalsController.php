<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Event\CommentChangedEvent;
use Capco\AppBundle\Form\CommentType;
use Capco\AppBundle\Form\ReportingType;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\Form\Form;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProposalsController extends FOSRestController
{
    /**
     * @ApiDoc(
     *  resource=true,
     *  description="Get a proposal",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion is not found",
     *  }
     * )
     *
     * @Get("/proposal_forms/{proposal_form_id}/proposals/{proposal_id}")
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=200, serializerGroups={"Proposals", "ProposalFusions", "UsersInfos", "UserMedias", "ThemeDetails", "ProposalUserData", "Steps"})
     */
    public function getProposalAction(Proposal $proposal)
    {
        return [
            'proposal' => $proposal,
        ];
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
        throw new BadRequestHttpException('Not supported anymore, use GraphQL mutation "createProposal" instead.');
    }

    /**
     * @Get("/proposal_forms/{form}/proposals/{proposal}/comments")
     * @ParamConverter("form", options={"mapping": {"form": "id"}})
     * @ParamConverter("proposal", options={"mapping": {"proposal": "id"}})
     * @QueryParam(name="offset", requirements="[0-9.]+", default="0")
     * @QueryParam(name="limit", requirements="[0-9.]+", default="10")
     * @QueryParam(name="filter", requirements="(old|last|popular)", default="last")
     * @View(serializerGroups={"Comments", "UsersInfos"})
     */
    public function getProposalCommentsAction(ProposalForm $form, Proposal $proposal, ParamFetcherInterface $paramFetcher)
    {
        $offset = $paramFetcher->get('offset');
        $limit = $paramFetcher->get('limit');
        $filter = $paramFetcher->get('filter');

        $paginator = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:ProposalComment')
                    ->getEnabledByProposal($proposal, $offset, $limit, $filter);

        $comments = [];
        foreach ($paginator as $comment) {
            $comments[] = $comment;
        }

        $countWithAnswers = $this->getDoctrine()->getManager()
                      ->getRepository('CapcoAppBundle:ProposalComment')
                      ->countCommentsAndAnswersEnabledByProposal($proposal);

        return [
            'commentsAndAnswersCount' => (int) $countWithAnswers,
            'commentsCount' => count($paginator),
            'comments' => $comments,
        ];
    }

    /**
     * @Post("/proposal_forms/{form}/proposals/{proposal}/comments")
     * @ParamConverter("form", options={"mapping": {"form": "id"}})
     * @ParamConverter("proposal", options={"mapping": {"proposal": "id"}})
     * @View(statusCode=201, serializerGroups={"Comments", "UsersInfos"})
     */
    public function postProposalCommentsAction(Request $request, ProposalForm $form, Proposal $proposal)
    {
        if (!$proposal->canComment()) {
            throw new BadRequestHttpException('You can not comment this proposal.');
        }

        $user = $this->getUser();

        $comment = (new ProposalComment())
            ->setAuthorIp($request->getClientIp())
            ->setAuthor($user)
            ->setProposal($proposal)
            ->setIsEnabled(true)
        ;

        $form = $this->createForm(new CommentType($user), $comment);
        $form->handleRequest($request);

        if (!$form->isValid()) {
            return $form;
        }

        $parent = $comment->getParent();

        if ($parent) {
            if (!$parent instanceof ProposalComment || $proposal !== $parent->getProposal()) {
                throw $this->createNotFoundException('This parent comment is not linked to this proposal');
            }

            if ($parent->getParent()) {
                throw new BadRequestHttpException('You can\'t answer the answer of a comment.');
            }
        }

        $proposal->setCommentsCount($proposal->getCommentsCount() + 1);
        $em = $this->getDoctrine()->getManager();
        $em->persist($comment);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());
        $this->get('event_dispatcher')->dispatch(
            CapcoAppBundleEvents::COMMENT_CHANGED,
            new CommentChangedEvent($comment, 'add')
        );
    }

    /**
     * @Get("/steps/{step}/proposals/{proposal}/votes")
     * @ParamConverter("step", options={"mapping": {"step": "id"}})
     * @ParamConverter("proposal", options={"mapping": {"proposal": "id"}})
     * @View(serializerGroups={"ProposalSelectionVotes", "UsersInfos", "UserMedias", "ProposalCollectVotes"})
     */
    public function getAllProposalVotesAction(AbstractStep $step, Proposal $proposal)
    {
        switch (true) {
            case $step instanceof CollectStep:
                $votes = $this->getDoctrine()->getRepository(ProposalCollectVote::class)->getVotesForProposalByStepId($proposal, $step->getId());
                break;
            case $step instanceof SelectionStep:
                $votes = $this->getDoctrine()->getRepository(ProposalSelectionVote::class)->getVotesForProposalByStepId($proposal, $step->getId());
                break;
            default:
                throw new NotFoundHttpException();
        }

        return [
            'votes' => $votes,
            'count' => count($votes),
        ];
    }

    /**
     * @Get("/proposals/{proposal}/posts")
     * @ParamConverter("proposal", options={"mapping": {"proposal": "id"}})
     * @View(serializerGroups={"Posts", "PostDetails", "UsersInfos", "UserMedias", "Themes"})
     * @Cache(smaxage="60", public=true)
     */
    public function getProposalPostsAction(Proposal $proposal)
    {
        $posts = $this->get('capco.blog.post.repository')->getPublishedPostsByProposal($proposal);

        return [
            'posts' => $posts,
        ];
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/proposal_forms/{proposal_form_id}/proposals/{proposal_id}")
     * @ParamConverter("proposalForm", options={"mapping": {"proposal_form_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=200)
     */
    public function putProposalAction(Request $request, ProposalForm $proposalForm, Proposal $proposal)
    {
        throw new BadRequestHttpException('Not supported anymore, use GraphQL mutation "changeProposalContent" instead.');
    }

    /**
     * Delete a proposal.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Delete a proposal",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when proposal is not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Delete("/proposal_forms/{proposal_form_id}/proposals/{proposal_id}")
     * @ParamConverter("proposalForm", options={"mapping": {"proposal_form_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=204)
     */
    public function deleteProposalAction(ProposalForm $proposalForm, Proposal $proposal)
    {
        if ($this->getUser() !== $proposal->getAuthor()) {
            throw new BadRequestHttpException('You are not the author of this proposal');
        }

        $this->get('capco.mutation.proposal')->delete($proposal->getId());

        return [];
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

        $report = (new Reporting())
            ->setReporter($this->getUser())
            ->setProposal($proposal)
        ;

        $form = $this->createForm(new ReportingType(), $report, ['csrf_protection' => false]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $this->getDoctrine()->getManager()->persist($report);
        $this->getDoctrine()->getManager()->flush();
        $this->get('capco.notify_manager')->sendNotifyMessage($report);

        return $report;
    }
}
