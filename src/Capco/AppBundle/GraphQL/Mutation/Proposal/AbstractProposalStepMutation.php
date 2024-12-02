<?php

namespace Capco\AppBundle\GraphQL\Mutation\Proposal;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ProposalStepErrorCode;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\SelectionRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

abstract class AbstractProposalStepMutation
{
    //restrictions
    protected ?Project $project = null;
    protected ?AbstractStep $step = null;

    public function __construct(protected EntityManagerInterface $entityManager, protected GlobalIdResolver $globalIdResolver, private readonly SelectionRepository $selectionRepository, private readonly ConnectionBuilder $connectionBuilder, private readonly Publisher $publisher, private readonly Indexer $indexer, protected AuthorizationCheckerInterface $authorizationChecker)
    {
    }

    public function isGranted(array $stepsIds, ?User $viewer, string $accessType): bool
    {
        foreach ($stepsIds as $stepId) {
            $step = $this->globalIdResolver->resolve($stepId, $viewer);
            if (
                !$step
                || !$step->getProject()
                || !$this->authorizationChecker->isGranted($accessType, $step->getProject())
            ) {
                return false;
            }
        }

        return true;
    }

    protected function getConnection(array $proposals, Argument $args): ConnectionInterface
    {
        $connection = $this->connectionBuilder->connectionFromArray(
            array_values($proposals),
            $args
        );
        $connection->setTotalCount(\count($proposals));

        return $connection;
    }

    protected function publish(array $proposals): void
    {
        $this->updateStatusPublish($proposals);
        $this->reindexProposals($proposals);
    }

    protected function updateStatusPublish(array $proposals): void
    {
        foreach ($proposals as $proposal) {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::PROPOSAL_UPDATE_STATUS,
                new Message(
                    json_encode([
                        'proposalId' => $proposal->getId(),
                        'date' => new \DateTime(),
                    ])
                )
            );
        }
    }

    protected function reindexProposals(array $proposals): void
    {
        foreach ($proposals as $proposal) {
            $this->indexer->index(Proposal::class, $proposal->getId());
        }
        $this->indexer->finishBulk();
    }

    protected function getSelection(Proposal $proposal, SelectionStep $step): ?Selection
    {
        return $this->selectionRepository->findOneBy([
            'proposal' => $proposal,
            'selectionStep' => $step,
        ]);
    }

    protected function getStatus(?string $id, User $user): ?Status
    {
        $status = null;

        if ($id) {
            $status = $this->entityManager->getRepository(Status::class)->find($id);
            if (null === $status) {
                throw new UserError(ProposalStepErrorCode::NO_VALID_STATUS);
            }

            $this->project = $status->getStep()->getProject();
            $this->step = $status->getStep();
        }

        return $status;
    }

    protected function getProposals(array $ids, User $user): array
    {
        $proposals = [];
        $proposalForm = null;
        foreach ($ids as $id) {
            $this->addProposalIfValid($this->globalIdResolver->resolve($id, $user), $proposals);
        }

        if (empty($proposals)) {
            throw new UserError(ProposalStepErrorCode::NO_VALID_PROPOSAL);
        }

        return $proposals;
    }

    protected function getSteps(array $ids, User $user): array
    {
        $steps = [];
        foreach ($ids as $id) {
            $this->addStepIfValid($this->globalIdResolver->resolve($id, $user), $steps);
        }

        if (empty($steps)) {
            throw new UserError(ProposalStepErrorCode::NO_VALID_STEP);
        }

        return $steps;
    }

    private function addProposalIfValid(?Proposal $proposal, array &$proposals): void
    {
        if (
            $proposal
            && (null === $this->project || $proposal->getProject() === $this->project)
            && (null === $this->step
                || $proposal->getStep() === $this->step
                || \in_array($this->step, $proposal->getSelectionSteps()))
        ) {
            $proposals[$proposal->getId()] = $proposal;
            $this->project = $proposal->getProject();
        }
    }

    private function addStepIfValid(?AbstractStep $step, array &$steps): void
    {
        if ($step && $step->isSelectionStep() && $step->getProject() === $this->project) {
            $steps[$step->getId()] = $step;
        }
    }
}
