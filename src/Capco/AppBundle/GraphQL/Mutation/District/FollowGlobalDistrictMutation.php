<?php

namespace Capco\AppBundle\GraphQL\Mutation\District;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

class FollowGlobalDistrictMutation implements MutationInterface
{
    use MutationTrait;
    use ResolverTrait;

    private readonly EntityManagerInterface $entityManager;
    private readonly GlobalDistrictRepository $globalDistrictRepository;
    private readonly FollowerRepository $followerRepository;

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
            return [
                'globalDistrict' => null,
                'follower' => $viewer,
                'followerEdge' => null,
                'errorCode' => UnfollowGlobalDistrictMutation::DISTRICT_NOT_FOUND,
            ];
        }
        $follower = new Follower();
        $follower->setUser($viewer);
        $follower->setGlobalDistrict($globalDistrict);
        $follower->setNotifiedOf(FollowerNotifiedOfInterface::ALL);
        $globalDistrict->addFollower($follower);

        $this->entityManager->persist($follower);
        $this->entityManager->flush();

        $totalCount = $this->followerRepository->countFollowersOfGlobalDistrict($globalDistrict);
        $edge = new Edge(ConnectionBuilder::offsetToCursor($totalCount), $viewer);

        return [
            'globalDistrict' => $globalDistrict,
            'follower' => $viewer,
            'followerEdge' => $edge,
        ];
    }
}
