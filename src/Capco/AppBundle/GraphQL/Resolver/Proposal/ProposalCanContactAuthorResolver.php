<?php

declare(strict_types=1);

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalCanContactAuthorResolver implements QueryInterface
{
    public function __invoke(Proposal $proposal): bool
    {
        $author = $proposal->getAuthor();
        $email = $author instanceof ContributorInterface ? $author->getEmail() : null;

        return $proposal->getProposalForm()->canContact()
            && \is_string($email)
            && '' !== trim($email);
    }
}
