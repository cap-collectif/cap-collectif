<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Proposal;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVotesDataLoader;

class ProposalViewerHasVoteResolver implements ResolverInterface
{
    private $logger;
    private $proposalViewerHasVotesDataLoader;

    public function __construct(
        ProposalViewerHasVotesDataLoader $proposalViewerHasVotesDataLoader,
        LoggerInterface $logger
    ) {
        $this->logger = $logger;
        $this->proposalViewerHasVotesDataLoader = $proposalViewerHasVotesDataLoader;
    }

    public function __invoke(Proposal $proposal, Arg $args, User $user): Promise
    {
        try {
            $stepId = $args->offsetGet('step');

            return $this->proposalViewerHasVotesDataLoader->load(
                compact('proposal', 'stepId', 'user')
            );
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException($exception->getMessage());
        }
    }
}
