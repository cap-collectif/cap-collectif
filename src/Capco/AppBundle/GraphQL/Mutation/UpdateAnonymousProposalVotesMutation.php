<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class UpdateAnonymousProposalVotesMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly ProposalVoteAccountHandler $proposalVoteAccountHandler,
        private readonly Indexer $indexer,
        private readonly ConnectionBuilder $connectionBuilder,
        private readonly ParticipantHelper $participantHelper
    ) {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $stepId = $input->offsetGet('step');
        $step = $this->globalIdResolver->resolve($stepId);
        if (!$step) {
            throw new UserError(sprintf('Unknown step with id "%s"', $stepId));
        }
        $votesInput = $input->offsetGet('votes');

        $token = $input->offsetGet('token');
        $participant = $this->participantHelper->getParticipantByToken($token);

        if ($this->em->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
            $this->em->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }

        if ($step instanceof SelectionStep) {
            $votes = $this->proposalSelectionVoteRepository->findBy(['selectionStep' => $step, 'participant' => $participant]);
        } elseif ($step instanceof CollectStep) {
            $votes = $this->proposalCollectVoteRepository->findBy(['collectStep' => $step, 'participant' => $participant]);
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
                if ($step->canContribute(null) && $step->isVotesRanking()) {
                    $vote->setPosition(array_search($voteInput, $votesInput, true));
                }
            } else {
                if (!$step->canContribute(null)) {
                    throw new UserError('This step is not contribuable.');
                }
                $this->em->remove($vote);
                $this->indexer->remove(ClassUtils::getClass($vote), $vote->getId());
                $this->indexer->index(
                    ClassUtils::getClass($vote->getProposal()),
                    $vote->getProposal()->getId()
                );

                $this->proposalVoteAccountHandler->checkIfParticipantVotesAreStillAccounted(
                    $step,
                    $vote,
                    $participant,
                    false
                );
                unset($votes[$key]);
            }
        }
        $this->em->flush();
        if (!empty($votes)) {
            $this->reindexObjects($votes);
        }
        $this->indexer->finishBulk();

        return [
            'step' => $step,
            'votes' => $this->getConnection($votes, $input),
            'participant' => $participant,
        ];
    }

    protected function getConnection(array $votes, Argument $args): ConnectionInterface
    {
        $connection = $this->connectionBuilder->connectionFromArray(array_values($votes), $args);
        $connection->setTotalCount(\count($votes));

        return $connection;
    }

    private function reindexObjects(array $objects): void
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
