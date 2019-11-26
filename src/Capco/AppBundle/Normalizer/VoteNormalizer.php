<?php

namespace Capco\AppBundle\Normalizer;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Entity\AbstractVote;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class VoteNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;

    private $normalizer;

    public function __construct(
        ObjectNormalizer $normalizer
    ) {
        $this->normalizer = $normalizer;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $data = $this->normalizer->normalize($object, $format, $context);

        // Let's faster our vote indexation
        // We can see what's serialized using
        // dump($data);

        return $data;
    }

    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof AbstractVote;
    }
}
