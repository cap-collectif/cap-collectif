<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Form\SearchType as SearchForm;
use Capco\AppBundle\Search\GlobalSearch;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SearchController extends Controller
{
    /**
     * @Route("/search", name="app_search", defaults={"_feature_flags" = "search"}, options={"i18n" = false})
     * @Template("@CapcoApp/Default/search.html.twig")
     */
    public function searchAction(Request $request)
    {
        $searchParams = ['term' => '', 'type' => 'all', 'sort' => 'score'];
        $sortField = '_score';
        $sortOrder = 'desc';

        $page = (int) $request->get('page', 1);

        $form = $this->createForm(SearchForm::class, $searchParams, ['method' => 'GET']);

        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $searchParams = $form->getData();
        }

        if ($searchParams['sort'] && 'date' === $searchParams['sort']) {
            $sortField = 'createdAt';
            $sortOrder = 'desc';
        }

        // Perform the search
        $searchResults = $this->container
            ->get(GlobalSearch::class)
            ->search($page, $searchParams['term'], $sortField, $sortOrder, $searchParams['type'])
        ;

        /*
         * Do not display Proposal if we are not allowed.
         *
         * @var HybridResult
         */
        foreach ($searchResults['results'] as $key => $searchResult) {
            /** @var Proposal $proposal */
            if (
                $searchResult->getTransformed() instanceof Proposal
                && ($proposal = $searchResult->getTransformed())
            ) {
                if (!$proposal->getStep()) {
                    continue;
                }
                if (!$proposal->viewerCanSee($this->getUser())) {
                    unset($searchResults['results'][$key]);
                    --$searchResults['count'];
                }
            }
            /** @var Project $project */
            if (
                $searchResult->getTransformed() instanceof Project
                && ($project = $searchResult->getTransformed())
            ) {
                if (!$project->canDisplay($this->getUser())) {
                    unset($searchResults['results'][$key]);
                    --$searchResults['count'];
                }
            }
        }

        return [
            'form' => $form->createView(),
            'page' => $page,
            'search' => $searchParams,
            'count' => $searchResults['count'],
            'results' => $searchResults['results'],
            'nbPages' => $searchResults['pages'],
        ];
    }
}
