<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;

class ProposalViewerVoteResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader, private LoggerInterface $logger)
    {
    }

    public function __invoke(Proposal $proposal, Arg $args, $viewer): Promise
    {
        $user = $this->preventNullableViewer($viewer);

        try {
            $stepId = $args->offsetGet('step');

            return $this->proposalViewerVoteDataLoader->load(compact('proposal', 'stepId', 'user'));
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException($exception->getMessage());
        }
    }
}
