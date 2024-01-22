<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Search\VoteSearch;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class OpinionNormalizer implements NormalizerInterface, SerializerAwareInterface, CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;
    private UrlGeneratorInterface $router;
    private ObjectNormalizer $normalizer;
    private Manager $toggleManager;
    private TokenStorageInterface $tokenStorage;
    private AbstractVoteRepository $voteRepository;
    private VoteSearch $voteSearch;
    private ArgumentRepository $argumentRepository;

    public function __construct(
        UrlGeneratorInterface $router,
        ObjectNormalizer $normalizer,
        TokenStorageInterface $tokenStorage,
        AbstractVoteRepository $voteRepository,
        Manager $toggleManager,
        VoteSearch $voteSearch,
        ArgumentRepository $argumentRepository
    ) {
        $this->router = $router;
        $this->normalizer = $normalizer;
        $this->tokenStorage = $tokenStorage;
        $this->voteRepository = $voteRepository;
        $this->toggleManager = $toggleManager;
        $this->voteSearch = $voteSearch;
        $this->argumentRepository = $argumentRepository;
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

        if (
            \in_array('ElasticsearchArgumentNestedOpinion', $groups, true)
            || \in_array('ElasticsearchVoteNestedOpinion', $groups, true)
            || \in_array('ElasticsearchSourceNestedOpinion', $groups, true)
            || \in_array('ElasticsearchFollowerNestedOpinion', $groups, true)
        ) {
            return $data;
        }

        // We calculate the votes counts directly with ES instead of the symfony command (capco:compute:counters)
        $voteCountOk = 0;
        $voteCountNok = 0;
        $voteCountMitige = 0;
        $votes = $this->voteSearch->getVotesCountsByOpinion($object->getId());
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

        $opinionType = $object->getOpinionType();
        $step = $object->getStep();
        $project =
            $step && $step->getProjectAbstractStep()
                ? $step->getProjectAbstractStep()->getProject()
                : null;
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';
        if ($project) {
            $showUrl = $object->getSlug()
                ? $this->router->generate(
                    'app_project_show_opinion',
                    [
                        'projectSlug' => $project->getSlug(),
                        'stepSlug' => $step->getSlug(),
                        'opinionTypeSlug' => $opinionType->getSlug(),
                        'opinionSlug' => $object->getSlug(),
                    ],
                    true
                )
                : null;
            $data['_links'] = [
                'show' => $showUrl,
                'type' => $this->router->generate(
                    'app_project_show_opinions',
                    [
                        'projectSlug' => $project->getSlug(),
                        'stepSlug' => $step->getSlug(),
                        'consultationSlug' => $opinionType->getConsultation()->getSlug(),
                        'opinionTypeSlug' => $opinionType->getSlug(),
                    ],
                    true
                ),
            ];
        }
        $data['userVote'] =
            'anon.' === $user
                ? null
                : $this->voteRepository->getByObjectUser('opinion', $object, $user);
        $data['hasUserReported'] = 'anon.' === $user ? false : $object->userDidReport($user);
        if (\in_array('Opinions', $groups) && $this->toggleManager->isActive('votes_evolution')) {
            $data['history'] = [
                'votes' => $this->voteRepository->getHistoryFor('opinion', $object),
            ];
        }

        return $data;
    }

    public function supportsNormalization($data, $format = null)
    {
        return $data instanceof Opinion;
    }
}
