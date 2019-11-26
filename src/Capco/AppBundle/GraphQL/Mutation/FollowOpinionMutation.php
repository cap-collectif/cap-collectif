<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\GraphQL\Traits\ProjectOpinionSubscriptionGuard;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
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
    private $opinionVersionRepository;

    public function __construct(
        EntityManagerInterface $em,
        OpinionRepository $opinionRepository,
        OpinionVersionRepository $opinionVersionRepository,
        FollowerRepository $followerRepository
    ) {
        $this->em = $em;
        $this->opinionRepository = $opinionRepository;
        $this->followerRepository = $followerRepository;
        $this->opinionVersionRepository = $opinionVersionRepository;
    }

    public function __invoke(string $opinionId, string $notifiedOf, User $user): array
    {
        /** @var Opinion $opinion */
        $opinion = $this->opinionRepository->find($opinionId);
        /** @var OpinionVersion $opinionVersion */
        $opinionVersion = $this->opinionVersionRepository->find($opinionId);

        if (!$opinion && !$opinionVersion) {
            throw new UserError('Can\’t find this opinion or version.');
        }

        if ($opinion && !$this->canBeFollowed($opinion)) {
            throw new UserError('Can\'t subscribe to this opinion.');
        }

        if ($opinionVersion && !$this->versionCanBeFollowed($opinionVersion)) {
            throw new UserError('Can\'t subscribe to this version.');
        }

        $follower = new Follower();
        $follower->setUser($user);
        $opinion ? $follower->setOpinion($opinion) : $follower->setOpinionVersion($opinionVersion);
        $follower->setNotifiedOf($notifiedOf);

        $this->em->flush();

        $totalCount = $opinion
            ? $this->followerRepository->countFollowersOfOpinion($opinion)
            : $this->followerRepository->countFollowersOfOpinionVersion($opinionVersion);

        $edge = new Edge(ConnectionBuilder::offsetToCursor($totalCount), $user);

        return [
            'opinion' => $opinion ?: $opinionVersion,
            'follower' => $user,
            'followerEdge' => $edge
        ];
    }
}
