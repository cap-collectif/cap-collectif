<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Form\EventRegistrationType;
use Capco\AppBundle\Helper\EventHelper;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;

class EventController extends Controller
{
    /**
     * @Route("/events", name="app_event", defaults={"_feature_flags" = "calendar"} )
     * @Template("CapcoAppBundle:Event:index.html.twig")
     */
    public function indexAction()
    {
        return [
            'props' => [
                'eventPageTitle' => $this->get(Resolver::class)->getValue('events.jumbotron.title'),
                'eventPageBody' => $this->get(Resolver::class)->getValue('events.content.body'),
            ],
        ];
    }

    /**
     * @Route("/events/download", name="app_events_download")
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function downloadAction(Request $request)
    {
        $trans = $this->get('translator');

        if (!$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw new ProjectAccessDeniedException(
                $trans->trans('project.error.not_exportable')
            );
        }

        $path = sprintf('%s/web/export/', $this->container->getParameter('kernel.project_dir'));
        $csvFile = 'events.csv';

        if (!file_exists($path . $csvFile)) {
            // We create a session for flashBag
            $flashBag = $this->get('session')->getFlashBag();

            $flashBag->add(
                'danger',
                $trans->trans('project.download.not_yet_generated')
            );

            return $this->redirect($request->headers->get('referer'));
        }

        $filename = $csvFile;
        $contentType = 'text/csv';

        $date = (new \DateTime())->format('Y-m-d');

        $request->headers->set('X-Sendfile-Type', 'X-Accel-Redirect');
        $response = new BinaryFileResponse($path . $filename);
        $response->headers->set('X-Accel-Redirect', '/export/' . $filename);
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $date . '_' . $filename
        );
        $response->headers->set('Content-Type', $contentType . '; charset=utf-8');
        $response->headers->set('Pragma', 'public');
        $response->headers->set('Cache-Control', 'maxage=1');

        return $response;
    }

    /**
     * @Route("/events/{slug}", name="app_event_show", defaults={"_feature_flags" = "calendar"})
     * @ParamConverter("event", options={"mapping": {"slug": "slug"}, "repository_method" = "getOneBySlug", "map_method_signature" = true})
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
     * @Template("CapcoAppBundle:Event:lastEvents.html.twig")
     */
    public function lastEventsAction(int $max = 3, int $offset = 0)
    {
        $events = $this->get(EventRepository::class)->getLast($max, $offset);

        return ['events' => $events];
    }
}
