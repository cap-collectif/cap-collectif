<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerIsFollowingDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;

class ViewerFollowProposalResolver implements QueryInterface
{
    use ResolverTrait;
    private readonly LoggerInterface $logger;
    private readonly ProposalViewerIsFollowingDataLoader $proposalviewerFollowDataLoader;

    public function __construct(
        LoggerInterface $logger,
        ProposalViewerIsFollowingDataLoader $proposalviewerFollowDataLoader
    ) {
        $this->logger = $logger;
        $this->proposalviewerFollowDataLoader = $proposalviewerFollowDataLoader;
    }

    public function __invoke(Proposal $proposal, $viewer): Promise
    {
        $viewer = $this->preventNullableViewer($viewer);

        try {
            return $this->proposalviewerFollowDataLoader->load(compact('proposal', 'viewer'));
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Find following proposal by user failed');
        }
    }
}
