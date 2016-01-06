<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Steps\SelectionStep;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Symfony\Component\HttpFoundation\Request;

class SelectionStepsController extends FOSRestController
{
    /**
     * @Post("/selection_steps/{selection_step_id}/proposals/search")
     * @ParamConverter("selectionStep", options={"mapping": {"selection_step_id": "id"}})
     * @QueryParam(name="page", requirements="[0-9.]+", default="1")
     * @QueryParam(name="pagination", requirements="[0-9.]+", default="100")
     * @QueryParam(name="order", requirements="(old|last|popular|comments)", default="last")
     * @View(statusCode=200, serializerGroups={"Proposals", "ProposalResponses", "UsersInfos", "UserMedias"})
     */
    public function getProposalsBySelectionStepAction(Request $request, SelectionStep $selectionStep, ParamFetcherInterface $paramFetcher)
    {
        $page = intval($paramFetcher->get('page'));
        $pagination = intval($paramFetcher->get('pagination'));
        $order = $paramFetcher->get('order');

        $terms = $request->request->has('terms') ? $request->request->get('terms') : null;

        // Filters
        $providedFilters = $request->request->has('filters') ? $request->request->get('filters') : [];
        $providedFilters['selectionStep'] = $selectionStep->getId();

        return $this->get('capco.search.resolver')->searchProposals($page, $pagination, $order, $terms, $providedFilters);
    }
}
