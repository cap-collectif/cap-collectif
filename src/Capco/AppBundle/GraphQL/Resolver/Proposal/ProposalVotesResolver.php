<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalVotesResolver implements ResolverInterface
{
    private $proposalVotesDataLoader;
    private $globalIdResolver;

    public function __construct(
        ProposalVotesDataLoader $proposalVotesDataLoader,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->proposalVotesDataLoader = $proposalVotesDataLoader;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Proposal $proposal, Argument $args, \ArrayObject $context, $user)
    {
        $includeNotAccounted = true === $args->offsetGet('includeNotAccounted');
        $includeUnpublished =
            true === $args->offsetGet('includeUnpublished') ||
            ($context->offsetExists('disable_acl') && true === $context->offsetGet('disable_acl'));

        if ($args->offsetExists('stepId')) {
            $step = $this->globalIdResolver->resolve($args->offsetGet('stepId'), $user, $context);

            return $this->proposalVotesDataLoader->load(
                compact('proposal', 'step', 'args', 'includeUnpublished', 'includeNotAccounted')
            );
        }

        return $this->proposalVotesDataLoader->load(
            compact('proposal', 'args', 'includeUnpublished', 'includeNotAccounted')
        );
    }
}
