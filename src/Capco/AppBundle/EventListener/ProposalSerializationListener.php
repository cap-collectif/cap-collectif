<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Repository\ProposalVoteRepository;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ProposalSerializationListener extends AbstractSerializationListener
{
    private $router;
    private $tokenStorage;
    private $proposalVoteRepository;

    public function __construct(RouterInterface $router, TokenStorageInterface $tokenStorage, ProposalVoteRepository $proposalVoteRepository)
    {
        $this->router = $router;
        $this->tokenStorage = $tokenStorage;
        $this->proposalVoteRepository = $proposalVoteRepository;
    }

    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Proposal',
                'method' => 'onPostProposal',
            ],
        ];
    }

    public function onPostProposal(ObjectEvent $event)
    {
        $proposal = $event->getObject();
        $step = $proposal->getStep();
        $project = $step->getProject();
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';

        if ($project) {
            $showUrl = $this->router->generate(
                'app_project_show_proposal',
                [
                    'proposalSlug' => $proposal->getSlug(),
                    'projectSlug' => $project->getSlug(),
                    'stepSlug' => $step->getSlug(),
                ],
                true
            );

            $indexUrl = $this->router->generate(
                'app_project_show_collect',
                [
                    'projectSlug' => $project->getSlug(),
                    'stepSlug' => $step->getSlug(),
                ],
                true
            );

            $event->getVisitor()->addData(
                '_links',
                [
                    'show' => $showUrl,
                    'index' => $indexUrl,
                ]
            );
        }

        $votesCount = $this->proposalVoteRepository
            ->getCountsByStepsForProposal($proposal);

        $event->getVisitor()->addData(
            'votesCountBySelectionSteps',
            $votesCount
        );

        if (isset($this->getIncludedGroups($event)['ProposalUserData'])) {
            $event->getVisitor()->addData(
                'hasUserReported', $user === 'anon.' ? false : $proposal->userHasReport($user)
            );
        }
    }
}
