<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class ViewerCanAskAProposalRevisionResolver implements ResolverInterface
{
    use ResolverTrait;

    private AuthorizationChecker $authorizationChecker;
    private GlobalIdResolver $globalIdResolver;
    private LoggerInterface $logger;

    public function __construct(
        AuthorizationChecker $authorizationChecker,
        GlobalIdResolver $globalIdResolver,
        LoggerInterface $logger
    ) {
        $this->globalIdResolver = $globalIdResolver;

        $this->authorizationChecker = $authorizationChecker;
        $this->logger = $logger;
    }

    public function isGranted($viewer, $proposalId): bool
    {
        $proposal = $this->globalIdResolver->resolve($proposalId, $viewer);

        return $this->authorizationChecker->isGranted(
            ProposalAnalysisRelatedVoter::VIEW,
            $proposal
        );
    }
}
