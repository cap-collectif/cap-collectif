<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;
use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerFollowingConfigurationDataLoader;

class ViewerFollowingConfigurationProposalResolver implements ResolverInterface
{
    private $proposalViewerFollowingConfigurationDataLoader;
    private $logger;

    public function __construct(
        ProposalViewerFollowingConfigurationDataLoader $proposalViewerFollowingConfigurationDataLoader,
        LoggerInterface $logger
    ) {
        $this->proposalViewerFollowingConfigurationDataLoader = $proposalViewerFollowingConfigurationDataLoader;
        $this->logger = $logger;
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
