<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class UserContributionsCountResolver implements QueryInterface
{
    protected UserEventCommentsCountResolver $userEventCommentsCountResolver;
    protected UserOpinionVersionResolver $userOpinionVersionResolver;
    protected UserProposalsResolver $userProposalsResolver;
    protected UserSourcesResolver $userSourcesResolver;
    protected UserOpinionsResolver $userOpinionsResolver;
    protected UserRepliesResolver $userRepliesResolver;
    private readonly UserVotesResolver $userVotesResolver;
    private readonly ArgumentRepository $argumentRepository;

    public function __construct(
        UserEventCommentsCountResolver $userEventCommentsCountResolver,
        UserOpinionVersionResolver $userOpinionVersionResolver,
        UserProposalsResolver $userProposalsResolver,
        ArgumentRepository $argumentRepository,
        UserOpinionsResolver $userOpinionsResolver,
        UserRepliesResolver $userRepliesResolver,
        UserSourcesResolver $userSourcesResolver,
        UserVotesResolver $userVotesResolver
    ) {
        $this->userEventCommentsCountResolver = $userEventCommentsCountResolver;
        $this->userOpinionVersionResolver = $userOpinionVersionResolver;
        $this->userProposalsResolver = $userProposalsResolver;
        $this->userOpinionsResolver = $userOpinionsResolver;
        $this->userRepliesResolver = $userRepliesResolver;
        $this->userSourcesResolver = $userSourcesResolver;
        $this->userVotesResolver = $userVotesResolver;
        $this->argumentRepository = $argumentRepository;
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
