<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Capco\AppBundle\Entity\Status;
use Symfony\Component\HttpFoundation\Request;

class SelectionStepsController extends FOSRestController
{
    /**
     * @Post("/selection_steps/{selection_step_id}/proposals")
     * @ParamConverter("selectionStep", options={"mapping": {"selection_step_id": "id"}})
     * @QueryParam(name="first", requirements="[0-9.]+", default="0")
     * @QueryParam(name="offset", requirements="[0-9.]+", default="100")
     * @QueryParam(name="order", requirements="(old|last|popular|comments)", default="last")
     * @View(statusCode=200, serializerGroups={"Proposals", "ProposalResponses", "UsersInfos", "UserMedias"})
     */
    public function getProposalsBySelectionStepAction(Request $request, SelectionStep $selectionStep, ParamFetcherInterface $paramFetcher)
    {
        $searchResolver = $this->container->get('capco.search.resolver');

        $first = intval($paramFetcher->get('first'));
        $offset = intval($paramFetcher->get('offset'));
        $order = $paramFetcher->get('order');

        $pagination = $request->request->has('pagination') ? intval($request->request->get('pagination')) : null;
        $page = $request->request->has('page') ? intval($request->request->get('page')) : null;
        $terms = $request->request->has('terms') ? $request->request->get('terms') : null;
        $type = 'proposal';

        // Sort order
        switch ($order) {
            case 'old':
                $sortField = 'created_at';
                $sortOrder = 'asc';
                break;
            case 'last':
                $sortField = 'created_at';
                $sortOrder = 'desc';
                break;
            case 'popular':
                $sortField = 'votes_count';
                $sortOrder = 'desc';
                break;
            case 'comments':
                $sortField = 'comments_count';
                $sortOrder = 'desc';
                break;
            default;
                $sortField = '_score';
                $sortOrder = 'desc';
                break;
        }

        // Filters
        $providedFilters = $request->request->has('filters') ? $request->request->get('filters') : [];
        $filters = [];
        $filters['selectionSteps.id'] = $selectionStep->getId();
        $filters['isTrashed'] = false;
        $filters['enabled'] = true;
        if (array_key_exists('status', $providedFilters) && $providedFilters['status'] > 0) {
            $filters['status.id'] = $providedFilters['status'];
        }
        if (array_key_exists('district', $providedFilters) && $providedFilters['district'] > 0) {
            $filters['district.id'] = $providedFilters['district'];
        }
        if (array_key_exists('theme', $providedFilters) && $providedFilters['theme'] > 0) {
            $filters['theme.id'] = $providedFilters['theme'];
        }
        if (array_key_exists('type', $providedFilters) && $providedFilters['type'] > 0) {
            $filters['author.user_type.id'] = $providedFilters['type'];
        }

        // Search
        $results = $searchResolver->searchAll($page, $terms, $type, $sortField, $sortOrder, $filters, false, $pagination);

        $proposals = [];
        foreach ($results['results'] as $result) {
            $proposals[] = $result->getHit()['_source'];
        }

        return [
            'proposals' => $proposals,
            'count' => $results['count'],
        ];
    }
}
