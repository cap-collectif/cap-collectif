<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserContributionsCountResolver implements ResolverInterface
{
    protected $userEventCommentsCountResolver;
    protected $userProposalsResolver;
    protected $userSourcesResolver;

    public function __construct(
        UserEventCommentsCountResolver $userEventCommentsCountResolver,
        UserProposalsResolver $userProposalsResolver,
        UserSourcesResolver $userSourcesResolver
    ) {
        $this->userEventCommentsCountResolver = $userEventCommentsCountResolver;
        $this->userProposalsResolver = $userProposalsResolver;
        $this->userSourcesResolver = $userSourcesResolver;
    }

    public function __invoke(User $user, $viewer = null): int
    {
        return $this->userEventCommentsCountResolver->__invoke($user) +
            $this->userProposalsResolver->__invoke($viewer, $user)->totalCount +
            $user->getArgumentsCount() +
            $user->getOpinionsCount() +
            $user->getOpinionVersionsCount() +
            $this->userSourcesResolver->__invoke($user)->totalCount;
    }
}
