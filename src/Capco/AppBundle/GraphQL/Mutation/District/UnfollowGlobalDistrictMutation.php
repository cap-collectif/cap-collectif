<?php

namespace Capco\AppBundle\GraphQL\Mutation\District;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UnfollowGlobalDistrictMutation implements MutationInterface
{
    use MutationTrait;
    use ResolverTrait;

    public const DISTRICT_NOT_FOUND = 'DISTRICT_NOT_FOUND';
    public const FOLLOWER_NOT_FOUND = 'FOLLOWER_NOT_FOUND';
    private EntityManagerInterface $entityManager;
    private GlobalDistrictRepository $globalDistrictRepository;
    private FollowerRepository $followerRepository;

    public function __construct(
        GlobalDistrictRepository $globalDistrictRepository,
        EntityManagerInterface $entityManager,
        FollowerRepository $followerRepository
    ) {
        $this->entityManager = $entityManager;
        $this->globalDistrictRepository = $globalDistrictRepository;
        $this->followerRepository = $followerRepository;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $globalDistrictId = $input->offsetGet('globalDistrictId');
        $globalDistrict = $this->globalDistrictRepository->find($globalDistrictId);

        if (!$globalDistrict instanceof GlobalDistrict) {
            return $this->generateErrorPayload(self::DISTRICT_NOT_FOUND);
        }

        $follower = $this->followerRepository->findOneBy([
            'user' => $viewer,
            'globalDistrict' => $globalDistrict,
        ]);
        if (!$follower instanceof Follower) {
            return $this->generateErrorPayload(self::FOLLOWER_NOT_FOUND);
        }
        $globalDistrict->removeFollower($follower);
        $this->entityManager->remove($follower);
        $this->entityManager->flush();

        return [
            'globalDistrict' => $globalDistrict,
            'unfollowerId' => $viewer->getId(),
        ];
    }

    private function generateErrorPayload(string $message): array
    {
        return ['globalDistrict' => null, 'unfollowerId' => null, 'errorCode' => $message];
    }
}
