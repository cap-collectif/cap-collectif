<?php

declare(strict_types=1);

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Security\ProposalAnalysisRelatedVoter;
use Capco\AppBundle\Security\ProposalVoter;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class ProposalAuthorEmailResolver implements QueryInterface
{
    public function __construct(
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly Manager $manager
    ) {
    }

    public function __invoke(Proposal $proposal): ?string
    {
        if (
            !$this->authorizationChecker->isGranted(ProposalVoter::EDIT, $proposal)
            && (!$this->manager->isActive(Manager::proposal_revisions)
                || !$this->authorizationChecker->isGranted(ProposalAnalysisRelatedVoter::REVISE, $proposal))
        ) {
            return null;
        }

        $author = $proposal->getAuthor();

        return $author instanceof ContributorInterface ? $author->getEmail() : null;
    }
}
