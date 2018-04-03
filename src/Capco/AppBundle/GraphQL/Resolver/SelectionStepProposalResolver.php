<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\ProposalRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class SelectionStepProposalResolver
{
    private $logger;
    private $proposalRepository;

    public function __construct(ProposalRepository $repository, LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->proposalRepository = $repository;
    }

    public function __invoke(SelectionStep $selectionStep, Argument $args): Connection
    {
        try {
            $paginator = new Paginator(function (int $offset, int $limit) use ($selectionStep, $args) {
                $field = $args->offsetGet('orderBy')['field'];
                $direction = $args->offsetGet('orderBy')['direction'];

                return $this->proposalRepository->getOrderedProposalsForSelectionStep($selectionStep, $field, $direction, $limit, $offset)->getIterator()->getArrayCopy();
            });

            $totalCount = $this->proposalRepository->countForSelectionStep($selectionStep);

            return $paginator->auto($args, $totalCount);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException('Could not find proposals for selection step');
        }
    }
}
