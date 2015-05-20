<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Form\EventSearchType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Form\EventRegistrationType;

class EventController extends Controller
{
    /**
     * @Route("/events", name="app_event", defaults={"_feature_flag" = "calendar"} )
     * @Route("/events/filter/{theme}", name="app_event_search_theme", defaults={"_feature_flag" = "calendar", "theme" = "all"} )
     * @Route("/events/filter/{theme}/{consultation}", name="app_event_search_consultation", defaults={"_feature_flag" = "calendar", "theme" = "all", "consultation"="all"} )
     * @Route("/events/filter/{theme}/{consultation}/{term}", name="app_event_search_term", defaults={"_feature_flag" = "calendar", "theme" = "all", "consultation"="all"} )
     * @Template()
     *
     * @param $request
     * @param $theme
     * @param $consultation
     * @param $term
     *
     * @return array
     */
    public function indexAction(Request $request, $theme = null, $consultation = null, $term = null)
    {
        $em = $this->getDoctrine()->getManager();
        $currentUrl = $this->generateUrl('app_event');

        $form = $this->createForm(new EventSearchType($this->get('capco.toggle.manager')), null, array(
            'action' => $currentUrl,
            'method' => 'POST',
        ));

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $data = $form->getData();

                return $this->redirect($this->generateUrl('app_event_search_term', array(
                    'theme' => $data['theme'] ? $data['theme']->getSlug() : Theme::FILTER_ALL,
                    'consultation' => $data['consultation'] ? $data['consultation']->getSlug() : Consultation::FILTER_ALL,
                    'term' => $data['term'],
                )));
            }
        } else {
            $form->setData(array(
                'theme' => $em->getRepository('CapcoAppBundle:Theme')->findOneBySlug($theme),
                'consultation' => $em->getRepository('CapcoAppBundle:Consultation')->findOneBySlug($consultation),
                'term' => $term,
            ));
        }

        $groupedEvents = $this->get('capco.event.resolver')->getEventsGroupedByYearAndMonth(false, $theme, $consultation, $term);
        $archivedEventsNb = $this->get('capco.event.resolver')->countEvents(true, $theme, $consultation, $term);

        return [
            'years' => $groupedEvents,
            'form' => $form->createView(),
            'archivedEventsNb' => $archivedEventsNb,
        ];
    }

    /**
     * @Route("/events/archived", name="app_event_archived", defaults={"_feature_flag" = "calendar"} )
     * @Route("/events/archived/{theme}", name="app_event_archived_theme", defaults={"_feature_flag" = "calendar", "theme" = "all"} )
     * @Route("/events/archived/{theme}/{consultation}", name="app_event_archived_consultation", defaults={"_feature_flag" = "calendar", "theme" = "all", "consultation"="all"} )
     * @Route("/events/archived/{theme}/{consultation}/{term}", name="app_event_archived_term", defaults={"_feature_flag" = "calendar", "theme" = "all", "consultation"="all"} )
     * @Template("CapcoAppBundle:Event:show_archived.html.twig")
     *
     * @param $theme
     * @param $consultation
     * @param $term
     * @param $request
     *
     * @return array
     */
    public function showArchivedAction(Request $request, $theme = null, $consultation = null, $term = null)
    {
        $em = $this->getDoctrine()->getManager();
        $currentUrl = $this->generateUrl('app_event_archived');

        $form = $this->createForm(new EventSearchType($this->get('capco.toggle.manager')), null, array(
            'action' => $currentUrl,
            'method' => 'POST',
        ));

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $data = $form->getData();

                return $this->redirect($this->generateUrl('app_event_archived_term', array(
                    'theme' => $data['theme'] ? $data['theme']->getSlug() : Theme::FILTER_ALL,
                    'consultation' => $data['consultation'] ? $data['consultation']->getSlug() : Consultation::FILTER_ALL,
                    'term' => $data['term'],
                )));
            }
        } else {
            $form->setData(array(
                'theme' => $em->getRepository('CapcoAppBundle:Theme')->findOneBySlug($theme),
                'consultation' => $em->getRepository('CapcoAppBundle:Consultation')->findOneBySlug($consultation),
                'term' => $term,
            ));
        }

        $groupedEvents = $this->get('capco.event.resolver')->getEventsGroupedByYearAndMonth(true, $theme, $consultation, $term);

        return [
            'years' => $groupedEvents,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Route("/events/{slug}", name="app_event_show", defaults={"_feature_flag" = "calendar"})
     * @ParamConverter("event", options={"mapping": {"slug": "slug"}, "repository_method" = "getOne"})
     * @Template()
     *
     * @param $request
     *
     * @return array
     */
    public function showAction(Request $request, Event $event)
    {
        $eventHelper = $this->container->get('capco.event.helper');

        if (!$eventHelper->isRegistrationPossible($event)) {
            return ['event' => $event];
        }

        $user = $this->getUser();
        $registration = $eventHelper->findUserRegistrationOrCreate($event, $user);
        $form = $this->createForm(new EventRegistrationType($user, $registration->isConfirmed()), $registration);

        if ($request->getMethod() == 'POST') {
            $registration->setIpAddress($request->getClientIp());
            $registration->setUser($user);
            $form->handleRequest($request);
            $registration->setConfirmed(!$registration->isConfirmed());

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->persist($registration);
                $em->flush();
                if ($registration->isConfirmed()) {
                    $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('event_registration.create.register_success'));
                } else {
                    $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('event_registration.create.unregister_success'));
                }

                return $this->redirect($this->generateUrl('app_event_show', ['slug' => $event->getSlug()]));
            }
        }

        return ['form' => $form->createView(), 'event' => $event];
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     *
     * @param $max
     * @param $offset
     *
     * @return array
     * @Template()
     */
    public function lastEventsAction($max = 3, $offset = 0)
    {
        $events = $this->get('capco.event.repository')->getLast($max, $offset);

        return ['events' => $events];
    }
}
