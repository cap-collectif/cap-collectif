<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

final class UpdateFollowProposalMutation
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

    /**
     * @throws UserError
     */
    public function __invoke(string $proposalId, string $followerId, string $notifiedOf, User $user): array
    {
        /** @var Follower $follower */
        $follower = $this->followerRepository->find($followerId);
        /** @var Proposal $proposal */
        $proposal = $this->proposalRepository->find($proposalId);

        if (!$follower) {
            throw new UserError('Cant find the follower');
        }
        if (!$proposal) {
            throw new UserError('Cant find the proposal');
        }

        if ($proposalId !== $follower->getProposal()->getId()) {
            throw new UserError('Cant find the proposal');
        }
        if ($user !== $follower->getUser()) {
            throw new UserError('User is different than user follower');
        }
        if ($notifiedOf !== $follower->getNotifiedOf()) {
            $follower->setNotifiedOf($notifiedOf);
            $this->em->flush();
        }

        $totalCount = $this->followerRepository->countFollowersOfProposal($proposal);

        $edge = new Edge(ConnectionBuilder::offsetToCursor($totalCount), $user);

        return ['proposal' => $proposal, 'follower' => $follower, 'followerEdge' => $edge];
    }
}
