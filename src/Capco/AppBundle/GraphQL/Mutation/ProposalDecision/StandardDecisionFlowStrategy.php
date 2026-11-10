<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProposalDecision;

use Capco\AppBundle\Enum\ProposalStatementErrorCode;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

final class StandardDecisionFlowStrategy implements DecisionFlowStrategyInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly LoggerInterface $logger,
        private readonly DecisionFlowSideEffectsService $decisionFlowSideEffectsService
    ) {}

    public function execute(DecisionFlowContext $context): ?string
    {
        try {
            $this->entityManager->flush();
        } catch (\Exception $exception) {
            $this->logger->alert(
                'An error occurred when editing Post and ProposalDecision with proposal id :'
                    . $context->proposal->getId()
                    . '.'
                    . $exception->getMessage()
            );

            return ProposalStatementErrorCode::INTERNAL_ERROR;
        }

        $this->decisionFlowSideEffectsService->handlePostFlush(
            $context->proposal,
            $context->oldState,
            $context->proposalDecision
        );

        return null;
    }
}
