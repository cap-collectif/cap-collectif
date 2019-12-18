<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Event;
use Sonata\MediaBundle\Twig\Extension\MediaExtension;
use Symfony\Component\Routing\Exception\RouteNotFoundException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class EventNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;
    private $router;
    private $normalizer;
    private $mediaExtension;

    public function __construct(
        UrlGeneratorInterface $router,
        ObjectNormalizer $normalizer,
        MediaExtension $mediaExtension
    ) {
        $this->router = $router;
        $this->normalizer = $normalizer;
        $this->mediaExtension = $mediaExtension;
    }

    /** @var Event $object */
    public function normalize($object, $format = null, array $context = [])
    {
        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];
        $data = $this->normalizer->normalize($object, $format, $context);

        if (\in_array('Elasticsearch', $groups)) {
            $data['isRegistrable'] = $object->isRegistrable();

            return $data;
        }

        $data['_links'] = [
            'show' => $this->router->generate(
                'app_event',
                [
                    'slug' => $object->getSlug(),
                ],
                true
            ),
        ];

        try {
            $data['media']['url'] = $this->mediaExtension->path($object->getMedia(), 'slider');
        } catch (RouteNotFoundException $e) {
            // Avoid some SonataMedia problems
        }

        return $data;
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof Event;
    }
}
