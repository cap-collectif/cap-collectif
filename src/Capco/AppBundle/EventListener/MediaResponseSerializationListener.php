<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\MediaBundle\Entity\Media;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use JMS\Serializer\Serializer;
use Sonata\CoreBundle\Twig\Extension\TemplateExtension;
use Symfony\Bridge\Twig\Extension\RoutingExtension;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

class MediaResponseSerializationListener extends AbstractSerializationListener
{
    protected $routingExtension;
    protected $serializer;
    protected $templateExtension;

    public function __construct(Serializer $serializer, RoutingExtension $routingExtension, TemplateExtension $templateExtension)
    {
        $this->serializer = $serializer;
        $this->routingExtension = $routingExtension;
        $this->templateExtension = $templateExtension;
    }

    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => MediaResponse::class,
                'method' => 'onPostResponse',
            ],
        ];
    }

    public function onPostResponse(ObjectEvent $event)
    {
        $response = $event->getObject();

        $event->getVisitor()->addData('medias', $this->getMediasMetas($response));
    }

    protected function getMediasMetas(MediaResponse $response): array
    {
        return $response->getMedias()
            ->map(function (Media $media) use ($response) {
                $metas = [];
                try {
                    $metas['url'] = $this->routingExtension->getPath(
                        'app_media_response_download',
                        [
                            'responseId' => $response->getId(),
                            'mediaId' => $this->templateExtension->getUrlsafeIdentifier($media),
                        ]
                    );
                    $metas['name'] = $media->getName();
                    $metas['extension'] = $media->getExtension();
                    $metas['size'] = $this->formatBytes($media->getSize());
                } catch (RouteNotFoundException $e) {
                    return;
                }

                return $metas;
            })->filter(function ($element) { // many thanks sonata...
                return null !== $element;
            })->toArray();
    }

    protected function formatBytes(int $bytes): string
    {
        $units = ['O', 'Ko', 'Mo', 'Go', 'To'];
        $power = $bytes > 0 ? floor(log($bytes, 1024)) : 0;

        return number_format($bytes / (1024 ** $power), 1) . ' ' . $units[$power];
    }
}
