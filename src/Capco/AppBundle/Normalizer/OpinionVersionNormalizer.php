<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Search\VoteSearch;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Repository\ArgumentRepository;
use Symfony\Component\Serializer\SerializerAwareTrait;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;

class OpinionVersionNormalizer implements
    NormalizerInterface,
    SerializerAwareInterface,
    CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;
    private ObjectNormalizer $normalizer;
    private VoteSearch $voteSearch;
    private ArgumentRepository $argumentRepository;

    public function __construct(
        ObjectNormalizer $normalizer,
        VoteSearch $voteSearch,
        ArgumentRepository $argumentRepository
    ) {
        $this->normalizer = $normalizer;
        $this->voteSearch = $voteSearch;
        $this->argumentRepository = $argumentRepository;
    }

    public function hasCacheableSupportsMethod(): bool
    {
        return true;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $data = $this->normalizer->normalize($object, $format, $context);

        // We calculate the votes counts directly with ES instead of the symfony command (capco:compute:counters)
        $voteCountOk = 0;
        $voteCountNok = 0;
        $voteCountMitige = 0;
        $votes = $this->voteSearch->getVotesCountsByVersion($object->getId());
        $data['votesCount'] = $votes->getResponse()->getData()['hits']['total']['value'];
        foreach ($votes->getAggregation('votesCounts')['buckets'] as $voteCounts) {
            $voteValue = $voteCounts['key'];
            if (OpinionVote::VOTE_OK === $voteValue) {
                $voteCountOk = $voteCounts['doc_count'];
            }

            if (OpinionVote::VOTE_MITIGE === $voteValue) {
                $voteCountMitige = $voteCounts['doc_count'];
            }

            if (OpinionVote::VOTE_NOK === $voteValue) {
                $voteCountNok = $voteCounts['doc_count'];
            }
        }

        $data['votesCountNok'] = $voteCountNok;
        $data['votesCountOk'] = $voteCountOk;
        $data['votesCountMitige'] = $voteCountMitige;

        $data['argumentsCount'] = $this->argumentRepository->countByContributionAndType($object);

        return $data;
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof OpinionVersion;
    }
}
