<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Search\ContributionSearch;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class UserNormalizer implements NormalizerInterface, SerializerAwareInterface, CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;

    private const RELATED_GROUPS = [
        'ElasticsearchArgumentNestedAuthor',
        'ElasticsearchSourceNestedAuthor',
        'ElasticsearchOpinionNestedAuthor',
        'ElasticsearchVersionNestedAuthor',
        'ElasticsearchFollowerNestedAuthor',
        'ElasticsearchReplyNestedAuthor',
        'ElasticsearchVoteNestedAuthor',
        'ElasticsearchProposalNestedAuthor',
        'ElasticsearchThemeNestedAuthor',
        'ElasticsearchProjectNestedAuthor',
        'ElasticsearchEventNestedAuthor',
        'ElasticsearchReplyNestedProject',
        'ElasticsearchArgumentNestedProject',
        'ElasticsearchDebateArgumentNestedProject',
        'ElasticsearchSourceNestedProject',
        'ElasticsearchOpinionNestedProject',
        'ElasticsearchVersionNestedProject',
        'ElasticsearchProposalNestedProject',
        'ElasticsearchEventNestedProject',
        'ElasticsearchResponseNestedReply',
        'ElasticsearchNestedAuthor',
    ];

    private $router;
    private readonly ObjectNormalizer $normalizer;
    private $manager;
    private $contributionProjectResolver;
    private $contributionStepResolver;
    private $contributionSearch;

    // local "state" for data used on every User
    private $_capcoProfileEdit;
    private $_allProjects;

    public function __construct(
        UrlGeneratorInterface $router,
        ObjectNormalizer $normalizer,
        Manager $manager,
        ContributionSearch $contributionSearch
    ) {
        $this->router = $router;
        $this->normalizer = $normalizer;
        $this->manager = $manager;
        $this->contributionSearch = $contributionSearch;
    }

    public function hasCacheableSupportsMethod(): bool
    {
        return true;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        if (!$this->_capcoProfileEdit) {
            $this->_capcoProfileEdit = $this->router->generate('capco_profile_edit', [], true);
        }

        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];

        // We only need Author mapping
        foreach (self::RELATED_GROUPS as $relatedGroup) {
            if (\in_array($relatedGroup, $groups, true)) {
                return [
                    'id' => $object->getId(),
                    'username' => $object->getUsername(),
                    'email' => $object->getEmail(),
                    'enabled' => $object->isEnabled(),
                    'userType' => $object->getUserType()
                        ? ['id' => $object->getUserType()->getId()]
                        : null,
                    'isOnlyProjectAdmin' => $object->isOnlyProjectAdmin(),
                    'organizationId' => $object->getOrganizationId(),
                ];
            }
        }

        // We need fullmapping
        $data = $this->normalizer->normalize($object, $format, $context);

        if (\in_array('Elasticsearch', $groups)) {
            $this->addAggregateCounter('participations', $data, $object);
            $this->addAggregateCounter('contributions', $data, $object);
            $this->addAggregateCounter('votes', $data, $object);
        }

        $links = [
            'settings' => $this->_capcoProfileEdit,
        ];

        if ($this->manager->isActive('profiles')) {
            $links['profile'] = $this->router->generate(
                'capco_user_profile_show_all',
                ['slug' => $object->getSlug()],
                RouterInterface::ABSOLUTE_URL
            );
        }

        $data['_links'] = $links;
        $data['objectType'] = $object::getElasticsearchTypeName();

        return $data;
    }

    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof User;
    }

    private function addAggregateCounter(string $aggregatePrefix, array &$data, $object): void
    {
        $resultsCountByProject = [];
        $resultsCountByStep = [];
        $resultsCountByConsultation = [];

        $results = $this->contributionSearch->getSubmissionsByAuthor($object, $aggregatePrefix);
        $data['total' . ucfirst($aggregatePrefix) . 'Count'] = $results->getTotalHits();

        foreach (
            $results->getAggregation($aggregatePrefix . 'ByProject')['buckets']
            as $projectResults
        ) {
            $resultsCountByProject[] = [
                'count' => $projectResults['doc_count'],
                'project' => ['id' => $projectResults['key']],
            ];
            if (!empty($projectResults[$aggregatePrefix . 'ByStep']['buckets'])) {
                foreach ($projectResults[$aggregatePrefix . 'ByStep']['buckets'] as $stepResults) {
                    $resultsCountByStep[] = [
                        'count' => $stepResults['doc_count'],
                        'step' => ['id' => $stepResults['key']],
                    ];
                    if (
                        'participations' === $aggregatePrefix
                        && !empty($stepResults[$aggregatePrefix . 'ByConsultation']['buckets'])
                    ) {
                        foreach (
                            $stepResults[$aggregatePrefix . 'ByConsultation']['buckets']
                            as $consultationResults
                        ) {
                            $resultsCountByConsultation[] = [
                                'count' => $consultationResults['doc_count'],
                                'consultation' => ['id' => $consultationResults['key']],
                            ];
                        }
                    }
                }
            }
        }

        $data[$aggregatePrefix . 'CountByProject'] = $resultsCountByProject;
        $data[$aggregatePrefix . 'CountByStep'] = $resultsCountByStep;
        $data[$aggregatePrefix . 'CountByConsultation'] = $resultsCountByConsultation;
    }
}
