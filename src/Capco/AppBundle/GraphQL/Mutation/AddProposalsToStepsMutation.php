<?php


namespace Capco\AppBundle\GraphQL\Mutation;

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
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class AddProposalsToStepsMutation implements MutationInterface
{
    private EntityManagerInterface  $entityManager;
    private GlobalIdResolver        $globalIdResolver;
    private SelectionRepository     $selectionRepository;
    private ConnectionBuilder       $connectionBuilder;
    private ?Project                $project = null;
    private Publisher               $publisher;
    private Indexer                 $indexer;

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

    public function __invoke(Argument $args, User $user): array
    {
        $error = null;
        $proposals = [];
        $this->project = null;

        try {
            $proposals = $this->getProposals($args->offsetGet('proposalIds'), $user);
            $steps = $this->getSteps($args->offsetGet('stepsIds'), $user);
            $this->addStepsToProposals($steps, $proposals);
        } catch (UserError $userError) {
            $error = $userError->getMessage();
        }

        $connection = $this->connectionBuilder->connectionFromArray(array_values($proposals), $args);
        $connection->setTotalCount(count($proposals));

        return [
            'proposals' => $connection,
            'error' => $error
        ];
    }

    private function addStepsToProposals(array $steps, array $proposals): void
    {
        foreach ($proposals as $proposal) {
            $hasChanged = false;
            foreach ($steps as $step) {
                if ($this->addOneStepToOneProposal($step, $proposal)) {
                    $hasChanged = true;
                }
            }

            if ($hasChanged) {
                $this->entityManager->flush();
                $this->publish($proposal);
            }
        }
    }

    private function addOneStepToOneProposal(SelectionStep $step, Proposal $proposal): bool
    {
        if ($this->selectionRepository->findOneBy([
            'proposal' => $proposal,
            'selectionStep' => $step
        ])) {
            return false;
        }

        $selection = new Selection();
        $selection->setSelectionStep($step);
        $selection->setStatus(null);
        $proposal->addSelection($selection);

        $this->entityManager->persist($selection);

        return true;
    }

    private function getProposals(array $ids, User $user): array
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

    private function getSteps(array $ids, User $user): array
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

    private function publish(Proposal $proposal): void
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
        //@todo replace by Proposal::class ?
        $this->indexer->index(\get_class($proposal), $proposal->getId());
        $this->indexer->finishBulk();
    }

}
