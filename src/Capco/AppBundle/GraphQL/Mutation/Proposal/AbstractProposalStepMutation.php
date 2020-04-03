<?php


namespace Capco\AppBundle\GraphQL\Mutation\Proposal;


use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
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
    protected ?Project                  $project = null;
    private Publisher                   $publisher;
    private Indexer                     $indexer;

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

    protected function publish(Proposal $proposal): void
    {
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
        $this->indexer->finishBulk();
    }

    protected function getSelection(Proposal $proposal, SelectionStep $step): ?Selection
    {
        return $this->selectionRepository->findOneBy([
            'proposal' => $proposal,
            'selectionStep' => $step
        ]);
    }

    protected function getProposals(array $ids, User $user): array
    {
        $proposals = [];
        $proposalForm = null;
        foreach ($ids as $id) {
            $this->addProposalIfValid($this->globalIdResolver->resolve($id, $user), $proposals);
        }

        if (empty($proposals)) {
            throw new UserError('no valid proposal');
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
            throw new UserError('no valid step');
        }

        return $steps;
    }

    private function addProposalIfValid(?Proposal $proposal, array &$proposals): void
    {
        if (
            $proposal
            && (is_null($this->project) || $proposal->getProject() === $this->project)
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
