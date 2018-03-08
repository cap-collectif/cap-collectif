<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ArgumentSerializationListener extends AbstractSerializationListener
{
    private $router;
    private $tokenStorage;

    public function __construct(RouterInterface $router, TokenStorageInterface $tokenStorage)
    {
        $this->router = $router;
        $this->tokenStorage = $tokenStorage;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Argument',
                'method' => 'onPostArgument',
            ],
        ];
    }

    public function onPostArgument(ObjectEvent $event)
    {
        // We skip if we are serializing for Elasticsearch
        if (isset($this->getIncludedGroups($event)['Elasticsearch'])) {
            return;
        }

        $argument = $event->getObject();
        $opinion = $argument->getLinkedOpinion();
        $opinionType = $opinion ? $opinion->getOpinionType() : null;
        $step = $opinion ? $opinion->getStep() : null;
        $project = $step ? $step->getProject() : null;

        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';

        $showUrl = '';

        if (!$opinion || !$opinionType || !$step) {
            throw new \Exception(
                'Error during serialization of argument ' . $argument->getId()
            );
        }

        if ($project) {
            $parent = $argument->getParent();
            if ($parent instanceof Opinion) {
                $showUrl = $this->router->generate(
                        'app_project_show_opinion',
                        [
                            'projectSlug' => $project->getSlug(),
                            'stepSlug' => $step->getSlug(),
                            'opinionTypeSlug' => $opinionType->getSlug(),
                            'opinionSlug' => $parent->getSlug(),
                        ],
                        true
                    ) . '#arg-' . $argument->getId();
            } elseif ($parent instanceof OpinionVersion) {
                $showUrl = $this->router->generate(
                        'app_project_show_opinion_version',
                        [
                            'projectSlug' => $project->getSlug(),
                            'stepSlug' => $step->getSlug(),
                            'opinionTypeSlug' => $opinionType->getSlug(),
                            'opinionSlug' => $opinion->getSlug(),
                            'versionSlug' => $parent->getSlug(),
                        ],
                        true
                    ) . '#arg-' . $argument->getId();
            }

            $event->getVisitor()->addData('_links', ['show' => $showUrl]);
        }

        $event->getVisitor()->addData(
            'hasUserVoted', 'anon.' === $user ? false : $argument->userHasVote($user)
        );

        $event->getVisitor()->addData(
            'hasUserReported', 'anon.' === $user ? false : $argument->userHasReport($user)
        );
    }
}
