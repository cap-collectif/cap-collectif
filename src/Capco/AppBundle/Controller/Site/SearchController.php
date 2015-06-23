<?php

namespace Capco\AppBundle\Controller\Site;

use Elastica\Query;
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
                'title^5',
                'strippedBody',
                'strippedObject',
                'body',
                'teaser',
                'excerpt',
                'username',
                'biography^5',
            ]);

            $boolQuery->addMust($termQuery);

            $query = new Query($boolQuery);

            $query->setSize(5);
            $query->setFrom(0);

            $query->setHighlight(array(
                "pre_tags" => ["<span class=\"search__highlight\">"],
                "post_tags" => ["</span>"],
                "order" => "score",
                "number_of_fragments" => 3,
                "fields" => array(
                    "title" => array('number_of_fragments' => 0,),
                    "strippedObject" => new \stdClass,
                    "strippedBody" => new \stdClass,
                    "body" => new \stdClass,
                    "teaser" => new \stdClass,
                    "excerpt" => new \stdClass,
                    "username" => array('number_of_fragments' => 0,),
                    "biography" => new \stdClass,
                )
            ));

            // Returns a mixed array of any objects mapped + highlights
            $results = $finder->findHybrid($query);
        }

        return [
            'form' => $form->createView(),
            'results' => $results,
        ];
    }
}
