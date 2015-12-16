<?php

namespace Capco\AppBundle\Controller\Api;

use FOS\RestBundle\Controller\Annotations\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

class SearchController extends Controller
{
    /**
     * @Route("/search/{terms}/{sort}/{type}/{page}/{pagination}", name="api_search", requirements={"page" = "\d+"}, defaults={"page" = 1, "_feature_flags" = "search"})
     * @param string $terms
     * @param string $sort
     * @param string $type
     * @param int $page
     * @param int $pagination
     *
     * @return JsonResponse
     */
    public function searchAction($terms = '', $sort = 'score', $type = 'all', $page = 1, $pagination = 10)
    {
        $searchResults = $this->container->get('capco.search.resolver')->searchAll($page, $terms, $type, $sort, false, $pagination);

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
