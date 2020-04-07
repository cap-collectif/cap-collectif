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

abstract class AbstractProposalStepMutation
{
    protected EntityManagerInterface    $entityManager;
    private GlobalIdResolver            $globalIdResolver;
    private SelectionRepository         $selectionRepository;
    private ConnectionBuilder           $connectionBuilder;
    private Publisher                   $publisher;
    private Indexer                     $indexer;

    //restrictions
    protected ?Project                  $project = null;
    protected ?SelectionStep            $selectionStep = null;

    public function __construct(
        EntityManagerInterface  $entityManager,
        GlobalIdResolver        $globalIdResolver,
        SelectionRepository     $selectionRepository,
        ConnectionBuilder       $connectionBuilder,
        Publisher               $publisher,
        Indexer                 $indexer
    ) {
        $this->entityManager = $entityManager;
        $this->globalIdResolver = $globalIdResolver;
        $this->selectionRepository = $selectionRepository;
        $this->connectionBuilder = $connectionBuilder;
        $this->publisher = $publisher;
        $this->indexer = $indexer;
    }

    protected function getConnection(array $proposals, Argument $args): ConnectionInterface
    {
        $connection = $this->connectionBuilder->connectionFromArray(
            array_values($proposals),
            $args
        );
        $connection->setTotalCount(count($proposals));

        return $connection;
    }

    protected function publish(array $proposals): void
    {
        foreach ($proposals as $proposal) {
            $this->publisher->publish(
                CapcoAppBundleMessagesTypes::PROPOSAL_UPDATE_STATUS,
                new Message(
                    json_encode(
                        [
                            'proposalId' => $proposal->getId(),
                            'date' => new \DateTime(),
                        ]
                    )
                )
            );
            $this->indexer->index(Proposal::class, $proposal->getId());
        }
        $this->indexer->finishBulk();
    }

    protected function getSelection(Proposal $proposal, SelectionStep $step): ?Selection
    {
        return $this->selectionRepository->findOneBy([
            'proposal' => $proposal,
            'selectionStep' => $step
        ]);
    }

    protected function getStatus(?string $id, User $user): ?Status
    {
        $status = null;

        if ($id) {
            $status = $this->entityManager->getRepository(Status::class)->find($id);
            if (is_null($status)) {
                throw new UserError(ProposalStepErrorCode::NO_VALID_STATUS);
            }

            $this->project = $status->getStep()->getProject();
            $this->selectionStep = $status->getStep();
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
            && (is_null($this->project) || $proposal->getProject() === $this->project)
            && (is_null($this->selectionStep) || in_array($this->selectionStep, $proposal->getSelectionSteps()))
        ) {
            $proposals[$proposal->getId()] = $proposal;
            $this->project = $proposal->getProject();
        }
    }

    private function addStepIfValid(?AbstractStep $step, array &$steps): void
    {
        if (
            $step
            && $step->isSelectionStep()
            && $step->getProject() === $this->project
        ) {
            $steps[$step->getId()] = $step;
        }
    }

}
