<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\AbstractVote;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class VoteNormalizer implements NormalizerInterface, SerializerAwareInterface, CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;

    public function __construct(private readonly ObjectNormalizer $normalizer)
    {
    }

    public function hasCacheableSupportsMethod(): bool
    {
        return true;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        return $this->normalizer->normalize($object, $format, $context);
        // Let's faster our vote indexation
        // We can see what's serialized using
        // dump($data);
    }

    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof AbstractVote;
    }
}
