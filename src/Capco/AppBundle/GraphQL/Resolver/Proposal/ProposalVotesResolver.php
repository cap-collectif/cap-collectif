<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;

class ProposalVotesResolver implements ResolverInterface
{
    private ProposalVotesDataLoader $proposalVotesDataLoader;
    private GlobalIdResolver $globalIdResolver;

    public function __construct(
        ProposalVotesDataLoader $proposalVotesDataLoader,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->proposalVotesDataLoader = $proposalVotesDataLoader;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(
        Proposal $proposal,
        Argument $args,
        \ArrayObject $context,
        ?User $viewer = null
    ) {
        $includeNotAccounted = true === $args->offsetGet('includeNotAccounted');
        $includeUnpublished =
            true === $args->offsetGet('includeUnpublished') ||
            ($context->offsetExists('disable_acl') && true === $context->offsetGet('disable_acl'));
        $includeSecretBallot =
            true === $args->offsetGet('includeSecretBallot') ||
            ($context->offsetExists('disable_acl') && true === $context->offsetGet('disable_acl'));
        $step = null;
        if ($args->offsetExists('stepId') && $args->offsetGet('stepId')) {
            $step = $this->globalIdResolver->resolve($args->offsetGet('stepId'), $viewer, $context);
        }

        if ($step instanceof AbstractStep) {
            if (!$this->resolveSecretBallot($step, $viewer, $includeSecretBallot)) {
                return ConnectionBuilder::empty(['totalPointsCount' => 0]);
            }

            return $this->proposalVotesDataLoader->load(
                compact('proposal', 'step', 'args', 'includeUnpublished', 'includeNotAccounted')
            );
        }

        return $this->proposalVotesDataLoader->load(
            compact('proposal', 'args', 'includeUnpublished', 'includeNotAccounted')
        );
    }

    private function resolveSecretBallot(
        AbstractStep $step,
        $viewer,
        bool $includeSecretBallot = false
    ): bool {
        return $includeSecretBallot || $step->canResolverDisplayBallot($viewer);
    }
}
