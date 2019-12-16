<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Search\ContributionSearch;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;
use Symfony\Component\Routing\RouterInterface;

class UserNormalizer implements NormalizerInterface, SerializerAwareInterface
{
    use SerializerAwareTrait;

    private $router;
    private $normalizer;
    private $manager;
    private $contributionProjectResolver;
    private $contributionStepResolver;

    // local "state" for data used on every User
    private $_capcoProfileEdit;
    private $_allProjects;
    private $contributionSearch;

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

    public function normalize($object, $format = null, array $context = [])
    {
        if (!$this->_capcoProfileEdit) {
            $this->_capcoProfileEdit = $this->router->generate('capco_profile_edit', [], true);
        }

        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];

        // We only need Author mapping.
        if (
            \in_array('ElasticsearchArgumentNestedAuthor', $groups, true) ||
            \in_array('ElasticsearchSourceNestedAuthor', $groups, true) ||
            \in_array('ElasticsearchOpinionNestedAuthor', $groups, true) ||
            \in_array('ElasticsearchVersionNestedAuthor', $groups, true) ||
            \in_array('ElasticsearchReplyNestedAuthor', $groups, true) ||
            \in_array('ElasticsearchVoteNestedAuthor', $groups, true) ||
            \in_array('ElasticsearchProposalNestedAuthor', $groups, true) ||
            \in_array('ElasticsearchThemeNestedAuthor', $groups, true) ||
            \in_array('ElasticsearchProjectNestedAuthor', $groups, true) ||
            \in_array('ElasticsearchEventNestedAuthor', $groups, true) ||
            \in_array('ElasticsearchReplyNestedProject', $groups, true) ||
            \in_array('ElasticsearchArgumentNestedProject', $groups, true) ||
            \in_array('ElasticsearchSourceNestedProject', $groups, true) ||
            \in_array('ElasticsearchOpinionNestedProject', $groups, true) ||
            \in_array('ElasticsearchVersionNestedProject', $groups, true) ||
            \in_array('ElasticsearchProposalNestedProject', $groups, true) ||
            \in_array('ElasticsearchEventNestedProject', $groups, true) ||
            \in_array('ElasticsearchNestedAuthor', $groups, true)
        ) {
            return [
                'id' => $object->getId(),
                'username' => $object->getUsername(),
                'email' => $object->getEmail(),
                'userType' => $object->getUserType()
                    ? ['id' => $object->getUserType()->getId()]
                    : null
            ];
        }

        // We need fullmapping
        $data = $this->normalizer->normalize($object, $format, $context);

        if (\in_array('Elasticsearch', $groups)) {
            $contributionsCountByProject = [];
            $contributionsCountByStep = [];
            $contributionsCountByConsultation = [];

            $contributions = $this->contributionSearch->getContributionsByAuthor($object);
            $data['totalContributionsCount'] = $contributions->getTotalHits();

            foreach (
                $contributions->getAggregation('projects')['buckets']
                as $projectContributions
            ) {
                $contributionsCountByProject[] = [
                    'count' => $projectContributions['doc_count'],
                    'project' => ['id' => $projectContributions['key']]
                ];
                if (!empty($projectContributions['steps']['buckets'])) {
                    foreach ($projectContributions['steps']['buckets'] as $stepContributions) {
                        $contributionsCountByStep[] = [
                            'count' => $stepContributions['doc_count'],
                            'step' => ['id' => $stepContributions['key']]
                        ];
                        if (!empty($stepContributions['consultations']['buckets'])) {
                            foreach (
                                $stepContributions['consultations']['buckets']
                                as $consultationContributions
                            ) {
                                $contributionsCountByConsultation[] = [
                                    'count' => $consultationContributions['doc_count'],
                                    'consultation' => ['id' => $consultationContributions['key']]
                                ];
                            }
                        }
                    }
                }
            }

            $data['contributionsCountByProject'] = $contributionsCountByProject;
            $data['contributionsCountByStep'] = $contributionsCountByStep;
            $data['contributionsCountByConsultation'] = $contributionsCountByConsultation;
        }

        $links = [
            'settings' => $this->_capcoProfileEdit
        ];

        if ($this->manager->isActive('profiles')) {
            $links['profile'] = $this->router->generate(
                'capco_user_profile_show_all',
                ['slug' => $object->getSlug()],
                RouterInterface::ABSOLUTE_URL
            );
        }

        $data['_links'] = $links;

        return $data;
    }

    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof User;
    }
}
