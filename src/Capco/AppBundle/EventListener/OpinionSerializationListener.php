<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\AppBundle\Toggle\Manager;
use JMS\Serializer\EventDispatcher\EventSubscriberInterface;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class OpinionSerializationListener implements EventSubscriberInterface
{
    private $toggleManager;
    private $tokenStorage;
    private $router;
    private $voteRepository;

    public function __construct(RouterInterface $router, TokenStorageInterface $tokenStorage, AbstractVoteRepository $voteRepository, Manager $toggleManager)
    {
        $this->router = $router;
        $this->tokenStorage = $tokenStorage;
        $this->toggleManager = $toggleManager;
        $this->voteRepository = $voteRepository;
    }

    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\OpinionVersion',
                'method' => 'onPostOpinionVersion',
            ],
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Opinion',
                'method' => 'onPostOpinion',
            ],
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\OpinionType',
                'method' => 'onPostOpinionType',
            ],
        ];
    }

    public function onPostOpinionVersion(ObjectEvent $event)
    {
        $version = $event->getObject();
        $opinion = $version->getParent();
        $opinionType = $opinion->getOpinionType();
        $step = $opinion->getStep();
        $project = $step->getProjectAbstractStep()->getProject();
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';

        $event->getVisitor()->addData(
            '_links', [
                'show' => $this->router->generate('app_project_show_opinion_version', [
                    'projectSlug' => $project->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                    'opinionSlug' => $opinion->getSlug(),
                    'versionSlug' => $version->getSlug(),
                ], true),
                'report' => $this->router->generate('app_report_opinion_version', [
                    'projectSlug' => $project->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                    'opinionSlug' => $opinion->getSlug(),
                    'versionSlug' => $version->getSlug(),
                ], true),
            ]
        );

        $event->getVisitor()->addData(
            'user_vote', $user === 'anon.' ? null : $this->voteRepository->getByObjectUser('opinionVersion', $version, $user)
        );

        $event->getVisitor()->addData(
            'has_user_reported', $user === 'anon.' ? false : $version->userHasReport($user)
        );
    }

    public function onPostOpinion(ObjectEvent $event)
    {
        $opinion = $event->getObject();
        $opinionType = $opinion->getOpinionType();
        $step = $opinion->getStep();
        $project = $step->getProjectAbstractStep()->getProject();
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';

        $event->getVisitor()->addData(
            '_links', [
                'show' => $this->router->generate('app_project_show_opinion', [
                    'projectSlug' => $project->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                    'opinionSlug' => $opinion->getSlug(),
                ], true),
                'edit' => $this->router->generate('app_project_edit_opinion', [
                    'projectSlug' => $project->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                    'opinionSlug' => $opinion->getSlug(),
                ], true),
                'report' => $this->router->generate('app_report_opinion', [
                    'projectSlug' => $project->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                    'opinionSlug' => $opinion->getSlug(),
                ], true),
                'type' => $this->router->generate('app_project_show_opinions', [
                    'projectSlug' => $project->getSlug(),
                    'stepSlug' => $step->getSlug(),
                    'opinionTypeSlug' => $opinionType->getSlug(),
                ], true),
            ]
        );

        $event->getVisitor()->addData(
            'user_vote', $user === 'anon.' ? null : $this->voteRepository->getByObjectUser('opinion', $opinion, $user)
        );

        $event->getVisitor()->addData(
            'has_user_reported', $user === 'anon.' ? false : $opinion->userHasReport($user)
        );

        if (isset($this->getIncludedGroups($event)['Opinions']) && $this->toggleManager->isActive('votes_evolution')) {
            $event->getVisitor()->addData(
                'history', [
                    'votes' => $this->voteRepository->getHistoryFor('opinion', $opinion),
                ]
            );
        }
    }

    public function onPostOpinionType(ObjectEvent $event)
    {
    }

    protected function getIncludedGroups($event)
    {
        $exclusionStrategy = $event->getContext()->getExclusionStrategy();
        if (!$exclusionStrategy) {
            return [];
        }

        $reflectionClass = new \ReflectionClass('JMS\Serializer\Exclusion\GroupsExclusionStrategy');
        $reflectionProperty = $reflectionClass->getProperty('groups');
        $reflectionProperty->setAccessible(true);

        return $reflectionProperty->getValue($exclusionStrategy);
    }
}
