<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProposalDecision;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Enum\ProposalStatementState;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

final class DecisionFlowSideEffectsService
{
    public function __construct(
        private readonly Indexer $indexer,
        private readonly Publisher $publisher
    ) {}

    public function handlePostFlush(
        Proposal $proposal,
        string $oldState,
        ProposalDecision $proposalDecision
    ): void {
        $this->indexProposal($proposal);
        $this->notifyIfDecision($oldState, $proposalDecision);
    }

    private function indexProposal(Proposal $proposal): void
    {
        $this->indexer->index(Proposal::class, $proposal->getId());
        $this->indexer->finishBulk();
    }

    private function notifyIfDecision(string $oldState, ProposalDecision $proposalDecision): void
    {
        $message = [
            'type' => 'decision',
            'proposalId' => $proposalDecision->getProposal()->getId(),
            'date' => $proposalDecision->getUpdatedAt()->format('Y-m-d H:i:s'),
        ];

        if (
            ProposalStatementState::DONE === $proposalDecision->getState()
            && $proposalDecision->getState() != $oldState
        ) {
            $encodedMessage = json_encode($message) ?: '';
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::PROPOSAL_ANALYSE,
                new Message($encodedMessage)
            );
        }
    }
}
