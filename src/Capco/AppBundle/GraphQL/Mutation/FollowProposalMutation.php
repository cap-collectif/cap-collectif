<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

class FollowProposalMutation implements MutationInterface
{
    private $em;
    private $proposalRepository;
    private $followerRepository;

    public function __construct(
        EntityManagerInterface $em,
        ProposalRepository $proposalRepository,
        FollowerRepository $followerRepository
    ) {
        $this->em = $em;
        $this->proposalRepository = $proposalRepository;
        $this->followerRepository = $followerRepository;
    }

    /**
     * @throws UserError
     */
    public function __invoke(string $proposalId, string $notifiedOf, User $user): array
    {
        /** @var Proposal $proposal */
        $proposal = $this->proposalRepository->find($proposalId);

        if (!$proposal) {
            throw new UserError('Cant find the proposal');
        }

        $follower = new Follower();
        $follower->setUser($user);
        $follower->setProposal($proposal);
        $follower->setNotifiedOf($notifiedOf);

        $this->em->flush();

        $totalCount = $this->followerRepository->countFollowersOfProposal($proposal);

        $edge = new Edge(ConnectionBuilder::offsetToCursor($totalCount), $user);

        return ['proposal' => $proposal, 'follower' => $user, 'followerEdge' => $edge];
    }
}
