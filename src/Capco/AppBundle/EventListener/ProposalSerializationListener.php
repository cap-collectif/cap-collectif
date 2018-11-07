<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use JMS\Serializer\EventDispatcher\ObjectEvent;

class ProposalSerializationListener extends AbstractSerializationListener
{
    private $proposalSelectionVoteRepository;
    private $proposalCollectVoteRepository;

    public function __construct(
      ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
      ProposalCollectVoteRepository $proposalCollectVoteRepository
    ) {
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
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
            $selectionVotesCount = $this->proposalSelectionVoteRepository
            ->getCountsByProposalGroupedByStepsId($proposal);

            $collectVotesCount = $this->proposalCollectVoteRepository
            ->getCountsByProposalGroupedByStepsId($proposal);

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
            $event->getVisitor()->addData('votesCountByStep', $data);
        }
    }
}
