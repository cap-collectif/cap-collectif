<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
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

    public function __construct(AbstractStepRepository $repository,
                                ProposalCollectVoteRepository $proposalCollectVoteRepository,
                                ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
                                LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->abstractStepRepository = $repository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
    }

    public function __invoke(Proposal $proposal, Argument $args, array $context): Connection
    {
        $includeExpired = $args->offsetGet('includeExpired') && isset($context['disable_acl']);
        if ($args->offsetExists('stepId')) {
            try {
                $step = $this->abstractStepRepository->find($args->offsetGet('stepId'));

                if (!$step) {
                    // Maybe throw an exception
                    return $this->resolveAllVotes($proposal, $args, $includeExpired);
                }

                $field = $args->offsetGet('orderBy')['field'];
                $direction = $args->offsetGet('orderBy')['direction'];

                if ($step instanceof CollectStep) {
                    $paginator = new Paginator(function (int $offset, int $limit) use ($proposal, $step, $field, $direction, $includeExpired) {
                        return $this->proposalCollectVoteRepository->getByProposalAndStep($proposal, $step, $limit, $offset, $field, $direction, $includeExpired)->getIterator()->getArrayCopy();
                    });
                    $totalCount = $this->proposalCollectVoteRepository->countVotesByProposalAndStep($proposal, $step, $includeExpired);

                    return $paginator->auto($args, $totalCount);
                }

                if ($step instanceof SelectionStep) {
                    $paginator = new Paginator(function (int $offset, int $limit) use ($proposal, $step, $field, $direction, $includeExpired) {
                        return $this->proposalSelectionVoteRepository->getByProposalAndStep($proposal, $step, $limit, $offset, $field, $direction, $includeExpired)->getIterator()->getArrayCopy();
                    });
                    $totalCount = $this->proposalSelectionVoteRepository->countVotesByProposalAndStep($proposal, $step, $includeExpired);

                    return $paginator->auto($args, $totalCount);
                }

                throw new \RuntimeException('Unknown step type.');
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
                throw new \RuntimeException($exception->getMessage());
            }
        }

        return $this->resolveAllVotes($proposal, $args, $includeExpired);
    }

    public function resolveAllVotes(Proposal $proposal, Argument $args, bool $includeExpired = false): Connection
    {
        $paginator = new Paginator(function () {
            return [];
        });

        $totalCount = 0;
        $totalCount += $this->proposalCollectVoteRepository->countVotesByProposal($proposal, $includeExpired);
        $totalCount += $this->proposalSelectionVoteRepository->countVotesByProposal($proposal, $includeExpired);

        return $paginator->auto($args, $totalCount);
    }
}
