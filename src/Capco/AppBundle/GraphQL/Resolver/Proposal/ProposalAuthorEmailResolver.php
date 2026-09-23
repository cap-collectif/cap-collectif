<?php

declare(strict_types=1);

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Security\ProposalVoter;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class ProposalAuthorEmailResolver implements QueryInterface
{
    public function __construct(private readonly AuthorizationCheckerInterface $authorizationChecker)
    {
    }

    public function __invoke(Proposal $proposal): ?string
    {
        if (!$this->authorizationChecker->isGranted(ProposalVoter::EDIT, $proposal)) {
            return null;
        }

        $author = $proposal->getAuthor();

        return $author instanceof ContributorInterface ? $author->getEmail() : null;
    }
}
