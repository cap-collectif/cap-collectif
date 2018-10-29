<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\MediaBundle\Entity\Media;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use JMS\Serializer\Serializer;
use Sonata\CoreBundle\Twig\Extension\TemplateExtension;
use Symfony\Component\Routing\Exception\RouteNotFoundException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Router;
use Symfony\Component\Serializer\SerializerInterface;

class MediaResponseSerializationListener extends AbstractSerializationListener
{
    protected $router;
    protected $serializer;
    protected $templateExtension;

    public function __construct(
        SerializerInterface $serializer,
        Router $router,
        TemplateExtension $templateExtension
    ) {
        $this->serializer = $serializer;
        $this->router = $router;
        $this->templateExtension = $templateExtension;
    }

    public static function getSubscribedEvents(): array
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
        // We skip the rest if we are serializing for Elasticsearch
        if (isset($this->getIncludedGroups($event)['Elasticsearch'])) {
            return;
        }
        $response = $event->getObject();

        $event->getVisitor()->addData('medias', $this->getMediasMetas($response));
    }

    protected function getMediasMetas(MediaResponse $response): array
    {
        return // many thanks sonata...
            $response
                ->getMedias()
                ->map(function (Media $media) use ($response) {
                    $metas = [];
                    try {
                        $metas['url'] = $this->router->generate(
                            'app_media_response_download',
                            [
                                'responseId' => $response->getId(),
                                'mediaId' => $media->getId(),
                            ],
                            UrlGeneratorInterface::ABSOLUTE_URL
                        );
                        $metas['name'] = $media->getName();
                        $metas['extension'] = $media->getExtension();
                        $metas['size'] = $this->formatBytes($media->getSize());
                    } catch (RouteNotFoundException $e) {
                        return;
                    }

                    return $metas;
                })
                ->filter(function ($element) {
                    return null !== $element;
                })
                ->toArray();
    }

    protected function formatBytes(int $bytes): string
    {
        $units = ['O', 'Ko', 'Mo', 'Go', 'To'];
        $power = $bytes > 0 ? floor(log($bytes, 1024)) : 0;

        return number_format($bytes / 1024 ** $power, 1) . ' ' . $units[$power];
    }
}
