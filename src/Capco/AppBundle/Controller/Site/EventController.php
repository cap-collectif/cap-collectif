<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Form\EventRegistrationType;
use Capco\AppBundle\Form\EventSearchType;
use Capco\AppBundle\Helper\EventHelper;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Resolver\EventResolver;
use Capco\AppBundle\Search\EventSearch;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class EventController extends Controller
{
    /**
     * @Route("/events", name="app_event", defaults={"_feature_flags" = "calendar"} )
     * @Route("/events/filter/{theme}", name="app_event_search_theme", defaults={"_feature_flags" = "calendar", "theme" = "all"} )
     * @Route("/events/filter/{theme}/{project}", name="app_event_search_project", defaults={"_feature_flags" = "calendar", "theme" = "all", "project"="all"} )
     * @Route("/events/filter/{theme}/{project}/{term}", name="app_event_search_term", defaults={"_feature_flags" = "calendar", "theme" = "all", "project"="all"} )
     * @Cache(smaxage="60", public=true)
     * @Template("CapcoAppBundle:Event:index.html.twig")
     *
     * @param null|mixed $theme
     * @param null|mixed $project
     * @param null|mixed $term
     */
    public function indexAction(Request $request, $theme = null, $project = null, $term = null)
    {
        $currentUrl = $this->generateUrl('app_event');

        $form = $this->createForm(EventSearchType::class, null, [
            'action' => $currentUrl,
            'method' => 'POST',
        ]);

        if ('POST' === $request->getMethod()) {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $data = $form->getData();

                return $this->redirect(
                    $this->generateUrl('app_event_search_term', [
                        'theme' =>
                            isset($data['theme']) && $data['theme']
                                ? $data['theme']->getSlug()
                                : Theme::FILTER_ALL,
                        'project' => $data['project']
                            ? $data['project']->getSlug()
                            : Project::FILTER_ALL,
                        'term' => $data['term'],
                    ])
                );
            }
        } else {
            $form->setData([
                'theme' => $this->get('capco.theme.repository')->findOneBySlug($theme),
                'project' => $this->get(ProjectRepository::class)->findOneBySlug($project),
                'term' => $term,
            ]);
        }

        $groupedEvents = $this->get(EventResolver::class)->getEventsGroupedByYearAndMonth(
            false,
            $theme,
            $project,
            $term
        );
        $archivedEvents = $this->get(EventSearch::class)->searchEvents(0, 100, 'asc', null, [
            'isFuture' => false,
        ]);

        return [
            'years' => $groupedEvents,
            'form' => $form->createView(),
            'archivedEventsNb' => $archivedEvents['count'],
        ];
    }

    /**
     * @Route("/events/archived", name="app_event_archived", defaults={"_feature_flags" = "calendar"} )
     * @Route("/events/archived/{theme}", name="app_event_archived_theme", defaults={"_feature_flags" = "calendar", "theme" = "all"} )
     * @Route("/events/archived/{theme}/{project}", name="app_event_archived_project", defaults={"_feature_flags" = "calendar", "theme" = "all", "project"="all"} )
     * @Route("/events/archived/{theme}/{project}/{term}", name="app_event_archived_term", defaults={"_feature_flags" = "calendar", "theme" = "all", "project"="all"} )
     * @Template("CapcoAppBundle:Event:show_archived.html.twig")
     *
     * @param null|mixed $theme
     * @param null|mixed $project
     * @param null|mixed $term
     */
    public function showArchivedAction(
        Request $request,
        $theme = null,
        $project = null,
        $term = null
    ) {
        $currentUrl = $this->generateUrl('app_event_archived');

        $form = $this->createForm(EventSearchType::class, null, [
            'action' => $currentUrl,
            'method' => 'POST',
        ]);

        if ('POST' === $request->getMethod()) {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $data = $form->getData();

                return $this->redirect(
                    $this->generateUrl('app_event_archived_term', [
                        'theme' => isset($data['theme'])
                            ? $data['theme']->getSlug()
                            : Theme::FILTER_ALL,
                        'project' => $data['project']
                            ? $data['project']->getSlug()
                            : Project::FILTER_ALL,
                        'term' => $data['term'],
                    ])
                );
            }
        } else {
            $form->setData([
                'theme' => $this->get('capco.theme.repository')->findOneBySlug($theme),
                'project' => $this->get(ProjectRepository::class)->findOneBySlug($project),
                'term' => $term,
            ]);
        }

        $groupedEvents = $this->get(EventResolver::class)->getEventsGroupedByYearAndMonth(
            true,
            $theme,
            $project,
            $term
        );

        return [
            'years' => $groupedEvents,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Route("/events/{slug}", name="app_event_show", defaults={"_feature_flags" = "calendar"})
     * @ParamConverter("event", options={"mapping": {"slug": "slug"}, "repository_method" = "getOne"})
     * @Template("CapcoAppBundle:Event:show.html.twig")
     */
    public function showAction(Request $request, Event $event)
    {
        $eventHelper = $this->container->get(EventHelper::class);

        if (!$eventHelper->isRegistrationPossible($event)) {
            return [
                'event' => $event,
            ];
        }

        $user = $this->getUser();
        $registration = $eventHelper->findUserRegistrationOrCreate($event, $user);
        $form = $this->createForm(EventRegistrationType::class, $registration, [
            'registered' => $registration->isConfirmed(),
        ]);

        if ('POST' === $request->getMethod()) {
            $registration->setIpAddress($request->getClientIp());
            $registration->setUser($user);
            $form->handleRequest($request);
            $registration->setConfirmed(!$registration->isConfirmed());

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->persist($registration);
                $em->flush();

                // We create a session for flashBag
                $flashBag = $this->get('session')->getFlashBag();

                if ($registration->isConfirmed()) {
                    $flashBag->add(
                        'success',
                        $this->get('translator')->trans(
                            'event_registration.create.register_success'
                        )
                    );
                } else {
                    $flashBag->add(
                        'info',
                        $this->get('translator')->trans(
                            'event_registration.create.unregister_success'
                        )
                    );
                }

                return $this->redirect(
                    $this->generateUrl('app_event_show', ['slug' => $event->getSlug()])
                );
            }
        }

        return [
            'form' => $form->createView(),
            'event' => $event,
        ];
    }

    /**
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template("CapcoAppBundle:Event:lastEvents.html.twig")
     */
    public function lastEventsAction(int $max = 3, int $offset = 0)
    {
        $events = $this->get('capco.event.repository')->getLast($max, $offset);

        return ['events' => $events];
    }
}
