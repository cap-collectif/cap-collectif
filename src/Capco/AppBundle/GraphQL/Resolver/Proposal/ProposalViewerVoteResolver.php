<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Proposal;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVotesDataLoader;

class ProposalViewerVoteResolver implements ResolverInterface
{
    private $logger;
    private $proposalViewerVotesDataLoader;

    public function __construct(
        ProposalViewerVotesDataLoader $proposalViewerVotesDataLoader,
        LoggerInterface $logger
    ) {
        $this->logger = $logger;
        $this->proposalViewerVotesDataLoader = $proposalViewerVotesDataLoader;
    }

    public function __invoke(Proposal $proposal, Arg $args, User $user): Promise
    {
        try {
            $stepId = $args->offsetGet('step');

            return $this->proposalViewerVotesDataLoader->load(
                compact('proposal', 'stepId', 'user')
            );
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException($exception->getMessage());
        }
    }
}
