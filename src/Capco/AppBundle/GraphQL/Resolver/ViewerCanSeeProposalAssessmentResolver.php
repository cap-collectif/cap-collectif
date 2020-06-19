<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class ViewerCanSeeProposalAssessmentResolver
{
    use ResolverTrait;

    private $authorizationChecker;

    public function __construct(AuthorizationChecker $authorizationChecker)
    {
        $this->authorizationChecker = $authorizationChecker;
    }

    public function isGranted($viewer, Proposal $proposal, ?\ArrayObject $context = null): bool
    {
        if ($this->isACLDisabled($context)) {
            return true;
        }
        $this->preventNullableViewer($viewer);

        return $this->authorizationChecker->isGranted(
            ProposalAnalysisRelatedVoter::VIEW,
            $proposal
        );
    }
}
