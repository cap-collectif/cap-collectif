<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Resolver\ProposalStepVotesResolver;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use JMS\Serializer\Serializer;
use JMS\Serializer\SerializationContext;
use Symfony\Bundle\FrameworkBundle\Routing\Router;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class SelectionStepSerializationListener extends AbstractSerializationListener
{
    private $tokenStorage;
    private $proposalStepVotesResolver;
    protected $serializer;
    protected $router;

    public function __construct(TokenStorageInterface $tokenStorage, ProposalStepVotesResolver $proposalStepVotesResolver, Serializer $serializer, RouterInterface $router)
    {
        $this->tokenStorage = $tokenStorage;
        $this->proposalStepVotesResolver = $proposalStepVotesResolver;
        $this->serializer = $serializer;
        $this->router = $router;
    }

    public static function getSubscribedEvents()
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => 'Capco\AppBundle\Entity\Steps\SelectionStep',
                'method' => 'onPostSelectionStep',
            ],
        ];
    }

    public function onPostSelectionStep(ObjectEvent $event)
    {
        $step = $event->getObject();
        $project = $step->getProject();
        $token = $this->tokenStorage->getToken();
        $user = $token ? $token->getUser() : 'anon.';

        // if ($user !== 'anon.' && $this->eventHasGroup($event, 'UserVotes')) {
        //      $event->getVisitor()->addData(
        //         'creditsLeft', $this->proposalStepVotesResolver->getCreditsLeftForUser($user, $step)
        //     );
        //     $event->getVisitor()->addData(
        //         'userVotesCount', $this->proposalStepVotesResolver->getVotesCountForUserInSelectionStep($user, $step)
        //     );

        //     $userVotes = $this->serializer->serialize([
        //         'data' => $this
        //             ->proposalStepVotesResolver
        //             ->getVotesForUserInSelectionStep($user, $step),
        //     ], 'json', SerializationContext::create()->setGroups(['ProposalSelectionVotes', 'Proposals', 'Steps', 'UsersInfos']));
        //     $event->getVisitor()->addData('userVotes', json_decode($userVotes, true)['data']);
        // }

        $counters = [];
        $counters['proposals'] = count($step->getProposals());
        if ($step->isVotable()) {
            $counters['votes'] = $step->getVotesCount();
            $counters['voters'] = $step->getContributorsCount();
        }

        $remainingTime = $step->getRemainingTime();
        if ($remainingTime) {
            if ($step->isClosed()) {
                $counters['remainingDays'] = $remainingTime['days'];
            } elseif ($step->isOpen()) {
                if ($remainingTime['days'] > 0) {
                    $counters['remainingDays'] = $remainingTime['days'];
                } else {
                    $counters['remainingHours'] = $remainingTime['hours'];
                }
            }
        }

        $event->getVisitor()->addData('counters', $counters);

        if ($project) {
            $event->getVisitor()->addData(
                '_links',
                [
                    'show' => $this->router->generate(
                        'app_project_show_selection',
                        [
                            'projectSlug' => $project->getSlug(),
                            'stepSlug' => $step->getSlug(),
                        ],
                        true
                    ),
                ]
            );
        }
    }
}
