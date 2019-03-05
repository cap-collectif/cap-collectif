<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserContributionsCountResolver implements ResolverInterface
{
    protected $userEventCommentsCountResolver;

    public function __construct(UserEventCommentsCountResolver $userEventCommentsCountResolver)
    {
        $this->userEventCommentsCountResolver = $userEventCommentsCountResolver;
    }

    public function __invoke(User $viewer): int
    {
        return $this->userEventCommentsCountResolver->__invoke($viewer) +
            $viewer->getContributionsCount();
    }
}
