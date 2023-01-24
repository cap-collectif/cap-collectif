<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectAuthor;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Helper\ProjectHelper;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Resolver\ContributionResolver;
use Capco\AppBundle\Resolver\StepResolver;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Capco\AppBundle\Twig\MediaExtension;
use Symfony\Component\Serializer\SerializerAwareInterface;
use Symfony\Component\Serializer\SerializerAwareTrait;
use Symfony\Component\Serializer\Normalizer\CacheableSupportsMethodInterface;

class ProjectNormalizer implements
    NormalizerInterface,
    SerializerAwareInterface,
    CacheableSupportsMethodInterface
{
    use SerializerAwareTrait;
    private UrlGeneratorInterface $router;
    private ObjectNormalizer $normalizer;
    private ProjectHelper $helper;
    private MediaExtension $mediaExtension;
    private StepResolver $stepResolver;
    private ContributionResolver $contributionResolver;
    private EventRepository $eventRepository;

    public function __construct(
        UrlGeneratorInterface $router,
        ObjectNormalizer $normalizer,
        ProjectHelper $helper,
        MediaExtension $mediaExtension,
        StepResolver $stepResolver,
        ContributionResolver $contributionResolver,
        EventRepository $eventRepository
    ) {
        $this->router = $router;
        $this->normalizer = $normalizer;
        $this->helper = $helper;
        $this->mediaExtension = $mediaExtension;
        $this->stepResolver = $stepResolver;
        $this->contributionResolver = $contributionResolver;
        $this->eventRepository = $eventRepository;
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
            $data['projectStatus'] = $object->getCurrentStepState();
            $data['contributionsCount'] = $this->contributionResolver->countProjectContributions(
                $object
            );
            $data['restrictedViewerIds'] = $this->getRestrictedViewerIds($object);
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
            \in_array('ElasticsearchNestedProject', $groups, true) ||
            \in_array('ElasticsearchVoteNestedProject', $groups, true) ||
            \in_array('ElasticsearchCommentNestedProject', $groups, true) ||
            \in_array('ElasticsearchArgumentNestedProject', $groups, true) ||
            \in_array('ElasticsearchDebateArgumentNestedProject', $groups, true) ||
            \in_array('ElasticsearchSourceNestedProject', $groups, true) ||
            \in_array('ElasticsearchReplyNestedProject', $groups, true) ||
            \in_array('ElasticsearchOpinionNestedProject', $groups, true) ||
            \in_array('ElasticsearchVersionNestedProject', $groups, true) ||
            \in_array('ElasticsearchProposalNestedProject', $groups, true) ||
            \in_array('ElasticsearchEventNestedProject', $groups, true)
        ) {
            $data['restrictedViewerIds'] = $this->getRestrictedViewerIds($object);
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

    private function getRestrictedViewerIds(Project $object): array
    {
        $restrictedViewerIds = [];
        // @var Group $viewerGroup
        foreach ($object->getRestrictedViewerGroups() as $groups) {
            /** @var UserGroup $userGroup */
            foreach ($groups->getUserGroups() as $userGroup) {
                $restrictedViewerIds[] = $userGroup->getUser()->getId();
            }
        }

        return $restrictedViewerIds;
    }
}
