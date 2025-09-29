<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Traits\ProjectOpinionSubscriptionGuard;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

class FollowOpinionMutation implements MutationInterface
{
    use ProjectOpinionSubscriptionGuard;
    private $opinionRepository;
    private $opinionVersionRepository;

    public function __construct(
        private EntityManagerInterface $em,
        private FollowerRepository $followerRepository,
        private GlobalIdResolver $globalIdResolver
    ) {
    }

    public function __invoke(string $opinionId, string $notifiedOf, User $user): array
    {
        /** @var Opinion $opinion */
        $opinion = $this->globalIdResolver->resolve($opinionId, $user);
        $opinionVersion = null;
        if (null === $opinion) {
            /** @var OpinionVersion $opinionVersion */
            $opinionVersion = $this->globalIdResolver->resolve($opinionId, $user);
        }

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
            'followerEdge' => $edge,
        ];
    }
}
