<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ProposalFollowerConnection implements QueryInterface
{
    public function __construct(private readonly UserRepository $userRepository, private readonly LoggerInterface $logger)
    {
    }

    public function __invoke(Proposal $proposal, Arg $args): Connection
    {
        $paginator = new Paginator(function ($offset, $limit) use ($proposal, $args) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $orderBy = [$field => $direction];
            $criteria = [
                'proposal' => $proposal,
            ];

            try {
                $followers = $this->userRepository
                    ->getByCriteriaOrdered($criteria, $orderBy, $limit, $offset)
                    ->getIterator()
                    ->getArrayCopy()
                ;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find following proposal by user failed');
            }

            return $followers;
        });

        $totalCount = $this->userRepository->countFollowerForProposal($proposal);

        return $paginator->auto($args, $totalCount);
    }
}
