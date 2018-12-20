<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Steps\SelectionStep;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Patch;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;

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
     * @Post("/selection_steps/{selectionStepId}/selections")
     * @Security("has_role('ROLE_ADMIN')")
     * @View(statusCode=201, serializerGroups={})
     */
    public function selectProposalAction(Request $request, string $selectionStepId)
    {
        $this->get('capco.mutation.proposal')->selectProposal(
            $request->request->get('proposal'),
            $selectionStepId
        );
    }

    /**
     * @Delete("/selection_steps/{selectionStepId}/selections/{proposalId}")
     * @Security("has_role('ROLE_ADMIN')")
     * @View(statusCode=204, serializerGroups={})
     */
    public function unselectProposalAction(string $selectionStepId, string $proposalId)
    {
        $this->get('capco.mutation.proposal')->unselectProposal(
            $proposalId,
            $selectionStepId
        );
    }

    /**
     * @Patch("/selection_steps/{stepId}/selections/{proposalId}")
     * @Security("has_role('ROLE_ADMIN')")
     * @View(statusCode=204, serializerGroups={})
     */
    public function updateSelectionStatusAction(Request $request, string $stepId, string $proposalId)
    {
        $this->get('capco.mutation.proposal')->changeSelectionStatus(
            $proposalId,
            $stepId,
            $request->request->get('status')
        );
    }

    /**
     * @Get("/selection_step/{selectionStepId}/markers")
     * @ParamConverter("step", options={"mapping": {"selectionStepId": "id"}})
     * @View(statusCode=200, serializerGroups={"Proposals", "UsersInfos", "UserMedias"})
     */
    public function getProposalsMarkerByCollectStepAction(SelectionStep $step)
    {
        $proposalRepository = $this->get('capco.proposal.repository');
        $results = $proposalRepository->getProposalMarkersForSelectionStep($step);
        $router = $this->get('router');

        return array_map(function ($proposal) use ($step, $router) {
            $location = \is_array($proposal['address']) ?: \GuzzleHttp\json_decode($proposal['address'], true);

            return [
                'id' => $proposal['id'],
                'title' => $proposal['title'],
                'url' => $router->generate('app_project_show_proposal', ['proposalSlug' => $proposal['slug'],
                    'projectSlug' => $step->getProject()->getSlug(),
                    'stepSlug' => $step->getProject()->getFirstCollectStep()->getSlug(),
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
