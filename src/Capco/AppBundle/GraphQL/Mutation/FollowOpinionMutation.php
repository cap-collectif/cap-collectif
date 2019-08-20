<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\GraphQL\Traits\ProjectOpinionSubscriptionGuard;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

class FollowOpinionMutation implements MutationInterface
{
    use ProjectOpinionSubscriptionGuard;

    private $em;
    private $opinionRepository;
    private $followerRepository;

    public function __construct(
        EntityManagerInterface $em,
        OpinionRepository $opinionRepository,
        FollowerRepository $followerRepository
    ) {
        $this->em = $em;
        $this->opinionRepository = $opinionRepository;
        $this->followerRepository = $followerRepository;
    }

    public function __invoke(string $opinionId, string $notifiedOf, User $user): array
    {
        /** @var Opinion $opinion */
        $opinion = $this->opinionRepository->find($opinionId);

        if (!$opinion) {
            throw new UserError('Can\’t find this opinion.');
        }

        if (!$this->canBeFollowed($opinion)) {
            throw new UserError('Can\'t subscribe to this opinion.');
        }

        $follower = new Follower();
        $follower->setUser($user);
        $follower->setOpinion($opinion);
        $follower->setNotifiedOf($notifiedOf);

        $this->em->flush();

        $totalCount = $this->followerRepository->countFollowersOfOpinion($opinion);

        $edge = new Edge(ConnectionBuilder::offsetToCursor($totalCount), $user);

        return ['opinion' => $opinion, 'follower' => $user, 'followerEdge' => $edge];
    }
}
