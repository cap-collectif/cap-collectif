<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Repository\ResponseRepository;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use JMS\Serializer\SerializationContext;
use JMS\Serializer\Serializer;
use Sonata\MediaBundle\Twig\Extension\MediaExtension;
use Symfony\Component\Routing\Exception\RouteNotFoundException;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ProposalSerializationListener extends AbstractSerializationListener
{
    private $router;
    private $tokenStorage;
    private $proposalSelectionVoteRepository;
    private $proposalCollectVoteRepository;
    private $responseRepository;
    private $mediaExtension;
    protected $serializer;

    public function __construct(RouterInterface $router, TokenStorageInterface $tokenStorage, ProposalSelectionVoteRepository $proposalSelectionVoteRepository, ResponseRepository $responseRepository, Serializer $serializer, ProposalCollectVoteRepository $proposalCollectVoteRepository)
    {
        $this->router = $router;
        $this->tokenStorage = $tokenStorage;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->responseRepository = $responseRepository;
        $this->mediaExtension = $mediaExtension;
        $this->serializer = $serializer;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
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

        $selectionVotesCount = $this->proposalSelectionVoteRepository
            ->getCountsByProposalGroupedBySteps($proposal);

        $collectVotesCount = $this->proposalCollectVoteRepository
            ->getCountsByProposalGroupedBySteps($proposal);

        $event->getVisitor()->addData(
            'votesCountByStepId',
            $selectionVotesCount + $collectVotesCount
        );

        $userIsAuthorOrAdmin = $user !== 'anon.' && ($user->getId() === $proposal->getAuthor()->getId() || $user->isAdmin());
        $responses = $this
            ->responseRepository
            ->getByProposal($proposal, $userIsAuthorOrAdmin)
        ;

        $serializedResponses = $this->serializer->serialize(
            $responses,
            'json',
            (new SerializationContext())->setGroups(['Proposals'])
        );

        $event->getVisitor()->addData(
            'responses',
            json_decode($serializedResponses, true)
        );

        if ($proposal->getMedia()) {
            try {
                $event->getVisitor()->addData(
                    'media', [
                        'url' => $this->mediaExtension->path($proposal->getMedia(), 'proposal'),
                    ]
                );
            } catch (RouteNotFoundException $e) {
                // Avoid some SonataMedia problems
            }
        }

        if (isset($this->getIncludedGroups($event)['ProposalUserData'])) {
            $event->getVisitor()->addData(
                'hasUserReported', $user === 'anon.' ? false : $proposal->userHasReport($user)
            );
            $event->getVisitor()->addData(
                'userHasVote', $user === 'anon.' ? false : $proposal->userHasVote($user)
            );
        }
    }
}
