<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class ProposalVotesResolver implements ResolverInterface
{
    private $logger;
    private $proposalVotesDataLoader;
    private $globalIdResolver;

    public function __construct(
        LoggerInterface $logger,
        ProposalVotesDataLoader $proposalVotesDataLoader,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->logger = $logger;
        $this->proposalVotesDataLoader = $proposalVotesDataLoader;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Proposal $proposal, Argument $args, \ArrayObject $context, $user)
    {
        $includeUnpublished =
            true === $args->offsetGet('includeUnpublished') ||
            ($context->offsetExists('disable_acl') && true === $context->offsetGet('disable_acl'));
        if ($args->offsetExists('stepId')) {
            try {
                $step = $this->globalIdResolver->resolve($args->offsetGet('stepId'), $user);

                return $this->proposalVotesDataLoader->load(
                    compact('proposal', 'step', 'args', 'includeUnpublished')
                );
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException($exception->getMessage());
            }
        }

        return $this->proposalVotesDataLoader->load(
            compact('proposal', 'args', 'includeUnpublished')
        );
    }
}
