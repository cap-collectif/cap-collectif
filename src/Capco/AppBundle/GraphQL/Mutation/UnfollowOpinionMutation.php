<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Interfaces\OpinionContributionInterface;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\GraphQL\Traits\ProjectOpinionSubscriptionGuard;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class UnfollowOpinionMutation implements MutationInterface
{
    use ProjectOpinionSubscriptionGuard;

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

    public function __invoke(Argument $args, User $user): array
    {
        $opinion = null;
        $version = null;
        if (isset($args['opinionId']) && !empty($args['opinionId'])) {
            if ($opinion = $this->opinionRepository->find($args['opinionId'])) {
                $this->unfollow($opinion, $user);
            } elseif ($version = $this->versionRepository->find($args['opinionId'])) {
                $this->unfollow($version, $user);
            } else {
                throw new UserError('Can\'t find the opinion or version.');
            }
        }

        // This is used in the edition page profile to unfollow all the opinions.
        if (isset($args['idsOpinion']) && !empty($args['idsOpinion'])) {
            $opinions = $this->opinionRepository->findBy(['id' => $args['idsOpinion']]);
            $versions = $this->versionRepository->findBy(['id' => $args['idsOpinion']]);
            $allOpinions = array_merge($opinions, $versions);
            foreach ($allOpinions as $opinion) {
                $this->unfollow($opinion, $user);
            }
        }

        $this->em->flush();

        return [
            'opinion' => $opinion ?: $version,
            'unfollowerId' => GlobalId::toGlobalId('User', $user->getId())
        ];
    }

    protected function unfollow(OpinionContributionInterface $opinion, User $user): void
    {
        $follower = null;
        if ($opinion instanceof Opinion) {
            /** @var Follower $follower */
            $follower = $this->followerRepository->findOneBy([
                'user' => $user,
                'opinion' => $opinion
            ]);
            if (!$follower) {
                throw new UserError('Can\'t find the opinion.');
            }
            if (!$this->canBeFollowed($opinion)) {
                throw new UserError('Can\'t unsubscribe from this opinion.');
            }
        }

        if ($opinion instanceof OpinionVersion) {
            /** @var Follower $follower */
            $follower = $this->followerRepository->findOneBy([
                'user' => $user,
                'opinionVersion' => $opinion
            ]);
            if (!$follower) {
                throw new UserError('Can\'t find the version.');
            }

            if (!$this->versionCanBeFollowed($opinion)) {
                throw new UserError('Can\'t unsubscribe from this version.');
            }
        }

        $this->em->remove($follower);
    }
}
