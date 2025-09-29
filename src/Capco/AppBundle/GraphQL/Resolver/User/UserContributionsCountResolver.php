<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class UserContributionsCountResolver implements QueryInterface
{
    public function __construct(
        protected UserEventCommentsCountResolver $userEventCommentsCountResolver,
        protected UserOpinionVersionResolver $userOpinionVersionResolver,
        protected UserProposalsResolver $userProposalsResolver,
        private readonly ArgumentRepository $argumentRepository,
        protected UserOpinionsResolver $userOpinionsResolver,
        protected UserRepliesResolver $userRepliesResolver,
        protected UserSourcesResolver $userSourcesResolver,
        private readonly UserVotesResolver $userVotesResolver
    ) {
    }

    public function __invoke(User $user, ?User $viewer = null): int
    {
        return $this->userEventCommentsCountResolver->__invoke($user) +
            $this->userOpinionsResolver->getCountPublicPublished($user, true, $viewer) +
            $this->userProposalsResolver->__invoke($viewer, $user)->getTotalCount() +
            $this->argumentRepository->countByUser($user, $viewer) +
            $this->userOpinionVersionResolver->__invoke($viewer, $user)->getTotalCount() +
            $this->userVotesResolver->__invoke($viewer, $user)->getTotalCount() +
            $this->userRepliesResolver->__invoke($viewer, $user)->getTotalCount() +
            $this->userSourcesResolver->__invoke($viewer, $user)->getTotalCount();
    }
}
