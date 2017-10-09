<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Event\CommentChangedEvent;
use Capco\AppBundle\Form\ProposalCollectVoteType;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CollectStepsController extends FOSRestController
{
    /**
     * @Post("/collect_steps/{collect_step_id}/proposals/search")
     * @ParamConverter("collectStep", options={"mapping": {"collect_step_id": "id"}})
     * @QueryParam(name="page", requirements="[0-9.]+", default="1")
     * @QueryParam(name="pagination", requirements="[0-9.]+", default="100")
     * @QueryParam(name="order", requirements="(old|last|votes|comments|random|expensive|cheap)", nullable=true)
     * @View(statusCode=200, serializerGroups={"Proposals", "UsersInfos", "UserMedias"})
     */
    public function getProposalsByCollectStepAction(
        Request $request,
        CollectStep $collectStep,
        ParamFetcherInterface $paramFetcher
    ) {
        $proposalForm = $collectStep->getProposalForm();
        $page = (int) $paramFetcher->get('page');
        $pagination = (int) $paramFetcher->get('pagination');
        $order = $paramFetcher->get('order');
        $providedFilters = $request->request->has('filters') ? $request->request->get('filters') : [];

        if ($proposalForm->getStep()->isPrivate()) {
            $user = $this->getUser();
            if (!$user) {
                return ['proposals' => [], 'count' => 0, 'order' => $order];
            }
            if (!$user->isAdmin()) {
                $providedFilters['authorUniqueId'] = $user->getUniqueIdentifier();
            }
        }

        $terms = $request->request->has('terms') ? $request->request->get('terms') : null;

        // Filters
        $providedFilters['proposalForm'] = $proposalForm->getId();
        $providedFilters['step'] = $collectStep->getId();

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
     * @Post("/collect_steps/{collect_step_id}/proposals/search-in")
     * @ParamConverter("collectStep", options={"mapping": {"collect_step_id": "id"}})
     * @View(statusCode=200, serializerGroups={"Proposals", "UsersInfos", "UserMedias"})
     */
    public function getSelectProposalsByCollectStepAction(Request $request, CollectStep $collectStep): array
    {
        $selectedIds = $request->request->get('ids');

        if (null === $selectedIds || !is_array($selectedIds)) {
            throw new HttpException(400, 'ids are not setted');
        }

        $proposalForm = $collectStep->getProposalForm();

        if ($proposalForm->getStep()->isPrivate()) {
            $user = $this->getUser();
            if (!$user) {
                return ['proposals' => [], 'count' => 0];
            }
            if (!$user->isAdmin()) {
                $providedFilters['authorUniqueId'] = $user->getUniqueIdentifier();
            }
        }

        $results = $this->get('capco.search.resolver')->searchProposalsIn($selectedIds);

        // Reorder proposals
        $orderedProposals = [];
        foreach ($selectedIds as $selectedId) {
            foreach ($results['proposals'] as $proposal) {
                if ($selectedId === $proposal['id']) {
                    $orderedProposals[] = $proposal;
                }
            }
        }

        $results['proposals'] = $orderedProposals;

        return $results;
    }

    /**
     * @Post("/collect_steps/{collect_step_id}/proposals/{proposal_id}/votes")
     * @ParamConverter("collectStep", options={"mapping": {"collect_step_id": "id"}})
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}})
     * @View(statusCode=200, serializerGroups={"ProposalCollectVotes", "UsersInfos", "UserMedias"})
     */
    public function voteOnProposalAction(Request $request, CollectStep $collectStep, Proposal $proposal)
    {
        $user = $this->getUser();
        $em = $this->get('doctrine.orm.entity_manager');

        // Check if proposal is in step
        if ($collectStep !== $proposal->getProposalForm()->getStep()) {
            throw new BadRequestHttpException('This proposal is not associated to this collect step.');
        }

        // Check if collect step is contributable
        if (!$collectStep->canContribute()) {
            throw new BadRequestHttpException('This collect step is no longer contributable.');
        }

        // Check if collect step is votable
        if (!$collectStep->isVotable()) {
            throw new BadRequestHttpException('This collect step is not votable.');
        }

        // Check if user has reached limit of votes
        if ($collectStep->isNumberOfVotesLimitted()) {
            $countUserVotes = $em
                ->getRepository('CapcoAppBundle:ProposalCollectVote')
                ->countVotesByStepAndUser($collectStep, $user)
            ;
            if ($countUserVotes >= $collectStep->getVotesLimit()) {
                throw new BadRequestHttpException('You have reached the limit of votes.');
            }
        }

        $vote = (new ProposalCollectVote())
            ->setIpAddress($request->getClientIp())
            ->setUser($user)
            ->setProposal($proposal)
            ->setCollectStep($collectStep);

        $form = $this->createForm(ProposalCollectVoteType::class, $vote);
        $form->submit($request->request->all());

        if (!$form->isValid()) {
            return $form;
        }

        if ($form->has('comment') && !empty($content = $form->get('comment')->getData())) {
            $comment = new ProposalComment();
            $comment
                ->setAuthor($vote->getUser())
                ->setAuthorName($vote->getUsername())
                ->setAuthorEmail($vote->getEmail())
                ->setBody($content)
                ->setProposal($proposal);

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
     * @Delete("/collect_steps/{collect_step_id}/proposals/{proposal_id}/votes")
     * @ParamConverter("collectStep", options={"mapping": {"collect_step_id": "id"}})
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}})
     * @View(statusCode=200, serializerGroups={"ProposalCollectVotes", "UsersInfos", "UserMedias"})
     */
    public function deleteVoteOnProposalAction(Request $request, CollectStep $collectStep, Proposal $proposal)
    {
        $em = $this->get('doctrine.orm.entity_manager');

        // Check if proposal is in step
        if ($collectStep !== $proposal->getProposalForm()->getStep()) {
            throw new BadRequestHttpException('This proposal is not associated to this collect step.');
        }

        // Check if selection step is contributable
        if (!$collectStep->canContribute()) {
            throw new BadRequestHttpException('This selection step is no longer contributable.');
        }

        $vote = $em
            ->getRepository('CapcoAppBundle:ProposalCollectVote')
            ->findOneBy(
                [
                    'user' => $this->getUser(),
                    'proposal' => $proposal,
                    'collectStep' => $collectStep,
                ]
            );

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

    /**
     * @Get("/collect_step/{collect_step_id}/markers")
     * @ParamConverter("step", options={"mapping": {"collect_step_id": "id"}})
     * @View(statusCode=200, serializerGroups={"Proposals", "UsersInfos", "UserMedias"})
     */
    public function getProposalsMarkerByCollectStepAction(CollectStep $step)
    {
        $proposalForm = $step->getProposalForm();

        if ($proposalForm->getStep()->isPrivate()) {
            throw $this->createNotFoundException();
        }

        $proposalRepository = $this->get('capco.proposal.repository');
        $results = $proposalRepository->getProposalMarkersForCollectStep($step);
        $router = $this->get('router');

        return array_map(function ($proposal) use ($step, $router) {
            $location = is_array($proposal['address']) ?: \GuzzleHttp\json_decode(stripslashes($proposal['address']), true);

            return [
                'id' => $proposal['id'],
                'title' => $proposal['title'],
                'url' => $router->generate('app_project_show_proposal', ['proposalSlug' => $proposal['slug'],
                    'projectSlug' => $step->getProject()->getSlug(),
                    'stepSlug' => $step->getSlug(),
                ], true),
                'lat' => $location[0]['geometry']['location']['lat'],
                'lng' => $location[0]['geometry']['location']['lng'],
                'address' => $location[0]['formatted_address'],
                'author' => [
                    'username' => $proposal['author']['username'],
                    'url' => $router->generate('capco_user_profile_show_all', ['slug' => $proposal['author']['slug']], true),
                ],
            ];
        }, $results);
    }
}
