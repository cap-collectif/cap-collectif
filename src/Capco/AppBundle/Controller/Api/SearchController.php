<?php

namespace Capco\AppBundle\Controller\Api;

use FOS\RestBundle\Controller\Annotations\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

class SearchController extends Controller
{
    /**
     * @Route("/search/{terms}/{sort}/{type}/{page}", name="api_search", requirements={"page" = "\d+"}, defaults={"page" = 1, "_feature_flags" = "search"})
     * @param $terms
     * @param $sort
     * @param $type
     * @param $page
     *
     * @return JsonResponse
     */
    public function searchAction($terms = '', $sort = 'score', $type = 'all', $page = 1)
    {
        $pagination = 10;

        $searchResults = $this->container->get('capco.search.resolver')->searchAll($pagination, $page, $terms, $type, $sort, false);

        $count = $searchResults['count'];

        $nbPages = ceil($count / $pagination);

        $resultsSources = array_map(function($result) {
            return $result->getSource();
        }, $searchResults['results']);

        return new JsonResponse(
            [
                'count'   => $count,
                'results' => $resultsSources,
                'terms'   => $terms,
                'type'    => $type,
                'sort'    => $sort,
                'nbPages' => $nbPages,
                'page'    => $page,
            ]
        );
    }
}
