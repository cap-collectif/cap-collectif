<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Theme;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class ThemeNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;
    private $router;
    private $normalizer;

    public function __construct(UrlGeneratorInterface $router, ObjectNormalizer $normalizer)
    {
        $this->router = $router;
        $this->normalizer = $normalizer;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];
        $data = $this->normalizer->normalize($object, $format, $context);

        if (\in_array('Elasticsearch', $groups)) {
            return $data;
        }

        $data['_links'] = [
            'show' => $this->router->generate(
                'app_theme_show',
                [
                    'slug' => $object->getSlug(),
                ],
                true
            ),
        ];

        return $data;
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof Theme;
    }
}
