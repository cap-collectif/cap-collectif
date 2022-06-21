<?php

namespace Capco\AppBundle\GraphQL\Mutation\District;

use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\ProjectDistrictRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;

class FollowProjectDistrictMutation implements MutationInterface
{
    use ResolverTrait;

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
            return [
                'projectDistrict' => null,
                'follower' => $viewer,
                'followerEdge' => null,
                'errorCode' => UnfollowProjectDistrictMutation::DISTRICT_NOT_FOUND,
            ];
        }
        $follower = new Follower();
        $follower->setUser($viewer);
        $follower->setProjectDistrict($projectDistrict);
        $follower->setNotifiedOf(FollowerNotifiedOfInterface::ALL);
        $projectDistrict->addFollower($follower);

        $this->entityManager->persist($follower);
        $this->entityManager->flush();

        $totalCount = $this->followerRepository->countFollowersOfProjectDistrict($projectDistrict);
        $edge = new Edge(ConnectionBuilder::offsetToCursor($totalCount), $viewer);

        return [
            'projectDistrict' => $projectDistrict,
            'follower' => $viewer,
            'followerEdge' => $edge,
        ];
    }
}
