<?php

namespace Capco\AppBundle\GraphQL\Mutation\District;

use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\ProjectDistrictRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UnfollowProjectDistrictMutation implements MutationInterface
{
    use ResolverTrait;
    public const DISTRICT_NOT_FOUND = 'DISTRICT_NOT_FOUND';
    public const FOLLOWER_NOT_FOUND = 'FOLLOWER_NOT_FOUND';
    private EntityManagerInterface $entityManager;
    private ProjectDistrictRepository $projectDistrictRepository;
    private FollowerRepository $followerRepository;

    public function __construct(
        ProjectDistrictRepository $projectDistrictRepository,
        EntityManagerInterface $entityManager,
        FollowerRepository $followerRepository
    ) {
        $this->entityManager = $entityManager;
        $this->projectDistrictRepository = $projectDistrictRepository;
        $this->followerRepository = $followerRepository;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $projectDistrictId = $input->offsetGet('projectDistrictId');
        $projectDistrict = $this->projectDistrictRepository->find($projectDistrictId);

        if (!$projectDistrict instanceof ProjectDistrict) {
            return $this->generateErrorPayload(self::DISTRICT_NOT_FOUND);
        }

        $follower = $this->followerRepository->findOneBy([
            'user' => $viewer,
            'projectDistrict' => $projectDistrict,
        ]);
        if (!$follower instanceof Follower) {
            return $this->generateErrorPayload(self::FOLLOWER_NOT_FOUND);
        }
        $projectDistrict->removeFollower($follower);
        $this->entityManager->remove($follower);
        $this->entityManager->flush();

        return [
            'projectDistrict' => $projectDistrict,
            'unfollowerId' => $viewer->getId(),
        ];
    }

    private function generateErrorPayload(string $message): array
    {
        return ['projectDistrict' => null, 'unfollowerId' => null, 'errorCode' => $message];
    }
}
