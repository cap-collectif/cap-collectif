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

    private AuthorizationCheckerInterface $authorizationChecker;
    private GlobalIdResolver $globalIdResolver;
    private Manager $manager;

    public function __construct(
        AuthorizationCheckerInterface $authorizationChecker,
        GlobalIdResolver $globalIdResolver,
        Manager $manager
    ) {
        $this->globalIdResolver = $globalIdResolver;

        $this->authorizationChecker = $authorizationChecker;
        $this->manager = $manager;
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
