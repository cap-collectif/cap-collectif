<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\GraphQL\Resolver\User\UserContributionByProjectResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserContributionByStepResolver;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
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
    private $projectRepository;

    // local "state" for data used on every User
    private $_capcoProfileEdit;
    private $_allProjects;

    public function __construct(
        UrlGeneratorInterface $router,
        ObjectNormalizer $normalizer,
        Manager $manager,
        UserContributionByProjectResolver $contributionProjectResolver,
        UserContributionByStepResolver $contributionStepResolver,
        ProjectRepository $projectRepository
    ) {
        $this->router = $router;
        $this->normalizer = $normalizer;
        $this->manager = $manager;
        $this->contributionProjectResolver = $contributionProjectResolver;
        $this->contributionStepResolver = $contributionStepResolver;
        $this->projectRepository = $projectRepository;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        if (!$this->_capcoProfileEdit) {
            $this->_capcoProfileEdit = $this->router->generate('capco_profile_edit', [], true);
        }

        $groups =
            isset($context['groups']) && \is_array($context['groups']) ? $context['groups'] : [];

        // We only need Author mapping.
        if (\in_array('ElasticsearchNestedAuthor', $groups, true)) {
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
            foreach ($this->getAllProjects() as $project) {
                $count = $this->contributionProjectResolver->__invoke(
                    $object,
                    $project,
                    new Argument([
                        'first' => 0
                    ])
                )->totalCount;
                $contributionsCountByProject[] = [
                    'project' => ['id' => $project->getId()],
                    'count' => $count
                ];
                foreach ($project->getRealSteps() as $step) {
                    $contributionsCountByStep[] = [
                        'step' => ['id' => $step->getId()],
                        'count' =>
                            0 === $count
                                ? 0
                                : $this->contributionStepResolver->__invoke(
                                    $object,
                                    $step,
                                    new Argument([
                                        'first' => 0
                                    ])
                                )->totalCount
                    ];
                }
            }

            $data['contributionsCountByProject'] = $contributionsCountByProject;
            $data['contributionsCountByStep'] = $contributionsCountByStep;
            $data['totalContributionsCount'] = array_reduce(
                $data['contributionsCountByProject'],
                function ($value, $item) {
                    return $item['count'] + $value;
                },
                0
            );
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

    private function getAllProjects()
    {
        if (!$this->_allProjects) {
            $qb = $this->projectRepository->createQueryBuilder('p');
            $qb->leftJoin('p.steps', 'steps');
            $qb->addSelect('steps');

            $this->_allProjects = $qb->getQuery()->execute();
        }

        return $this->_allProjects;
    }
}
