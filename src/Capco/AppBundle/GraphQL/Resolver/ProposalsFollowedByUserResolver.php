<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
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

    public function __invoke(User $user): array
    {
        try {
            $proposal = $this->proposalRepository->findFollowingProposalByUser($user->getId());
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException('Find following proposal by user failed');
        }

        return $proposal;
    }
}
