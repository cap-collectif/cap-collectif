<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerFollowingConfigurationDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerIsFollowingDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class UnfollowProposalMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private FollowerRepository $followerRepository;
    private ProposalViewerIsFollowingDataLoader $viewerFollowDataLoader;
    private ProposalViewerFollowingConfigurationDataLoader $viewerFollowingConfigDataLoader;
    private GlobalIdResolver $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        FollowerRepository $followerRepository,
        ProposalViewerIsFollowingDataLoader $viewerFollowDataLoader,
        ProposalViewerFollowingConfigurationDataLoader $viewerFollowingConfigDataLoader,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->em = $em;
        $this->followerRepository = $followerRepository;
        $this->viewerFollowDataLoader = $viewerFollowDataLoader;
        $this->viewerFollowingConfigDataLoader = $viewerFollowingConfigDataLoader;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Argument $args, User $user): array
    {
        $proposal = '';
        if (isset($args['proposalId'])) {
            /** @var Proposal $proposal */
            $proposal = $this->globalIdResolver->resolve($args['proposalId'], $user);
            $this->unfollowAProposal($proposal, $user);
        }

        if (isset($args['idsProposal'])) {
            foreach ($args['idsProposal'] as $proposalId) {
                /** @var Proposal $proposal */
                $proposal = $this->globalIdResolver->resolve($proposalId, $user);
                $this->unfollowAProposal($proposal, $user);
            }
        }

        $this->em->flush();

        $unfollowerId = GlobalId::toGlobalId('User', $user->getId());

        return ['proposal' => $proposal, 'unfollowerId' => $unfollowerId];
    }

    protected function unfollowAProposal(Proposal $proposal, User $user): void
    {
        $follower = $this->followerRepository->findOneBy([
            'user' => $user,
            'proposal' => $proposal,
        ]);

        if (!$follower instanceof Follower) {
            throw new UserError('Cant find the follower');
        }

        $this->em->remove($follower);

        $this->viewerFollowDataLoader->invalidate($proposal);
        $this->viewerFollowingConfigDataLoader->invalidate($proposal);
    }
}
