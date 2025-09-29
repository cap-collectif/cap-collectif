<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Search\VoteSearch;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class OpinionVersionNormalizer implements NormalizerInterface, SerializerAwareInterface, CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;

    public function __construct(
        private readonly ObjectNormalizer $normalizer,
        private readonly VoteSearch $voteSearch,
        private readonly ArgumentRepository $argumentRepository
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

        if (\in_array('ElasticsearchFollowerNestedOpinion', $groups, true)) {
            return $data;
        }

        // We calculate the votes counts directly with ES instead of the symfony command (capco:compute:counters)
        $voteCountOk = 0;
        $voteCountNok = 0;
        $voteCountMitige = 0;
        $votes = $this->voteSearch->getVotesCountsByVersion($object->getId());
        $data['votesCount'] = $votes->getTotalHits();
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
