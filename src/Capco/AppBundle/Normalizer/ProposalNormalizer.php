<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Commentable\CommentableCommentsResolver;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;
use Overblog\GraphQLBundle\Definition\Argument;

class ProposalNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;
    private $normalizer;
    private $proposalSelectionVoteRepository;
    private $proposalCollectVoteRepository;
    private $commentableCommentsResolver;
    private $tokenStorage;

    public function __construct(
        ObjectNormalizer $normalizer,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        CommentableCommentsResolver $commentableCommentsResolver,
        TokenStorageInterface $tokenStorage
    ) {
        $this->normalizer = $normalizer;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->commentableCommentsResolver = $commentableCommentsResolver;
        $this->tokenStorage = $tokenStorage;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];
        $data = $this->normalizer->normalize($object, $format, $context);

        if (\in_array('Elasticsearch', $groups, true)) {
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

            $args = new Argument([
                'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
            ]);
            $commentsConnection = $this->commentableCommentsResolver->__invoke(
                $object,
                $args,
                $this->tokenStorage->getToken() ? $this->tokenStorage->getToken()->getUser() : null
            );

            $data['commentsCount'] = $commentsConnection->{'totalCountWithAnswers'};
        }

        return $data;
    }

    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof Proposal;
    }
}
