<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class CollectStepsController extends FOSRestController
{
    /**
     * @Post("/collect_steps/{collect_step_id}/proposals/search")
     * @ParamConverter("collectStep", options={"mapping": {"collect_step_id": "id"}})
     * @QueryParam(name="page", requirements="[0-9.]+", default="1")
     * @QueryParam(name="pagination", requirements="[0-9.]+", default="100")
     * @QueryParam(name="order", requirements="(old|last|votes|least-votes|comments|random|expensive|cheap)", nullable=true)
     * @View(statusCode=200, serializerGroups={"Proposals", "ThemeDetails", "UsersInfos", "UserMedias"})
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
        $filters = $request->request->has('filters') ? $request->request->get('filters') : [];

        if ($proposalForm->getStep()->isPrivate()) {
            $user = $this->getUser();
            if (!$user) {
                return ['proposals' => [], 'count' => 0, 'order' => $order];
            }
            if (!$user->isAdmin()) {
                $filters['author'] = $user->getId();
            }
        }

        $terms = $request->request->has('terms') ? $request->request->get('terms') : null;

        // Filters
        $filters['proposalForm'] = $proposalForm->getId();
        $filters['collectStep'] = $collectStep->getId();

        $seed = $this->getUser() ? $this->getUser()->getId() : $request->getClientIp();

        $limit = $pagination ?? 10;
        $offset = ($page - 1) * $pagination;

        $results = $this->get('capco.search.proposal_search')->searchProposals(
            $offset,
            $limit,
            $order,
            $terms,
            $filters,
            $seed
        );

        return $results;
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
