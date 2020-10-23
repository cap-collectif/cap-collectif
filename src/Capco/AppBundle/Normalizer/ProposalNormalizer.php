<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Commentable\CommentableCommentsDataLoader;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;

class ProposalNormalizer implements
    NormalizerInterface,
    SerializerAwareInterface,
    CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;
    private ObjectNormalizer $normalizer;
    private ProposalSelectionVoteRepository $proposalSelectionVoteRepository;
    private ProposalCollectVoteRepository $proposalCollectVoteRepository;
    private CommentableCommentsDataLoader $commentableCommentsDataLoader;

    public function __construct(
        ObjectNormalizer $normalizer,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        CommentableCommentsDataLoader $commentableCommentsDataLoader
    ) {
        $this->normalizer = $normalizer;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->commentableCommentsDataLoader = $commentableCommentsDataLoader;
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

        if (\in_array('ElasticsearchNestedProposal', $groups)) {
            return $data;
        }
        $data['progressStatus'] = $object->getGlobalProgressStatus();
        $data = $this->countPointsAndVotes($object, $data);

        if ($object->isCommentable()) {
            $args = new Argument([
                'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
                'first' => 0,
            ]);
            $commentsConnection = $this->commentableCommentsDataLoader->resolve(
                $object,
                $args,
                null
            );
            $data['commentsCount'] = $commentsConnection->{'totalCountWithAnswers'};
        } else {
            $data['commentsCount'] = 0;
        }

        return $data;
    }

    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof Proposal;
    }

    private function countPointsAndVotes(Proposal $proposal, array $data): array
    {
        $selectionCount = $this->proposalSelectionVoteRepository->getCountsByProposalGroupedByStepsId(
            $proposal
        );
        $collectCount = $this->proposalCollectVoteRepository->getCountsByProposalGroupedByStepsId(
            $proposal
        );

        $selectionVotesCount = $selectionCount['votesBySteps'];
        $selectionVotesCountPoints = $selectionCount['pointsBySteps'];
        $collectVotesCount = $collectCount['votesBySteps'];
        $collectVotesCountPoints = $collectCount['pointsBySteps'];
        $stepVoteCounter = [];
        $totalVoteCount = 0;
        foreach ($collectVotesCount as $stepId => $value) {
            $stepVoteCounter[] = [
                'step' => ['id' => $stepId],
                'count' => $value,
            ];
            $totalVoteCount += $value;
        }
        foreach ($selectionVotesCount as $stepId => $value) {
            $stepVoteCounter[] = [
                'step' => ['id' => $stepId],
                'count' => $value,
            ];
            $totalVoteCount += $value;
        }

        $data['votesCountByStep'] = $stepVoteCounter;
        $data['votesCount'] = $totalVoteCount;

        $stepPointsCounter = [];
        $totalPointsCount = 0;

        foreach ($collectVotesCountPoints as $stepId => $value) {
            $stepPointsCounter[] = [
                'step' => ['id' => $stepId],
                'count' => $value,
            ];
            $totalPointsCount += $value;
        }
        foreach ($selectionVotesCountPoints as $stepId => $value) {
            $stepPointsCounter[] = [
                'step' => ['id' => $stepId],
                'count' => $value,
            ];
            $totalPointsCount += $value;
        }

        $data['pointsCountByStep'] = $stepPointsCounter;
        $data['pointsCount'] = $totalPointsCount;

        return $data;
    }
}
