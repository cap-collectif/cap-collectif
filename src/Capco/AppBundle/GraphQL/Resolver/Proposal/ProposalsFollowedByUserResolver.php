<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ProposalsFollowedByUserResolver implements ResolverInterface
{
    private $proposalRepository;
    private $logger;

    public function __construct(ProposalRepository $proposalRepository, LoggerInterface $logger)
    {
        $this->proposalRepository = $proposalRepository;
        $this->logger = $logger;
    }

    public function __invoke(User $user, Arg $args): Connection
    {
        $paginator = new Paginator(function (int $offset, int $limit) use ($user) {
            try {
                $proposals = $this->proposalRepository
                    ->findFollowingProposalByUser($user, $offset, $limit)
                    ->getIterator()
                    ->getArrayCopy()
                ;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find following proposal by user failed');
            }

            return $proposals;
        });

        $totalCount = $this->proposalRepository->countFollowingProposalByUser($user);

        return $paginator->auto($args, $totalCount);
    }
}
