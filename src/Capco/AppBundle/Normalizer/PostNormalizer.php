<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Twig\MediaExtension;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class PostNormalizer implements NormalizerInterface, SerializerAwareInterface, CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;

    public function __construct(
        private readonly UrlGeneratorInterface $router,
        private readonly ObjectNormalizer $normalizer,
        private readonly MediaExtension $mediaExtension
    ) {
    }

    public function hasCacheableSupportsMethod(): bool
    {
        return true;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];
        $data = $this->normalizer->normalize($object, $format, $context);

        if (\in_array('Elasticsearch', $groups)) {
            return $data;
        }

        $data['_links']['show'] = $this->router->generate(
            'app_blog_show',
            ['slug' => $object->translate()->getSlug()],
            true
        );

        $data['media']['url'] = $this->mediaExtension->getMediaUrl(
            $object->getMedia(),
            'default_slider'
        );

        return $data;
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof Post;
    }
}
