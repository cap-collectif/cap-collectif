<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class AbstractQuestionNormalizer implements NormalizerInterface, SerializerAwareInterface, CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;

    public function __construct(
        private readonly ObjectNormalizer $normalizer
    ) {}

    public function hasCacheableSupportsMethod(): bool
    {
        return true;
    }

    /**
     * @param mixed      $object
     * @param null|mixed $format
     */
    public function normalize($object, $format = null, array $context = [])
    {
        return $this->normalizer->normalize($object, $format, $context);
        // Let's faster our indexation
        // We can see what's serialized using
        // dump($data);
    }

    /**
     * @param mixed      $data
     * @param null|mixed $format
     */
    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof AbstractQuestion;
    }
}
