<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;

class ProposalHelper
{
    public function __construct(protected GlobalIdResolver $globalIdResolver)
    {
    }

    public function isAuthor(string $proposalId, User $user): bool
    {
        $proposal = $this->globalIdResolver->resolve($proposalId, $user);

        return $proposal && $proposal->getAuthor() === $user;
    }
}
