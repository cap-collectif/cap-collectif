<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Twig\MediaExtension;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;

class EventNormalizer implements
    NormalizerInterface,
    SerializerAwareInterface,
    CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;
    private $router;
    private ObjectNormalizer $normalizer;
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

    public function hasCacheableSupportsMethod(): bool
    {
        return true;
    }

    /** @var Event */
    public function normalize($object, $format = null, array $context = [])
    {
        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];
        $data = $this->normalizer->normalize($object, $format, $context);
        $trans = [];
        $translations = $object->getTranslations();
        foreach ($translations as $translation) {
            $locale = $translation->getLocale();
            $slug = $translation->getSlug();
            $trans[] = [
                'locale' => $locale,
                'slug' => $slug,
            ];
        }
        $data['translations'] = $trans;
        if (\in_array('ElasticsearchEvent', $groups, true)) {
            $data['isRegistrable'] = $object->isRegistrable();

            return $data;
        }

        $data['_links'] = [
            'show' => $this->router->generate(
                'app_event_show',
                [
                    'slug' => self::getSlug($object),
                ],
                true
            ),
        ];

        $data['media']['url'] = $this->mediaExtension->getMediaUrl(
            $object->getMedia(),
            'default_slider'
        );

        return $data;
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof Event;
    }

    private static function getSlug(Event $event): string
    {
        if ('' !== $event->getSlug(null, true)) {
            return $event->getSlug(null, true);
        }

        foreach ($event->getTranslations() as $translation) {
            if ('' !== $translation->getSlug()) {
                return $translation->getSlug();
            }
        }

        return (string) $event->getId();
    }
}
