<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Repository\ProposalVoteRepository;
use Capco\AppBundle\Repository\ResponseRepository;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\Serializer;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ProposalSerializationListener extends AbstractSerializationListener
{
    private $router;
    private $tokenStorage;
    private $proposalVoteRepository;
    private $responseRepository;
    protected $serializer;

    public function __construct(RouterInterface $router, TokenStorageInterface $tokenStorage, ProposalVoteRepository $proposalVoteRepository, ResponseRepository $responseRepository, Serializer $serializer)
    {
        $this->router = $router;
        $this->tokenStorage = $tokenStorage;
        $this->proposalVoteRepository = $proposalVoteRepository;
        $this->responseRepository = $responseRepository;
        $this->serializer = $serializer;
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

        $userIsAuthorOrAdmin = $user !== 'anon.' && ($user->getId() === $proposal->getAuthor()->getId() || $user->isAdmin());
        $responses = $this
            ->responseRepository
            ->getByProposal($proposal->getId(), $userIsAuthorOrAdmin)
        ;

        $context = new SerializationContext();
        $context->setGroups(['Proposals']);
        $serializedResponses = $this->serializer->serialize(
            ['data' => $responses],
            'json',
            $context
        );

        $event->getVisitor()->addData(
            'responses',
            json_decode($serializedResponses, true)['data']
        );

        if (isset($this->getIncludedGroups($event)['ProposalUserData'])) {
            $event->getVisitor()->addData(
                'hasUserReported', $user === 'anon.' ? false : $proposal->userHasReport($user)
            );
        }
    }
}
