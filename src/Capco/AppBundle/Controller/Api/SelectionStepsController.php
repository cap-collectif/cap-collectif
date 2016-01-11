<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalVote;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use FOS\RestBundle\Util\Codes;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\CommentChangedEvent;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

class SelectionStepsController extends FOSRestController
{
    /**
     * @Post("/selection_steps/{selection_step_id}/proposals/search")
     * @ParamConverter("selectionStep", options={"mapping": {"selection_step_id": "id"}})
     * @QueryParam(name="page", requirements="[0-9.]+", default="1")
     * @QueryParam(name="pagination", requirements="[0-9.]+", default="100")
     * @QueryParam(name="order", requirements="(old|last|votes|comments)", default="votes")
     * @View(statusCode=200, serializerGroups={"Proposals", "ProposalResponses", "UsersInfos", "UserMedias"})
     */
    public function getProposalsBySelectionStepAction(Request $request, SelectionStep $selectionStep, ParamFetcherInterface $paramFetcher)
    {
        $page = intval($paramFetcher->get('page'));
        $pagination = intval($paramFetcher->get('pagination'));
        $order = $paramFetcher->get('order');

        if ($order === 'votes' && !$selectionStep->isVotable()) {
            $order = 'last';
        }

        $terms = $request->request->has('terms') ? $request->request->get('terms') : null;

        // Filters
        $providedFilters = $request->request->has('filters') ? $request->request->get('filters') : [];
        $providedFilters['selectionStep'] = $selectionStep->getId();

        $results = $this->get('capco.search.resolver')->searchProposals(
            $page,
            $pagination,
            $order,
            $terms,
            $providedFilters
        );

        if ($this->getUser()) {
            $results['proposals'] = $this
                ->get('capco.proposal_votes.resolver')
                ->addVotesToProposalsForSelectionStepAndUser(
                    $results['proposals'],
                    $selectionStep,
                    $this->getUser()
                )
            ;
        }

        return $results;
    }

    /**
     * @Post("/selection_steps/{selection_step_id}/proposals/{proposal_id}/vote")
     * @ParamConverter("selectionStep", options={"mapping": {"selection_step_id": "id"}})
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}})
     * @View(statusCode=201)
     */
    public function voteOnProposalAction(Request $request, SelectionStep $selectionStep, Proposal $proposal)
    {
        $user = $this->getUser();
        $em = $this->get('doctrine.orm.entity_manager');

        // Check if proposal is in step
        if (!$proposal->getSelectionSteps()->contains($selectionStep)) {
            throw new BadRequestHttpException('This proposal is not associated to this selection step.');
        }

        // Check if selection step is contributable
        if (!$selectionStep->canContribute()) {
            throw new BadRequestHttpException('This selection step is no longer contributable.');
        }

        // Check if selection step is votable
        if (!$selectionStep->isVotable()) {
            throw new BadRequestHttpException('This selection step is not votable.');
        }

        $vote = (new ProposalVote())
            ->setIpAddress($request->getClientIp())
            ->setUser($user)
            ->setProposal($proposal)
            ->setSelectionStep($selectionStep)
            ->setConfirmed(true)
        ;

        $form = $this->createForm('proposal_vote', $vote);
        $form->submit($request->request->all());

        if (!$form->isValid()) {
            return $this->view($form->getErrors(true, true), Codes::HTTP_BAD_REQUEST);
        }

        $proposal->incrementVotesCount();
        $selectionStep->incrementVotesCount();

        if ($form->has('comment') && null != ($content = $form->get('comment')->getData())) {
            $comment = new ProposalComment();
            $comment
                ->setAuthor($vote->getUser())
                ->setAuthorName($vote->getUsername())
                ->setAuthorEmail($vote->getEmail())
                ->setBody($content)
                ->setProposal($proposal)
            ;

            $em->persist($comment);
            $this->get('event_dispatcher')->dispatch(
                CapcoAppBundleEvents::COMMENT_CHANGED,
                new CommentChangedEvent($comment, 'add')
            );
        }

        $em->persist($vote);
        $em->flush();
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Delete("/selection_steps/{selection_step_id}/proposals/{proposal_id}/vote")
     * @ParamConverter("selectionStep", options={"mapping": {"selection_step_id": "id"}})
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}})
     * @View(statusCode=204)
     */
    public function deleteVoteOnProposalAction(Request $request, SelectionStep $selectionStep, Proposal $proposal)
    {
        $em = $this->get('doctrine.orm.entity_manager');

        // Check if proposal is in step
        if (!$proposal->getSelectionSteps()->contains($selectionStep)) {
            throw new BadRequestHttpException('This proposal is not associated to this selection step.');
        }

        // Check if selection step is contributable
        if (!$selectionStep->canContribute()) {
            throw new BadRequestHttpException('This selection step is no longer contributable.');
        }

        $vote = $em
            ->getRepository('CapcoAppBundle:ProposalVote')
            ->findOneBy([
                'user' => $this->getUser(),
                'proposal' => $proposal,
                'selectionStep' => $selectionStep,
            ]);

        if (!$vote) {
            throw new BadRequestHttpException('You have not voted for this proposal in this selection step.');
        }

        $proposal->decrementVotesCount();
        $selectionStep->decrementVotesCount();

        $em->remove($vote);
        $em->flush();
    }
}
