<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Commentable\CommentableCommentsResolver;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use JMS\Serializer\EventDispatcher\ObjectEvent;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ProposalSerializationListener extends AbstractSerializationListener
{
    private $proposalSelectionVoteRepository;
    private $proposalCollectVoteRepository;
    private $commentableCommentsResolver;
    private $tokenStorage;

    public function __construct(
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        CommentableCommentsResolver $commentableCommentsResolver,
        TokenStorageInterface $tokenStorage
    ) {
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->commentableCommentsResolver = $commentableCommentsResolver;
        $this->tokenStorage = $tokenStorage;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            [
                'event' => 'serializer.post_serialize',
                'class' => Proposal::class,
                'method' => 'onPostProposal',
            ],
        ];
    }

    public function onPostProposal(ObjectEvent $event)
    {
        $proposal = $event->getObject();

        // For Elasticsearch
        if (isset($this->getIncludedGroups($event)['Elasticsearch'])) {
            $selectionVotesCount = $this->proposalSelectionVoteRepository->getCountsByProposalGroupedByStepsId(
                $proposal
            );

            $collectVotesCount = $this->proposalCollectVoteRepository->getCountsByProposalGroupedByStepsId(
                $proposal
            );

            $data = [];
            foreach ($collectVotesCount as $stepId => $value) {
                $data[] = [
                    'step' => ['id' => $stepId],
                    'count' => $value,
                ];
            }
            foreach ($selectionVotesCount as $stepId => $value) {
                $data[] = [
                    'step' => ['id' => $stepId],
                    'count' => $value,
                ];
            }

            $args = new Argument([
                'orderBy' => ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
            ]);
            $commentsConnection = $this->commentableCommentsResolver->__invoke(
                $event->getObject(),
                $args,
                $this->tokenStorage->getToken() ? $this->tokenStorage->getToken()->getUser() : null
            );

            $event->getVisitor()->addData('votesCountByStep', $data);
            $event
                ->getVisitor()
                ->addData('commentsCount', $commentsConnection->{'totalCountWithAnswers'});
        }
    }
}
