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
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @Route("/search/{term}/{type}", name="app_search")
     * @Template("CapcoAppBundle:Default:search.html.twig")
     */
    public function searchAction(Request $request, $term = null, $type = null)
    {
        $form = $this->createForm(new SearchForm());

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                // redirect to the results page (avoids reload alerts)
                $data = $form->getData();
                return $this->redirect($this->generateUrl('app_search', ['term' => $data['term'], 'type' => $data['type']]));
            }
        }

        $form->setData(['term' => $term, 'type' => $type]);

        $results = $this->container->get('capco.search.resolver')->searchAll($term, $type);

        return [
            'form' => $form->createView(),
            'results' => $results,
            'term' => $term,
            'type' => $type,
        ];
    }
}
