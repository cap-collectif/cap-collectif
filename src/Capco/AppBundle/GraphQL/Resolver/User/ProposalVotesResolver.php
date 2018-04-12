<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Resolver\ProposalStepVotesResolver;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ProposalVotesResolver
{
    private $logger;
    private $abstractStepRepository;
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;
    private $helper;

    public function __construct(AbstractStepRepository $repository,
                                ProposalCollectVoteRepository $proposalCollectVoteRepository,
                                ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
                                LoggerInterface $logger,
                                ProposalStepVotesResolver $helper)
    {
        $this->logger = $logger;
        $this->abstractStepRepository = $repository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->helper = $helper;
    }

    public function __invoke(User $user, Argument $args): Connection
    {
        try {
            $step = $this->abstractStepRepository->find($args['step']);
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            if ($step instanceof CollectStep) {
                $paginator = new Paginator(function (int $offset, int $limit) use ($user, $step, $field, $direction) {
                    return $this->proposalCollectVoteRepository->getByAuthorAndStep($user, $step, $limit, $offset, $field, $direction)->getIterator()->getArrayCopy();
                });
                $totalCount = $this->proposalCollectVoteRepository->countByAuthorAndStep($user, $step);
            } else {
                $paginator = new Paginator(function (int $offset, int $limit) use ($user, $step, $field, $direction) {
                    return $this->proposalSelectionVoteRepository->getByAuthorAndStep($user, $step, $limit, $offset, $field, $direction)->getIterator()->getArrayCopy();
                });
                $totalCount = $this->proposalSelectionVoteRepository->countByAuthorAndStep($user, $step);
            }
            $connection = $paginator->auto($args, $totalCount);

            $creditsSpent = $this->helper->getSpentCreditsForUser($user, $step);
            $connection->{'creditsSpent'} = $creditsSpent;
            $connection->{'creditsLeft'} = $step->getBudget() - $creditsSpent;

            return $connection;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException($exception->getMessage());
        }
    }
}
