<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class ViewerCanAnalyseProposalAnalysisResolver implements ResolverInterface
{
    use ResolverTrait;

    private $authorizationChecker;
    private $tokenStorage;

    public function __construct(AuthorizationChecker $authorizationChecker)
    {
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke($viewer, Proposal $proposal, ?\ArrayObject $context = null): bool
    {
        if ($this->isACLDisabled($context)) {
            return true;
        }

        return $this->isGranted($viewer, $proposal);
    }

    public function isGranted($viewer, Proposal $proposal): bool
    {
        $this->preventNullableViewer($viewer);

        return $this->authorizationChecker->isGranted(
            ProposalAnalysisRelatedVoter::ANALYSE,
            $proposal
        );
    }
}
