<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
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
    private $versionRepository;

    public function __construct(
        EntityManagerInterface $em,
        OpinionRepository $opinionRepository,
        OpinionVersionRepository $versionRepository,
        FollowerRepository $followerRepository
    ) {
        $this->em = $em;
        $this->opinionRepository = $opinionRepository;
        $this->followerRepository = $followerRepository;
        $this->versionRepository = $versionRepository;
    }

    public function __invoke(string $opinionId, string $notifiedOf, User $user): array
    {
        /** @var Opinion $opinion */
        $opinion = $this->opinionRepository->find($opinionId);
        /** @var OpinionVersion $version */
        $version = $this->versionRepository->find($opinionId);

        if (!$opinion && !$version) {
            throw new UserError('Can\'t find the opinion or version.');
        }
        if (!$user instanceof User) {
            throw new UserError('User is different than user follower');
        }

        /** @var Follower $follower */
        $follower = $opinion
            ? $this->followerRepository->findOneBy(['user' => $user, 'opinion' => $opinion])
            : $this->followerRepository->findOneBy(['user' => $user, 'opinionVersion' => $version]);

        if (!$follower) {
            throw new UserError('Can\'t find the follower');
        }

        if ($notifiedOf) {
            $follower->setNotifiedOf($notifiedOf);
            $this->em->flush();
        }

        $totalCount = $opinion
            ? $this->followerRepository->countFollowersOfOpinion($opinion)
            : $this->followerRepository->countFollowersOfOpinionVersion($version);

        $edge = new Edge(ConnectionBuilder::offsetToCursor($totalCount), $user);

        return [
            'opinion' => $opinion ? $opinion : $version,
            'follower' => $follower,
            'followerEdge' => $edge
        ];
    }
}
