<?php

namespace Capco\AppBundle\Controller\Site;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Form\SearchType as SearchForm;

class SearchController extends Controller
{
    /**
     * @param Request $request
     * @param $term
     * @param $sort
     * @param $type
     * @param $page
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @Route("/search/{term}/{sort}/{type}/{page}", name="app_search", requirements={"page" = "\d+"}, defaults={"page" = 1, "_feature_flags" = "search"})
     * @Template("CapcoAppBundle:Default:search.html.twig")
     */
    public function searchAction(Request $request, $term = '', $sort = 'score', $type = 'all', $page = 1)
    {
        $form = $this->createForm(new SearchForm($this->get('capco.toggle.manager')));

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                // redirect to the results page (avoids reload alerts)
                $data = $form->getData();

                return $this->redirect($this->generateUrl('app_search', array_merge($data, ['page' => $page])));
            }
        } else {
            $form->setData(['term' => $term, 'type' => $type, 'sort' => $sort]);
        }

        $pagination = 10;

        $searchResults = $this->container->get('capco.search.resolver')->searchAll($pagination, $page, $term, $type, $sort);

        $count = $searchResults['count'];

        $nbPages = ceil($count / $pagination);

        return [
            'form'    => $form->createView(),
            'count'   => $count,
            'results' => $searchResults['results'],
            'term'    => $term,
            'type'    => $type,
            'sort'    => $sort,
            'nbPages' => $nbPages,
            'page'    => $page,
        ];
    }
}
