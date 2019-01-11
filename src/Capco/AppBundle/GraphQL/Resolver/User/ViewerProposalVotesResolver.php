<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\Resolver\ProposalStepVotesResolver;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class ViewerProposalVotesResolver implements ResolverInterface
{
    private $logger;
    private $abstractStepRepository;
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;
    private $helper;

    public function __construct(
        AbstractStepRepository $repository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        LoggerInterface $logger,
        ProposalStepVotesResolver $helper
    ) {
        $this->logger = $logger;
        $this->abstractStepRepository = $repository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->helper = $helper;
    }

    public function __invoke(User $user, Argument $args): Connection
    {
        try {
            $step = $this->abstractStepRepository->find($args->offsetGet('stepId'));

            if (!$step) {
                $connection = ConnectionBuilder::connectionFromArray([], $args);
                $connection->totalCount = 0;

                return $connection;
            }

            return $this->getConnectionForStepAndUser($step, $user, $args);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException($exception->getMessage());
        }
    }

    public function getConnectionForStepAndUser(
        AbstractStep $step,
        User $user,
        Argument $args
    ): Connection {
        $field = $args->offsetGet('orderBy')['field'];
        $direction = $args->offsetGet('orderBy')['direction'];

        if ($step instanceof CollectStep) {
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $user,
                $step,
                $field,
                $direction
            ) {
                return $this->proposalCollectVoteRepository->getByAuthorAndStep(
                    $user,
                    $step,
                    $limit,
                    $offset,
                    $field,
                    $direction
                )
                    ->getIterator()
                    ->getArrayCopy();
            });
            $totalCount = $this->proposalCollectVoteRepository->countByAuthorAndStep($user, $step);
        } else {
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $user,
                $step,
                $field,
                $direction
            ) {
                return $this->proposalSelectionVoteRepository->getByAuthorAndStep(
                    $user,
                    $step,
                    $limit,
                    $offset,
                    $field,
                    $direction
                )
                    ->getIterator()
                    ->getArrayCopy();
            });
            $totalCount = $this->proposalSelectionVoteRepository->countByAuthorAndStep(
                $user,
                $step
            );
        }
        $connection = $paginator->auto($args, $totalCount);

        $creditsSpent = $this->helper->getSpentCreditsForUser($user, $step);
        $connection->{'creditsSpent'} = $creditsSpent;
        $connection->{'creditsLeft'} = $step->getBudget() - $creditsSpent;

        return $connection;
    }
}
