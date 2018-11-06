<?php
namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Resolver\OpinionTypesResolver;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class ProposalNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;
    private $normalizer;
    private $proposalSelectionVoteRepository;
    private $proposalCollectVoteRepository;

    public function __construct(
        ObjectNormalizer $normalizer,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository
    ) {
        $this->normalizer = $normalizer;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
    }

    public function normalize($object, $format = null, array $context = array())
    {
        $groups = array_key_exists('groups', $context) ? $context['groups'] : [];
        $data = $this->normalizer->normalize($object, $format, $context);

        if (\in_array('Elasticsearch', $groups)) {
            $selectionVotesCount = $this->proposalSelectionVoteRepository->getCountsByProposalGroupedByStepsId(
                $object
            );

            $collectVotesCount = $this->proposalCollectVoteRepository->getCountsByProposalGroupedByStepsId(
                $object
            );

            $stepCounter = [];
            foreach ($collectVotesCount as $stepId => $value) {
                $stepCounter[] = [
                    'step' => ['id' => $stepId],
                    'count' => $value,
                ];
            }
            foreach ($selectionVotesCount as $stepId => $value) {
                $stepCounter[] = [
                    'step' => ['id' => $stepId],
                    'count' => $value,
                ];
            }
            $data['votesCountByStep'] = $stepCounter;
        }
        return $data;
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof Proposal;
    }
}
