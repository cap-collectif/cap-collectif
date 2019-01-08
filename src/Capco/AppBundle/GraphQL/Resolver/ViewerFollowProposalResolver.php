<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalviewerFollowDataLoader;
use GraphQL\Executor\Promise\Promise;

class ViewerFollowProposalResolver implements ResolverInterface
{
    private $logger;
    private $proposalviewerFollowDataLoader;

    public function __construct(
        LoggerInterface $logger,
        ProposalviewerFollowDataLoader $proposalviewerFollowDataLoader
    ) {
        $this->logger = $logger;
        $this->proposalviewerFollowDataLoader = $proposalviewerFollowDataLoader;
    }

    public function __invoke(Proposal $proposal, User $viewer): Promise
    {
        try {
            return $this->proposalviewerFollowDataLoader->load(compact('proposal', 'viewer'));
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Find following proposal by user failed');
        }
    }
}
