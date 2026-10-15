<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Service\MediaAccessResolver;
use Capco\AppBundle\Service\ParticipantAuthentication;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\ControllerEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Core\Security;

class MediaDownloadSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly MediaRepository $mediaRepository,
        private readonly MediaAccessResolver $access,
        private readonly ParticipantAuthentication $participantAuthentication,
        private readonly Security $security
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::CONTROLLER => 'authorize', KernelEvents::RESPONSE => ['preventCaching', -1024]];
    }

    public function authorize(ControllerEvent $event): void
    {
        $request = $event->getRequest();
        $route = $request->attributes->get('_route');
        if (!\in_array($route, ['app_media_file', 'liip_imagine_filter', 'liip_imagine_filter_runtime'], true)) {
            return;
        }

        $path = $request->attributes->get('path');
        if ('app_media_file' === $route) {
            $path = preg_replace('#^cache/[^/]+/(?:rc/[^/]+/)?#', '', (string) $path);
        }
        // Only registered media paths can reach either files or image generation.
        if (!preg_match('#^([^/]+)/0001/01/([^/]+)$#D', ltrim((string) $path, '/'), $parts)) {
            $event->setController(static fn () => new Response('', Response::HTTP_NOT_FOUND));

            return;
        }
        $medias = $this->mediaRepository->findBy(['context' => $parts[1], 'providerReference' => $parts[2]]);
        if (!$medias) {
            $event->setController(static fn () => new Response('', Response::HTTP_NOT_FOUND));

            return;
        }

        try {
            foreach ($medias as $media) {
                // shortcut: public file delivery until explicit public/private media copies are implemented.
                if (Media::VOCAL_CONTRIBUTION_CONTEXT !== $media->getContext()) {
                    continue;
                }
                if ($this->access->isPrivate($media)) {
                    $this->participantAuthentication->authenticate($request);
                }
                if (!$this->access->canView($media, $this->security->getUser())) {
                    $event->setController(static fn () => new Response('', Response::HTTP_FORBIDDEN));

                    return;
                }
            }
        } catch (ParticipantNotFoundException) {
            $event->setController(static fn () => new Response('', Response::HTTP_FORBIDDEN));
        }
    }

    public function preventCaching(ResponseEvent $event): void
    {
        if (str_starts_with($event->getRequest()->getPathInfo(), '/media/')) {
            $headers = $event->getResponse()->headers;
            $headers->set('Cache-Control', 'private, no-store');
            $headers->remove('ETag');
            $headers->remove('Last-Modified');
            $headers->remove('Expires');
        }
    }
}
