<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Resolver\OpinionTypesResolver;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;

class OpinionTypeNormalizer implements
    NormalizerInterface,
    SerializerAwareInterface,
    CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;
    private $router;
    private ObjectNormalizer $normalizer;
    private $resolver;

    public function __construct(
        UrlGeneratorInterface $router,
        ObjectNormalizer $normalizer,
        OpinionTypesResolver $resolver
    ) {
        $this->router = $router;
        $this->normalizer = $normalizer;
        $this->resolver = $resolver;
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

        if (\in_array('ElasticsearchOpinionNestedOpinionType', $groups, true)) {
            return $data;
        }
        if (\in_array('OpinionTypeLinks', $groups)) {
            $availableTypes = $this->resolver->getAvailableLinkTypesForConsultation(
                $object->getConsultation()
            );

            $serializedTypes = [];
            foreach ($availableTypes as $type) {
                $serializedTypes[] = $this->normalizer->normalize($type, $format, $context);
            }

            $data['availableLinkTypes'] = $serializedTypes;

            return $data;
        }
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof OpinionType;
    }
}
