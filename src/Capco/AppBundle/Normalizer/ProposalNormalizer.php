<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\GraphQL\DataLoader\Commentable\CommentableCommentsDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalResponsesResolver;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Repository\ProposalStepPaperVoteCounterRepository;
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
    private ProposalStepPaperVoteCounterRepository $proposalStepPaperVoteCounterRepository;
    private CommentableCommentsDataLoader $commentableCommentsDataLoader;
    private ProposalResponsesResolver $proposalResponsesResolver;

    public function __construct(
        ObjectNormalizer $normalizer,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalStepPaperVoteCounterRepository $proposalStepPaperVoteCounterRepository,
        CommentableCommentsDataLoader $commentableCommentsDataLoader,
        ProposalResponsesResolver $proposalResponsesResolver
    ) {
        $this->normalizer = $normalizer;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalStepPaperVoteCounterRepository = $proposalStepPaperVoteCounterRepository;
        $this->commentableCommentsDataLoader = $commentableCommentsDataLoader;
        $this->proposalResponsesResolver = $proposalResponsesResolver;
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
        foreach (
            $publicResponses = $this->proposalResponsesResolver->__invoke(
                $object,
                null,
                new \ArrayObject(['disable_acl' => false])
            )
            as $publicResponse
        ) {
            if (
                !($publicResponse instanceof MediaResponse) &&
                ($publicResponseValue['id'] = $publicResponse->getId())
            ) {
                $responseValue = $publicResponse->getValue();
                if (!\is_array($responseValue)) {
                    $publicResponseValue['textValue'] = $responseValue;
                } else {
                    $publicResponseValue['objectValue'] = $responseValue;
                }
                $data['responses'][] = $publicResponseValue;
            }
        }

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
        $stepCounter = [];
        $totalNumericVoteCount = 0;
        $totalNumericPointsCount = 0;
        $totalPaperVoteCount = 0;
        $totalPaperPointsCount = 0;
        $totalVoteCount = 0;
        $totalPointsCount = 0;

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

        foreach ($collectVotesCount as $stepId => $value) {
            $stepCounter[$stepId] = self::emptyStepCounter($stepId);
            $stepCounter[$stepId]['numericVotes'] += $value;
            $stepCounter[$stepId]['votes'] += $value;
            $totalNumericVoteCount += $value;
            $totalVoteCount += $value;
        }
        foreach ($selectionVotesCount as $stepId => $value) {
            $stepCounter[$stepId] = self::emptyStepCounter($stepId);
            $stepCounter[$stepId]['numericVotes'] += $value;
            $stepCounter[$stepId]['votes'] += $value;
            $totalNumericVoteCount += $value;
            $totalVoteCount += $value;
        }

        foreach ($collectVotesCountPoints as $stepId => $value) {
            if (!isset($stepCounter[$stepId])) {
                $stepCounter[$stepId] = self::emptyStepCounter($stepId);
            }
            $stepCounter[$stepId]['numericPoints'] += $value;
            $stepCounter[$stepId]['points'] += $value;
            $totalNumericPointsCount += $value;
            $totalPointsCount += $value;
        }
        foreach ($selectionVotesCountPoints as $stepId => $value) {
            if (!isset($stepCounter[$stepId])) {
                $stepCounter[$stepId] = self::emptyStepCounter($stepId);
            }
            $stepCounter[$stepId]['numericPoints'] += $value;
            $stepCounter[$stepId]['points'] += $value;
            $totalNumericPointsCount += $value;
            $totalPointsCount += $value;
        }

        $paperVoteCounters = $this->proposalStepPaperVoteCounterRepository->findBy([
            'proposal' => $proposal,
        ]);
        foreach ($paperVoteCounters as $paperVoteCounter) {
            $stepId = $paperVoteCounter->getStep()->getId();
            if (!isset($stepCounter[$stepId])) {
                $stepCounter[$stepId] = self::emptyStepCounter($stepId);
            }
            $stepCounter[$stepId]['paperVotes'] += $paperVoteCounter->getTotalCount();
            $stepCounter[$stepId]['paperPoints'] += $paperVoteCounter->getTotalPointsCount();
            $stepCounter[$stepId]['votes'] += $paperVoteCounter->getTotalCount();
            $stepCounter[$stepId]['points'] += $paperVoteCounter->getTotalPointsCount();

            $totalPaperVoteCount += $paperVoteCounter->getTotalCount();
            $totalPaperPointsCount += $paperVoteCounter->getTotalPointsCount();
            $totalVoteCount += $paperVoteCounter->getTotalCount();
            $totalPointsCount += $paperVoteCounter->getTotalPointsCount();
        }

        $data['countByStep'] = array_values($stepCounter);
        $data['numericVotesCount'] = $totalNumericVoteCount;
        $data['numericPointsCount'] = $totalNumericPointsCount;
        $data['paperVotesCount'] = $totalPaperVoteCount;
        $data['paperPointsCount'] = $totalPaperPointsCount;
        $data['votesCount'] = $totalVoteCount;
        $data['pointsCount'] = $totalPointsCount;

        return $data;
    }

    private static function emptyStepCounter(string $stepId): array
    {
        return [
            'step' => ['id' => $stepId],
            'numericVotes' => 0,
            'paperVotes' => 0,
            'votes' => 0,
            'numericPoints' => 0,
            'paperPoints' => 0,
            'points' => 0,
        ];
    }
}
