<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

final class UpdateFollowProposalMutation implements MutationInterface
{
    private $em;
    private $followerRepository;
    private $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        FollowerRepository $followerRepository,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->em = $em;
        $this->followerRepository = $followerRepository;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(string $proposalId, string $notifiedOf, User $user): array
    {
        /** @var Proposal $proposal */
        $proposal = $this->globalIdResolver->resolve($proposalId, $user);

        if (!$proposal) {
            throw new UserError('Can\'t find the proposal');
        }
        if (!$user instanceof User) {
            throw new UserError('User is different than user follower');
        }

        /** @var Follower $follower */
        $follower = $this->followerRepository->findOneBy([
            'user' => $user,
            'proposal' => $proposal
        ]);

        if (!$follower) {
            throw new UserError('Can\'t find the follower');
        }

        if ($notifiedOf) {
            $follower->setNotifiedOf($notifiedOf);
            $this->em->flush();
        }

        $totalCount = $this->followerRepository->countFollowersOfProposal($proposal);

        $edge = new Edge(ConnectionBuilder::offsetToCursor($totalCount), $user);

        return ['proposal' => $proposal, 'follower' => $follower, 'followerEdge' => $edge];
    }
}
