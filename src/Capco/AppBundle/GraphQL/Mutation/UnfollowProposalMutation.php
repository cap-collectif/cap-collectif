<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UnfollowProposalMutation
{
    private $em;
    private $proposalRepository;
    private $followerRepository;

    public function __construct(EntityManagerInterface $em, ProposalRepository $proposalRepository, FollowerRepository $followerRepository)
    {
        $this->em = $em;
        $this->proposalRepository = $proposalRepository;
        $this->followerRepository = $followerRepository;
    }

    public function __invoke(string $proposalId, User $user): array
    {
        /** @var Proposal $proposal */
        $proposal = $this->proposalRepository->find($proposalId);
        /** @var Follower $follower */
        $follower = $this->followerRepository->findBy(['user' => $user, 'proposal' => $proposal]);

        if (!$follower) {
            throw new UserError('Cant find the follower');
        }
        $follower = $follower[0];
        $this->em->remove($follower);

        $this->em->flush();

        return ['proposal' => $proposal, 'unfollowerId' => $user->getId()];
    }
}
