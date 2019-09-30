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
    protected $userRepliesResolver;
    private $userVotesResolver;

    public function __construct(
        UserEventCommentsCountResolver $userEventCommentsCountResolver,
        UserProposalsResolver $userProposalsResolver,
        UserSourcesResolver $userSourcesResolver,
        UserOpinionsResolver $userOpinionsResolver,
        UserRepliesResolver $userRepliesResolver,
        UserVotesResolver $userVotesResolver
    ) {
        $this->userEventCommentsCountResolver = $userEventCommentsCountResolver;
        $this->userOpinionsResolver = $userOpinionsResolver;
        $this->userRepliesResolver = $userRepliesResolver;
        $this->userProposalsResolver = $userProposalsResolver;
        $this->userSourcesResolver = $userSourcesResolver;
        $this->userVotesResolver = $userVotesResolver;
    }

    public function __invoke(User $user, ?User $viewer = null): int
    {
        return $this->userEventCommentsCountResolver->__invoke($user) +
            $this->userOpinionsResolver->getCountPublicPublished($user, true, $viewer) +
            $this->userProposalsResolver->__invoke($viewer, $user)->getTotalCount() +
            $user->getArgumentsCount() +
            $user->getOpinionVersionsCount() +
            $this->userVotesResolver->__invoke($viewer, $user)->getTotalCount() +
            $this->userRepliesResolver->__invoke($viewer, $user)->getTotalCount() +
            $this->userSourcesResolver->__invoke($viewer, $user)->getTotalCount();
    }
}
