<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Proposal;
use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerIsFollowingDataLoader;

class ViewerFollowProposalResolver implements ResolverInterface
{
    use ResolverTrait;
    private $logger;
    private $proposalviewerFollowDataLoader;

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
