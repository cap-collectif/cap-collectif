<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\GraphQL\Resolver\User\UserContributionByProjectResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserContributionByStepResolver;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Routing\RouterInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use JMS\Serializer\EventDispatcher\ObjectEvent;

class UserSerializationListener extends AbstractSerializationListener
{
    private $router;
    private $manager;
    private $contributionProjectResolver;
    private $contributionStepResolver;
    private $projectRepository;

    public function __construct(
        RouterInterface $router,
        Manager $manager,
        UserContributionByProjectResolver $contributionProjectResolver,
        UserContributionByStepResolver $contributionStepResolver,
        ProjectRepository $projectRepository
    ) {
        $this->router = $router;
        $this->manager = $manager;
        $this->contributionProjectResolver = $contributionProjectResolver;
        $this->contributionStepResolver = $contributionStepResolver;
        $this->projectRepository = $projectRepository;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\UserBundle\Entity\User',
                'method' => 'onPostUserSerialize',
            ],
        ];
    }

    public function onPostUserSerialize(ObjectEvent $event)
    {
        $user = $event->getObject();
        // We skip if we are serializing for Elasticsearch
        if (
            isset($this->getIncludedGroups($event)['Elasticsearch']) &&
            !isset($this->getIncludedGroups($event)['ElasticsearchProposal'])
        ) {
            $contributionsCountByProject = [];
            $contributionsCountByStep = [];
            foreach ($this->projectRepository->findAll() as $project) {
                $count = $this->contributionProjectResolver->__invoke(
                    $user,
                    $project,
                    new Argument([
                        'first' => 1,
                    ])
                )->totalCount;
                $contributionsCountByProject[] = [
                    'project' => ['id' => $project->getId()],
                    'count' => $count,
                ];
                foreach ($project->getRealSteps() as $step) {
                    $contributionsCountByStep[] = [
                        'step' => ['id' => $step->getId()],
                        'count' => 0 === $count
                            ? 0
                            : $this->contributionStepResolver->__invoke(
                                $user,
                                $step,
                                new Argument([
                                    'first' => 1,
                                ])
                            )->totalCount,
                    ];
                }
            }
            $event
                ->getVisitor()
                ->addData('contributionsCountByProject', $contributionsCountByProject);
            $event->getVisitor()->addData('contributionsCountByStep', $contributionsCountByStep);

            return;
        }

        $links = [
            'settings' => $this->router->generate('capco_profile_edit', [], true),
        ];
        if ($this->manager->isActive('profiles')) {
            $links['profile'] = $this->router->generate(
                'capco_user_profile_show_all',
                ['slug' => $user->getSlug()],
                true
            );
        }

        $event->getVisitor()->addData('_links', $links);
    }
}
