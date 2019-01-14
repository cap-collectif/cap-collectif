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

final class UpdateFollowProposalMutation implements MutationInterface
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

    public function __invoke(string $proposalId, string $notifiedOf, User $user): array
    {
        /** @var Proposal $proposal */
        $proposal = $this->proposalRepository->find($proposalId);

        if (!$proposal) {
            throw new UserError('Can\'t find the proposal');
        }
        if (!$user instanceof User) {
            throw new UserError('User is different than user follower');
        }

        /** @var Follower $follower */
        $follower = $this->followerRepository->findOneBy([
            'user' => $user,
            'proposal' => $proposal,
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
