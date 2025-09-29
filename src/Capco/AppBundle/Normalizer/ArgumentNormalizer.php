<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Search\VoteSearch;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class ArgumentNormalizer implements NormalizerInterface, SerializerAwareInterface, CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;

    public function __construct(
        private readonly ObjectNormalizer $normalizer,
        private readonly VoteSearch $voteSearch
    ) {
    }

    public function hasCacheableSupportsMethod(): bool
    {
        return true;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $data = $this->normalizer->normalize($object, $format, $context);
        $data['votesCount'] = $this->voteSearch->searchArgumentVotes($object, 1)->getTotalCount();

        return $data;
    }

    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof Argument;
    }
}
