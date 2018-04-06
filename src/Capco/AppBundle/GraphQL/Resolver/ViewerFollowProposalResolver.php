<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class ViewerFollowProposalResolver implements ResolverInterface
{
    private $userRepository;
    private $logger;

    public function __construct(UserRepository $userRepository, LoggerInterface $logger)
    {
        $this->userRepository = $userRepository;
        $this->logger = $logger;
    }

    public function __invoke(Proposal $proposal, $viewer): bool
    {
        if (!$viewer instanceof User) {
            return false;
        }

        try {
            return $this->userRepository->isViewerFollowingProposal($proposal, $viewer);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException('Find following proposal by user failed');
        }
    }
}
