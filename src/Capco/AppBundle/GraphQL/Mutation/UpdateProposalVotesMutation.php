<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\GraphQL\ConnectionBuilderInterface;
use Capco\AppBundle\GraphQL\DataLoader\User\ViewerProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Psr\Log\LoggerInterface;

class UpdateProposalVotesMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly AbstractStepRepository $stepRepo,
        private readonly ViewerProposalVotesDataLoader $viewerProposalVotesDataLoader,
        private readonly LoggerInterface $logger,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly ProposalVoteAccountHandler $proposalVoteAccountHandler,
        private readonly Indexer $indexer,
        private readonly ConnectionBuilderInterface $connectionBuilder
    ) {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $stepId = $input->offsetGet('step');
        $step = $this->globalIdResolver->resolve($stepId, $viewer);
        if (!$step) {
            throw new UserError(sprintf('Unknown step with id "%s"', $stepId));
        }
        $votesInput = $input->offsetGet('votes');

        if ($this->em->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
            $this->em->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }

        if ($step instanceof SelectionStep) {
            $votes = $this->proposalSelectionVoteRepository
                ->getByAuthorAndStep($viewer, $step, -1, 0)
                ->getIterator()
            ;
        } elseif ($step instanceof CollectStep) {
            $votes = $this->proposalCollectVoteRepository
                ->getByAuthorAndStep($viewer, $step, -1, 0)
                ->getIterator()
            ;
        } else {
            throw new UserError(sprintf('Not good step with id "%s"', $stepId));
        }
        foreach ($votes as $key => $vote) {
            $voteInput = null;
            foreach ($votesInput as $currentInput) {
                if ((int) $vote->getId() === (int) $currentInput['id']) {
                    $voteInput = $currentInput;
                }
            }
            if ($voteInput) {
                $vote->setPrivate($voteInput['anonymous']);
                if ($step->canContribute($viewer) && $step->isVotesRanking()) {
                    $vote->setPosition(array_search($voteInput, $votesInput, true));
                }
            } else {
                if (!$step->canContribute($viewer)) {
                    throw new UserError('This step is not contribuable.');
                }
                $this->em->remove($vote);
                $this->indexer->remove(ClassUtils::getClass($vote), $vote->getId());
                $this->indexer->index(
                    ClassUtils::getClass($vote->getProposal()),
                    $vote->getProposal()->getId()
                );

                $this->proposalVoteAccountHandler->checkIfUserVotesAreStillAccounted(
                    $step,
                    $vote,
                    $viewer,
                    false
                );
                unset($votes[$key]);
            }
        }
        $this->em->flush();
        if (!empty($votes->getArrayCopy())) {
            $this->reindexObjects($votes->getArrayCopy());
        }
        $this->indexer->finishBulk();

        $this->viewerProposalVotesDataLoader->invalidate($viewer);

        return [
            'step' => $step,
            'votes' => $this->getConnection($votes->getArrayCopy(), $input),
            'viewer' => $viewer,
        ];
    }

    protected function getConnection(array $votes, Argument $args): ConnectionInterface
    {
        $connection = $this->connectionBuilder->connectionFromArray(array_values($votes), $args);
        $connection->setTotalCount(\count($votes));

        return $connection;
    }

    private function reindexObjects(array $objects)
    {
        foreach ($objects as $object) {
            $this->indexer->index(ClassUtils::getClass($object), $object->getId());

            if (method_exists($object, 'getProposal') && $object->getProposal()) {
                $this->indexer->index(
                    ClassUtils::getClass($object->getProposal()),
                    $object->getProposal()->getId()
                );
            }
        }
    }
}
