<?php

namespace Capco\AppBundle\Normalizer;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\ProjectRepository;
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
    private $projectRepository;

    // local "state" for data used on every User
    private $_capcoProfileEdit;
    private $_allProjects;
    private $contributionSearch;

    public function __construct(
        UrlGeneratorInterface $router,
        ObjectNormalizer $normalizer,
        Manager $manager,
        ContributionSearch $contributionSearch,
        ProjectRepository $projectRepository
    ) {
        $this->router = $router;
        $this->normalizer = $normalizer;
        $this->manager = $manager;
        $this->projectRepository = $projectRepository;
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
            $contributionsCountByConsultation = [];
            /** @var Project $project */
            foreach ($this->getAllProjects() as $project) {
                $count = $this->contributionSearch->countByAuthorAndProject(
                    $object,
                    $project->getId()
                );
                $contributionsCountByProject[] = [
                    'project' => ['id' => $project->getId()],
                    'count' => $count
                ];
                /** @var AbstractStep $step */
                foreach ($project->getRealSteps() as $step) {
                    $contributionsCountByStep[] = [
                        'step' => ['id' => $step->getId()],
                        'count' =>
                            0 === $count
                                ? 0
                                : $this->contributionSearch->countByAuthorAndStep(
                                    $object,
                                    $step->getId()
                                )
                    ];
                    if ($step instanceof ConsultationStep) {
                        /** @var Consultation $consultation */
                        foreach ($step->getConsultations() as $consultation) {
                            $contributionsCountByConsultation[] = [
                                'consultation' => ['id' => $consultation->getId()],
                                'count' =>
                                    0 === $count
                                        ? 0
                                        : $this->contributionSearch->countByAuthorAndConsultation(
                                            $object,
                                            $consultation->getId()
                                        )
                            ];
                        }
                    }
                }
            }

            $data['contributionsCountByProject'] = $contributionsCountByProject;
            $data['contributionsCountByStep'] = $contributionsCountByStep;
            $data['contributionsCountByConsultation'] = $contributionsCountByConsultation;
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
