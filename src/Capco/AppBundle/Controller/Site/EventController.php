<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Form\EventRegistrationType;
use Capco\AppBundle\Helper\EventHelper;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Security\EventVoter;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\AppBundle\Utils\RequestGuesser;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Doctrine\ORM\EntityManagerInterface;
use Http\Discovery\Exception\NotFoundException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class EventController extends Controller
{
    private EventHelper $eventHelper;
    private EventRepository $eventRepository;
    private EntityManagerInterface $entityManager;
    private FormFactoryInterface $formFactory;
    private SiteParameterResolver $parameterResolver;
    private TranslatorInterface $tranlator;
    private SessionInterface $session;
    private string $projectDir;

    public function __construct(
        EventHelper $eventHelper,
        EventRepository $eventRepository,
        EntityManagerInterface $entityManager,
        FormFactoryInterface $formFactory,
        SiteParameterResolver $parameterResolver,
        TranslatorInterface $tranlator,
        SessionInterface $session,
        string $projectDir
    ) {
        $this->entityManager = $entityManager;
        $this->eventHelper = $eventHelper;
        $this->eventRepository = $eventRepository;
        $this->formFactory = $formFactory;
        $this->parameterResolver = $parameterResolver;
        $this->tranlator = $tranlator;
        $this->session = $session;
        $this->projectDir = $projectDir;
    }

    /**
     * @Route("/events", name="app_event", defaults={"_feature_flags" = "calendar"} )
     * @Template("CapcoAppBundle:Event:index.html.twig")
     */
    public function indexAction(Request $request)
    {
        $locale = $request->getLocale() ?? 'fr-FR';

        return [
            'props' => [
                'eventPageTitle' => $this->parameterResolver->getValue(
                    'events.jumbotron.title',
                    $locale
                ),
                'eventPageBody' => $this->parameterResolver->getValue(
                    'events.content.body',
                    $locale
                ),
                'locale' => $request->getLocale(),
            ],
        ];
    }

    /**
     * @Route("/events/download", name="app_events_download", options={"i18n" = false})
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function downloadAction(Request $request)
    {
        if (!$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw new ProjectAccessDeniedException($this->tranlator->trans('project.error.not_exportable'));
        }

        $path = sprintf('%s/public/export/', $this->projectDir);
        $csvFile = 'events.csv';

        if (!file_exists($path . $csvFile)) {
            return new JsonResponse(
                ['errorTranslationKey' => 'project.download.not_yet_generated'],
                404
            );
        }

        $filename = $csvFile;
        $contentType = 'text/csv';

        $date = (new \DateTime())->format('Y-m-d');
        $response = $this->file($path . $filename, $date . '_' . $filename);
        $response->headers->set('Content-Type', $contentType . '; charset=utf-8');

        return $response;
    }

    /**
     * @Route("/events/{slug}", name="app_event_show", defaults={"_feature_flags" = "calendar"})
     * @Template("CapcoAppBundle:Event:show.html.twig")
     *
     * @param mixed $slug
     */
    public function showAction(Request $request, $slug)
    {
        $filters = $this->entityManager->getFilters();
        if ($filters->isEnabled('softdeleted')) {
            $filters->disable('softdeleted');
        }
        $event = $this->eventRepository->getOneBySlug($slug);

        if (!$event) {
            throw new NotFoundException();
        }

        if ($event->isDeleted()) {
            return new Response(
                $this->renderView('CapcoAppBundle:Event:show.html.twig', ['event' => $event, 'isDeleted' => true])
            );
        }
        $this->denyAccessUnlessGranted(EventVoter::VIEW_FRONT, $event);

        // TODO https://github.com/cap-collectif/platform/issues/10940
        // we can use session to avoid this.
        // $now = new \DateTime();
        // $flashBag = $this->session->getFlashBag();
        // $diff = $event->getCreatedAt()->diff($now);
        // if ($diff->i < 2) {
        //     $flashBag->add('success', $this->tranlator->trans('event-review-request-to-admin'));
        // }

        /** @var User $viewer */
        $viewer = $this->getUser();
        if (!$this->eventHelper->isRegistrationPossible($event)) {
            return [
                'viewerIsAuthor' => $event->getAuthor() === $this->getUser(),
                'event' => $event,
                'viewer' => $viewer,
                'isDeleted' => false,
            ];
        }

        $user = $this->getUser();
        $registration = $this->eventHelper->findUserRegistrationOrCreate($event, $user);
        $form = $this->formFactory->create(EventRegistrationType::class, $registration, [
            'registered' => $registration->isConfirmed(),
            'adminAuthorizeDataTransferTradKey' => $event->getAdminAuthorizeDataTransfer()
                ? 'privacy-policy-accepted-2'
                : 'privacy-policy-accepted',
        ]);

        if ('POST' === $request->getMethod()) {
            $registration->setIpAddress(RequestGuesser::getClientIpFromRequest($request));
            $registration->setUser($user);
            $form->handleRequest($request);
            $registration->setConfirmed(!$registration->isConfirmed());

            if ($form->isValid()) {
                $this->entityManager->persist($registration);
                $this->entityManager->flush();

                // We create a session for flashBag

                if ($registration->isConfirmed()) {
                    $flashBag->add(
                        'success',
                        $this->tranlator->trans('event_registration.create.register_success')
                    );
                } else {
                    $flashBag->add(
                        'info',
                        $this->tranlator->trans('event_registration.create.unregister_success')
                    );
                }

                return $this->redirect(
                    $this->generateUrl('app_event_show', ['slug' => $event->getSlug()])
                );
            }
        }

        return [
            'viewerIsAuthor' => $event->getAuthor() === $this->getUser(),
            'form' => $form->createView(),
            'event' => $event,
            'viewer' => $viewer,
            'user' => $this->getUser(),
            'isDeleted' => false,
        ];
    }
}
