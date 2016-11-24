<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Form\ProposalSelectionVoteType;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\CommentChangedEvent;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

class SelectionStepsController extends FOSRestController
{
    /**
    * @Get("/selection_steps/{selection_step_id}")
    * @ParamConverter("selectionStep", options={"mapping": {"selection_step_id": "id"}})
    * @View(statusCode=200, serializerGroups={"Statuses", "Steps", "SelectionSteps", "VoteThreshold"})
    */
   public function getBySelectionStepAction(SelectionStep $selectionStep)
   {
       return $selectionStep;
   }

    /**
     * @Post("/selection_steps/{selection_step_id}/proposals/search")
     * @ParamConverter("selectionStep", options={"mapping": {"selection_step_id": "id"}})
     * @QueryParam(name="page", requirements="[0-9.]+", default="1")
     * @QueryParam(name="pagination", requirements="[0-9.]+", default="100")
     * @QueryParam(name="order", requirements="(old|last|votes|comments|random)", nullable=true)
     * @View(statusCode=200, serializerGroups={"Proposals", "UsersInfos", "UserMedias"})
     */
    public function getProposalsBySelectionStepAction(Request $request, SelectionStep $selectionStep, ParamFetcherInterface $paramFetcher)
    {
        $page = intval($paramFetcher->get('page'));
        $pagination = intval($paramFetcher->get('pagination'));
        $order = $paramFetcher->get('order') ? $paramFetcher->get('order') : $selectionStep->getDefaultSort();

        if ($order === 'votes' && !$selectionStep->isVotable()) {
            $order = 'last';
        }

        $terms = $request->request->has('terms') ? $request->request->get('terms') : null;

        // Filters
        $providedFilters = $request->request->has('filters') ? $request->request->get('filters') : [];
        $providedFilters['selectionStep'] = $selectionStep->getId();
        if (array_key_exists('statuses', $providedFilters)) {
            $providedFilters['selectionStatuses'] = $providedFilters['statuses'];
            unset($providedFilters['statuses']);
        }

        $results = $this->get('capco.search.resolver')->searchProposals(
            $page,
            $pagination,
            $order,
            $terms,
            $providedFilters
        );

        return $results;
    }

    /**
     * @Post("/selection_steps/{selectionStepId}/selections")
     * @ParamConverter("selectionStep", options={"mapping": {"selectionStepId": "id"}})
     * @Security("has_role('ROLE_ADMIN')")
     * @View(statusCode=201, serializerGroups={})
     */
    public function selectProposalAction(Request $request, SelectionStep $selectionStep)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $proposal = $em->getRepository('CapcoAppBundle:Proposal')->find($request->request->get('proposal'));
        $selection = new Selection();
        $selection->setSelectionStep($selectionStep);
        $selection->setProposal($proposal);
        $em->persist($selection);
        $em->flush();
    }

    /**
     * @Delete("/selection_steps/{selectionStepId}/selections/{proposalId}")
     * @ParamConverter("selectionStep", options={"mapping": {"selectionStepId": "id"}})
     * @ParamConverter("proposal", options={"mapping": {"proposalId": "id"}})
     * @Security("has_role('ROLE_ADMIN')")
     * @View(statusCode=204, serializerGroups={})
     */
    public function unselectProposalAction(SelectionStep $selectionStep, Proposal $proposal)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $selection = $em->getRepository('CapcoAppBundle:Selection')
                        ->findOneBy(['proposal' => $proposal, 'selectionStep' => $selectionStep]);
        if (!$selection) {
          throw new Exception("Error Processing Request", 1);
        }

        $em->remove($selection);
        $em->flush();
    }

    /**
     * @Post("/selection_steps/{selection_step_id}/proposals/{proposal_id}/votes")
     * @ParamConverter("selectionStep", options={"mapping": {"selection_step_id": "id"}})
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}})
     * @View(statusCode=200, serializerGroups={"ProposalSelectionVotes", "UsersInfos", "UserMedias"})
     */
    public function voteOnProposalAction(Request $request, SelectionStep $selectionStep, Proposal $proposal)
    {
        $user = $this->getUser();
        $em = $this->get('doctrine.orm.entity_manager');

        // Check if proposal is in step
        if (!in_array($selectionStep, $proposal->getSelectionSteps())) {
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

        // If selection step vote type is of type "budget", user must be logged in
        if (!$user && $selectionStep->isBudgetVotable()) {
            throw new UnauthorizedHttpException('Must be logged to vote.');
        }

        $vote = (new ProposalSelectionVote())
            ->setIpAddress($request->getClientIp())
            ->setUser($user)
            ->setProposal($proposal)
            ->setSelectionStep($selectionStep)
        ;

        $form = $this->createForm(ProposalSelectionVoteType::class, $vote);
        $form->submit($request->request->all());

        if (!$form->isValid()) {
            return $form;
        }

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

        // If not present, es listener will take some time to execute the refresh
        // and, next time proposals will be fetched, the set of data will be outdated.
        // Keep in mind that refresh should usually not be triggered manually.
        $index = $this->get('fos_elastica.index');
        $index->refresh();

        return $vote;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Delete("/selection_steps/{selection_step_id}/proposals/{proposal_id}/votes")
     * @ParamConverter("selectionStep", options={"mapping": {"selection_step_id": "id"}})
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}})
     * @View(statusCode=200, serializerGroups={"ProposalSelectionVotes", "UsersInfos", "UserMedias"})
     */
    public function deleteVoteOnProposalAction(Request $request, SelectionStep $selectionStep, Proposal $proposal)
    {
        $em = $this->get('doctrine.orm.entity_manager');

        // Check if proposal is in step
        if (!in_array($selectionStep, $proposal->getSelectionSteps())) {
            throw new BadRequestHttpException('This proposal is not associated to this selection step.');
        }

        // Check if selection step is contributable
        if (!$selectionStep->canContribute()) {
            throw new BadRequestHttpException('This selection step is no longer contributable.');
        }

        $vote = $em
            ->getRepository('CapcoAppBundle:ProposalSelectionVote')
            ->findOneBy([
                'user' => $this->getUser(),
                'proposal' => $proposal,
                'selectionStep' => $selectionStep,
            ]);

        if (!$vote) {
            throw new BadRequestHttpException('You have not voted for this proposal in this selection step.');
        }

        $em->remove($vote);
        $em->flush();

        // If not present, es listener will take some time to execute the refresh
        // and, next time proposals will be fetched, the set of data will be outdated.
        // Keep in mind that refresh should usually not be triggered manually.
        $index = $this->get('fos_elastica.index');
        $index->refresh();

        return $vote;
    }
}
