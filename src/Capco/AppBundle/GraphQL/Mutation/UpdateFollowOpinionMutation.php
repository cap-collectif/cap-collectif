<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

class UpdateFollowOpinionMutation implements MutationInterface
{
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
            throw new UserError('Can\'t find the opinion.');
        }
        if (!$user instanceof User) {
            throw new UserError('User is different than user follower');
        }

        /** @var Follower $follower */
        $follower = $this->followerRepository->findOneBy(['user' => $user, 'opinion' => $opinion]);

        if (!$follower) {
            throw new UserError('Can\'t find the follower');
        }

        if ($notifiedOf) {
            $follower->setNotifiedOf($notifiedOf);
            $this->em->flush();
        }

        $totalCount = $this->followerRepository->countFollowersOfOpinion($opinion);

        $edge = new Edge(ConnectionBuilder::offsetToCursor($totalCount), $user);

        return ['opinion' => $opinion, 'follower' => $follower, 'followerEdge' => $edge];
    }
}
