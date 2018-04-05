<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class UserFollowingProposalResolver implements ResolverInterface
{
    private $userRepository;
    private $logger;

    public function __construct(UserRepository $userRepository, LoggerInterface $logger)
    {
        $this->userRepository = $userRepository;
        $this->logger = $logger;
    }

    public function __invoke(Proposal $proposal): array
    {
        try {
            $users = $this->userRepository->findUsersFollowingAProposal($proposal);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException('Find following proposal by user failed');
        }

        return $users;
    }
}
