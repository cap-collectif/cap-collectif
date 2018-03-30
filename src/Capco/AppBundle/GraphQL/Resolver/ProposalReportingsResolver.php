<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\ReportingRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ProposalReportingsResolver
{
    /**
     * @var ReportingRepository
     */
    private $repository;
    /**
     * @var LoggerInterface
     */
    private $logger;

    public function __construct(ReportingRepository $repository, LoggerInterface $logger)
    {
        $this->repository = $repository;
        $this->logger = $logger;
    }

    public function __invoke(Proposal $proposal, Argument $arguments)
    {
        try {
            $paginator = new Paginator(function (int $offset, int $limit) use ($proposal, $arguments) {
                $field = $arguments->offsetGet('orderBy')['field'];
                $direction = $arguments->offsetGet('orderBy')['direction'];

                return $this->repository->getByProposal($proposal, $offset, $limit, $field, $direction)->getIterator()->getArrayCopy();
            });

            $totalCount = $this->repository->countForProposal($proposal);

            return $paginator->auto($arguments, $totalCount);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException('Could not find proposals for selection step');
        }
    }
}
