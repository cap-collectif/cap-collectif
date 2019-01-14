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
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerIsFollowingDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerFollowingConfigurationDataLoader;

class FollowProposalMutation implements MutationInterface
{
    private $em;
    private $proposalRepository;
    private $followerRepository;
    private $viewerFollowDataLoader;
    private $viewerFollowingConfigDataLoader;

    public function __construct(
        EntityManagerInterface $em,
        ProposalRepository $proposalRepository,
        FollowerRepository $followerRepository,
        ProposalViewerIsFollowingDataLoader $viewerFollowDataLoader,
        ProposalViewerFollowingConfigurationDataLoader $viewerFollowingConfigDataLoader
    ) {
        $this->em = $em;
        $this->proposalRepository = $proposalRepository;
        $this->followerRepository = $followerRepository;
        $this->viewerFollowDataLoader = $viewerFollowDataLoader;
        $this->viewerFollowingConfigDataLoader = $viewerFollowingConfigDataLoader;
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
        $this->viewerFollowDataLoader->invalidate($proposal);
        $this->viewerFollowingConfigDataLoader->invalidate($proposal);

        return ['proposal' => $proposal, 'follower' => $user, 'followerEdge' => $edge];
    }
}
