<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerFollowingConfigurationDataLoader;
use Capco\UserBundle\Entity\User;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;

class ViewerFollowingConfigurationProposalResolver implements QueryInterface
{
    public function __construct(
        private readonly ProposalViewerFollowingConfigurationDataLoader $proposalViewerFollowingConfigurationDataLoader,
        private readonly LoggerInterface $logger
    ) {
    }

    public function __invoke(Proposal $proposal, User $viewer): Promise
    {
        try {
            return $this->proposalViewerFollowingConfigurationDataLoader->load(
                compact('proposal', 'viewer')
            );
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Find following proposal by user failed');
        }
    }
}
