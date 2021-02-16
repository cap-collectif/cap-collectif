<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Search\VoteSearch;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class DebateArgumentNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;

    private const GROUP = 'ElasticsearchDebateArgument';

    private ObjectNormalizer $normalizer;
    private VoteSearch $voteSearch;

    public function __construct(ObjectNormalizer $normalizer, VoteSearch $voteSearch)
    {
        $this->normalizer = $normalizer;
        $this->voteSearch = $voteSearch;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $data = $this->normalizer->normalize($object, $format, $context);
        if (\in_array(self::GROUP, $context['groups'])) {
            $data['votesCount'] = $this->voteSearch
                ->searchDebateArgumentVotes($object, 100)
                ->getTotalCount();
        }

        return $data;
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof DebateArgument;
    }
}
