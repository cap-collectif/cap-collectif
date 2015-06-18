<?php

namespace Capco\AppBundle\Controller\Site;

use Elastica\Query;
use Elastica\Query\Terms;
use Elastica\Query\Bool;
use Elastica\Query\MultiMatch;

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

                if ($form->isValid()) {
                    return $this->redirect($this->generateUrl('app_search', ['term' => $data['term'], 'type' => $data['type']]));
                }
            }
        }

        $results = array();
        $form->setData(['term' => $term, 'type' => $type]);

        if ($term) {
            $finder = $this->container->get('fos_elastica.finder.app');

            if (null !== $type) {
                $finder = $this->container->get('fos_elastica.finder.app.'.$type);
            }

            $boolQuery = new Bool();

            $termQuery = new MultiMatch();
            $termQuery->setQuery($term);
            $termQuery->setFields([
                'title^10',
                'body',
                'teaser',
                'excerpt'
            ]);

            $boolQuery->addMust($termQuery);

            $results = $finder->find($boolQuery);
        }

        return [
            'form' => $form->createView(),
            'results' => $results,
        ];
    }
}
