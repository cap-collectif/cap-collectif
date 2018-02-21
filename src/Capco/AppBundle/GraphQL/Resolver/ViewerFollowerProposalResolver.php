<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class ViewerFollowerProposalResolver implements ResolverInterface
{
    private $followerRepository;
    private $logger;

    public function __construct(FollowerRepository $followerRepository, LoggerInterface $logger)
    {
        $this->followerRepository = $followerRepository;
        $this->logger = $logger;
    }

    public function __invoke(Proposal $proposal, $viewer)
    {
        if (!$viewer instanceof User) {
            return null;
        }

        try {
            $follower = $this->followerRepository->findBy(['proposal' => $proposal, 'user' => $viewer]);
            if ($follower && isset($follower[0])) {
                return $follower[0];
            }

            return null;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException('Find following proposal by user failed');
        }
    }
}
