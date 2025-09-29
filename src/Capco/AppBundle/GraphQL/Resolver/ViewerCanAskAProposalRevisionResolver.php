<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class ViewerCanAskAProposalRevisionResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly Manager $manager
    ) {
    }

    public function isGranted($viewer, $proposalId): bool
    {
        if (!$this->manager->isActive(Manager::proposal_revisions)) {
            return false;
        }
        $proposal = $this->globalIdResolver->resolve($proposalId, $viewer);

        return $this->authorizationChecker->isGranted(
            ProposalAnalysisRelatedVoter::REVISE,
            $proposal
        );
    }
}
