<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Form\EventSearchType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class EventController extends Controller
{
    /**
     * @Route("/event", name="app_event", defaults={"_feature_flag" = "calendar"} )
     * @Route("/event/filter/{theme}", name="app_event_search_theme", defaults={"_feature_flag" = "calendar", "theme" = "all"} )
     * @Route("/event/filter/{theme}/{term}", name="app_event_search_term", defaults={"_feature_flag" = "calendar", "theme" = "all"} )
     * @Template()
     * @param $request
     * @param $theme
     * @param $term
     * @return array
     */
    public function indexAction(Request $request, $theme = null, $term = null)
    {

        $em = $this->getDoctrine()->getManager();
        $currentUrl = $this->generateUrl('app_event');

        $form = $this->createForm(new EventSearchType(), null, array(
            'action' => $currentUrl,
            'method' => 'POST'
        ));

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {

                $data = $form->getData();

                return $this->redirect($this->generateUrl('app_event_search_term', array(
                    'theme' => $data['theme'] ? $data['theme']->getSlug() : Theme::FILTER_ALL,
                    'term' => $data['term']
                )));
            }
        } else {
            $form->setData(array(
                'theme' => $em->getRepository('CapcoAppBundle:Theme')->findOneBySlug($theme),
                'term' => $term,
            ));
        }

        $groupedEvents = $this->get('capco.event.resolver')->getEventsGroupedByYearAndMonth($theme, $term);

        return [
            'years' => $groupedEvents,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Route("/event/archived", name="app_event_archived", defaults={"_feature_flag" = "calendar"} )
     * @Route("/event/archived/{theme}", name="app_event_archived_theme", defaults={"_feature_flag" = "calendar", "theme" = "all"} )
     * @Route("/event/archived/{theme}/{term}", name="app_event_archived_term", defaults={"_feature_flag" = "calendar", "theme" = "all"} )
     * @Template("CapcoAppBundle:Event:show_archived.html.twig")
     * @param $theme
     * @param $term
     * @param $request
     * @return array
     */
    public function showArchivedAction(Request $request, $theme = null, $term = null)
    {
        $em = $this->getDoctrine()->getManager();
        $currentUrl = $this->generateUrl('app_event_archived');

        $form = $this->createForm(new EventSearchType(), null, array(
            'action' => $currentUrl,
            'method' => 'POST'
        ));

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {

                $data = $form->getData();

                return $this->redirect($this->generateUrl('app_event_archived_term', array(
                    'theme' => $data['theme'] ? $data['theme']->getSlug() : Theme::FILTER_ALL,
                    'term' => $data['term']
                )));
            }
        } else {
            $form->setData(array(
                'theme' => $em->getRepository('CapcoAppBundle:Theme')->findOneBySlug($theme),
                'term' => $term,
            ));
        }

        $groupedEvents = $this->get('capco.event.resolver')->getEventsArchivedGroupedByYearAndMonth($theme, $term);

        return [
            'years' => $groupedEvents,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Route("/event/{slug}", name="app_event_show", defaults={"_feature_flag" = "calendar"} )
     * @Template()
     * @param $request
     * @return array
     */
    public function showAction(Request $request, $slug)
    {
        $event = $this->get('capco.event.repository')->getOne($slug);

        if (!$event) {
            throw new NotFoundHttpException('Could not find a published event for this slug.');
        }

        return [
            'event' => $event
        ];
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @param $max
     * @param $offset
     * @return array
     * @Template()
     */
    public function lastEventsAction($max = 3, $offset = 0)
    {
        $events = $this->get('capco.event.repository')->getLast($max, $offset);

        return [ 'events' => $events ];
    }
}
