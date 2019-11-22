<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\GraphQL\Traits\ProjectOpinionSubscriptionGuard;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UnfollowOpinionMutation implements MutationInterface
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

    public function __invoke(Argument $args, User $user): array
    {
        $opinion = '';
        if (isset($args['opinionId'])) {
            $opinion = $this->opinionRepository->find($args['opinionId']);
            $this->unfollow($opinion, $user);
        }

        if (isset($args['idsOpinion'])) {
            foreach ($args['idsOpinion'] as $opinionId) {
                $opinion = $this->opinionRepository->find($opinionId);
                $this->unfollow($opinion, $user);
            }
        }

        $this->em->flush();

        return ['opinion' => $opinion, 'unfollowerId' => $user->getId()];
    }

    protected function unfollow(Opinion $opinion, User $user): void
    {
        /** @var Follower $follower */
        $follower = $this->followerRepository->findOneBy(['user' => $user, 'opinion' => $opinion]);

        if (!$follower) {
            throw new UserError('Can\'t find the opinion.');
        }

        if (!$this->canBeFollowed($opinion)) {
            throw new UserError('Can\'t unsubscribe from this opinion.');
        }

        $this->em->remove($follower);
    }
}
