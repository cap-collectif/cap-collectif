<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Form\ProposalType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\Form\Form;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
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
use Capco\AppBundle\Form\CommentType;
use Capco\AppBundle\Event\AbstractCommentChangedEvent;

class ProposalsController extends FOSRestController
{
    /**
     * Get all proposals for a proposal form.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get all proposals for a proposal form",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion is not found",
     *  }
     * )
     *
     * @Get("/proposal_forms/{proposal_form_id}/proposals")
     * @ParamConverter("proposalForm", options={"mapping": {"proposal_form_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=200, serializerGroups={"Proposals", "ProposalResponses", "UsersInfos", "UserMedias"})
     *
     * @param ProposalForm $proposalForm
     *
     * @return array
     */
    public function getProposalsAction(ProposalForm $proposalForm)
    {
        return $proposalForm->getProposals();
    }

    /**
     * Get a proposal.
     *
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
     * @ParamConverter("proposalForm", options={"mapping": {"proposal_form_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=200, serializerGroups={"Proposals", "ProposalResponses", "UsersInfos", "UserMedias"})
     *
     * @param ProposalForm $proposalForm
     * @param Proposal     $proposal
     *
     * @return array
     */
    public function getProposalAction(ProposalForm $proposalForm, Proposal $proposal)
    {
        return $proposal;
    }

    /**
     * Add a proposal.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Post a proposal",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    401 = "Proposal does not exist",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Post("/proposal_forms/{proposal_form_id}/proposals")
     * @ParamConverter("proposalForm", options={"mapping": {"proposal_form_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(statusCode=201, serializerGroups={"ProposalForms", "Proposals", "ProposalResponses", "UsersInfos", "UserMedias"})
     *
     * @param Request      $request
     * @param ProposalForm $proposalForm
     *
     * @return Form
     */
    public function postProposalAction(Request $request, ProposalForm $proposalForm)
    {
        $user = $this->getUser();

        $proposal = (new Proposal())
            ->setAuthor($user)
            ->setProposalForm($proposalForm)
            ->setEnabled(true)
        ;

        $form = $this->createForm(new ProposalType(), $proposal);
        $form->handleRequest($request);

        if (!$form->isValid()) {
            return $form;
        }

        $this->getDoctrine()->getManager()->persist($proposal);
        $this->getDoctrine()->getManager()->flush();
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
            'comments_and_answers_count' => intval($countWithAnswers),
            'comments_count' => count($paginator),
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
            if (!$parent instanceof ProposalComment || $proposal != $parent->getProposal()) {
                throw $this->createNotFoundException('This parent comment is not linked to this proposal');
            }
            if ($parent->getParent() != null) {
                throw new BadRequestHttpException('You can\'t answer the answer of a comment.');
            }
        }

        $proposal->setCommentsCount($proposal->getCommentsCount() + 1);
        $this->getDoctrine()->getManager()->persist($comment);
        $this->getDoctrine()->getManager()->flush();
        $this->get('event_dispatcher')->dispatch(
            CapcoAppBundleEvents::ABSTRACT_COMMENT_CHANGED,
            new AbstractCommentChangedEvent($comment, 'add')
        );
    }

}
