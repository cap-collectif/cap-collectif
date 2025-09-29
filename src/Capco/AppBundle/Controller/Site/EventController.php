<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Form\EventRegistrationType;
use Capco\AppBundle\Helper\EventHelper;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Security\EventVoter;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Doctrine\ORM\EntityManagerInterface;
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
    public function __construct(
        private readonly EventHelper $eventHelper,
        private readonly EventRepository $eventRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly FormFactoryInterface $formFactory,
        private readonly SiteParameterResolver $parameterResolver,
        private readonly TranslatorInterface $tranlator,
        private readonly SessionInterface $session,
        private readonly string $projectDir
    ) {
    }

    /**
     * @Route("/events", name="app_event", defaults={"_feature_flags" = "calendar"} )
     * @Template("@CapcoApp/Event/index.html.twig")
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
     * @Security("is_granted('ROLE_ADMIN')")
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
     * @Template("@CapcoApp/Event/show.html.twig")
     */
    public function showAction(Request $request, mixed $slug)
    {
        $filters = $this->entityManager->getFilters();
        if ($filters->isEnabled('softdeleted')) {
            $filters->disable('softdeleted');
        }
        $event = $this->eventRepository->getOneBySlug($slug);

        if (!$event) {
            throw $this->createNotFoundException('Could not find a published event for this slug.');
        }

        if ($event->isDeleted()) {
            return new Response(
                $this->renderView('@CapcoApp/Event/show.html.twig', ['event' => $event, 'isDeleted' => true])
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
