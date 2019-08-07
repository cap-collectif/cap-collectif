<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserContributionsCountResolver implements ResolverInterface
{
    protected $userEventCommentsCountResolver;
    protected $userProposalsResolver;
    protected $userSourcesResolver;
    protected $userOpinionsResolver;

    public function __construct(
        UserEventCommentsCountResolver $userEventCommentsCountResolver,
        UserProposalsResolver $userProposalsResolver,
        UserSourcesResolver $userSourcesResolver,
        UserOpinionsResolver $userOpinionsResolver
    ) {
        $this->userEventCommentsCountResolver = $userEventCommentsCountResolver;
        $this->userOpinionsResolver = $userOpinionsResolver;
        $this->userProposalsResolver = $userProposalsResolver;
        $this->userSourcesResolver = $userSourcesResolver;
    }

    public function __invoke(User $user, $viewer = null): int
    {
        return $this->userEventCommentsCountResolver->__invoke($user) +
            $this->userOpinionsResolver->getCountPublicPublished($user, true) +
            $this->userProposalsResolver->__invoke($viewer, $user)->totalCount +
            $this->userSourcesResolver->__invoke($user)->totalCount +
            $user->getArgumentsCount() +
            $user->getOpinionVersionsCount();
    }
}
