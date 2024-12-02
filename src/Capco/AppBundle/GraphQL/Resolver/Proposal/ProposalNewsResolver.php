<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\PostRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ProposalNewsResolver implements QueryInterface
{
    public function __construct(private readonly PostRepository $repository, private readonly LoggerInterface $logger)
    {
    }

    public function __invoke(Proposal $proposal, Argument $args): Connection
    {
        try {
            $paginator = new Paginator(function (int $offset, int $limit) use ($proposal, $args) {
                $field = $args->offsetGet('orderBy')['field'];
                $direction = $args->offsetGet('orderBy')['direction'];

                return $this->repository
                    ->getOrderedPublishedPostsByProposal(
                        $proposal,
                        $offset,
                        $field,
                        $limit,
                        $direction
                    )
                    ->getIterator()
                    ->getArrayCopy()
                ;
            });

            $totalCount = $this->repository->countPublishedPostsByProposal($proposal);

            return $paginator->auto($args, $totalCount);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find proposals for selection step');
        }
    }
}
