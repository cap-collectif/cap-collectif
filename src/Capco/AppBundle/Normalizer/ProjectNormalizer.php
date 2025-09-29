<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectAuthor;
use Capco\AppBundle\Helper\ProjectHelper;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Resolver\ContributionResolver;
use Capco\AppBundle\Resolver\StepResolver;
use Capco\AppBundle\Twig\MediaExtension;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;

class ProjectNormalizer implements NormalizerInterface, SerializerAwareInterface, CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;

    public function __construct(
        private readonly UrlGeneratorInterface $router,
        private readonly ObjectNormalizer $normalizer,
        private readonly ProjectHelper $helper,
        private readonly MediaExtension $mediaExtension,
        private readonly StepResolver $stepResolver,
        private readonly ContributionResolver $contributionResolver,
        private readonly EventRepository $eventRepository
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
        /** @var Project $object */
        $data = $this->normalizer->normalize($object, $format, $context);

        // Full serialization
        if (\in_array('ElasticsearchProject', $groups, true)) {
            $data['contributionsCount'] = $this->contributionResolver->countProjectContributions(
                $object
            );
            $data['restrictedGroupIds'] = $this->getProjectGroupIds($object);
            $data['eventCount'] = $this->eventRepository->countByProject($object->getId());
            $data['authors'] = [];
            /** @var ProjectAuthor $projectAuthor */
            foreach ($object->getAuthors() as $projectAuthor) {
                $data['authors'][] = $this->normalizer->normalize(
                    $projectAuthor->getAuthor(),
                    $format,
                    $context
                );
            }

            if ($object->getOwner()) {
                $data['owner']['username'] = $object->getOwner()->getUsername();
            }

            if ($object->isLocalized()) {
                $data['locale'] = [
                    'id' => $object->getLocale()->getId(),
                    'code' => $object->getLocaleCode(),
                ];
            }

            return $data;
        }

        // We do not need all fields
        if (
            \in_array('ElasticsearchNestedProject', $groups, true)
            || \in_array('ElasticsearchVoteNestedProject', $groups, true)
            || \in_array('ElasticsearchCommentNestedProject', $groups, true)
            || \in_array('ElasticsearchArgumentNestedProject', $groups, true)
            || \in_array('ElasticsearchDebateArgumentNestedProject', $groups, true)
            || \in_array('ElasticsearchSourceNestedProject', $groups, true)
            || \in_array('ElasticsearchReplyNestedProject', $groups, true)
            || \in_array('ElasticsearchOpinionNestedProject', $groups, true)
            || \in_array('ElasticsearchVersionNestedProject', $groups, true)
            || \in_array('ElasticsearchProposalNestedProject', $groups, true)
            || \in_array('ElasticsearchEventNestedProject', $groups, true)
        ) {
            $data['restrictedGroupIds'] = $this->getProjectGroupIds($object);
            $data['authors'] = [];
            foreach ($object->getAuthors() as $projectAuthor) {
                $data['authors'][] = $this->normalizer->normalize(
                    $projectAuthor->getAuthor(),
                    $format,
                    $context
                );
            }

            return $data;
        }

        $links = [
            'show' => $this->stepResolver->getFirstStepLinkForProject($object),
            'external' => $object->getExternalLink(),
        ];

        if (\in_array('ProjectAdmin', $groups, true)) {
            $links['admin'] = $this->router->generate(
                'admin_capco_app_project_edit',
                ['id' => $object->getId()],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }

        $abstractSteps = $this->helper->getAbstractSteps($object);
        $steps = [];
        foreach ($abstractSteps as $abstractStep) {
            $newContext = $context;
            $newContext['groups'] = ['Steps'];
            $steps[] = $this->normalizer->normalize($abstractStep, 'json', $newContext);
        }

        $data['_links'] = $links;
        if ($steps) {
            $data['steps'] = $steps;
        }
        if (\in_array('Projects', $groups, true) && $object->getCover()) {
            $data['cover'] = [
                'url' => $this->mediaExtension->getMediaUrl($object->getCover(), 'default_project'),
            ];
        }

        return $data;
    }

    public function supportsNormalization($data, $format = null): bool
    {
        return $data instanceof Project;
    }

    /**
     * @return array<string>
     */
    private function getProjectGroupIds(Project $project): array
    {
        return array_map(fn ($group) => $group->getId(), $project->getRestrictedViewerGroups()->toArray());
    }
}
