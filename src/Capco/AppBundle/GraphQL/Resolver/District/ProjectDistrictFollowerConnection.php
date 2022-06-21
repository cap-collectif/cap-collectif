<?php

namespace Capco\AppBundle\GraphQL\Resolver\District;

use Capco\AppBundle\Entity\District\ProjectDistrict;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ProjectDistrictFollowerConnection implements ResolverInterface
{
    private UserRepository $userRepository;
    private LoggerInterface $logger;
    private FollowerRepository $followerRepository;

    public function __construct(
        UserRepository $userRepository,
        LoggerInterface $logger,
        FollowerRepository $followerRepository
    ) {
        $this->userRepository = $userRepository;
        $this->logger = $logger;
        $this->followerRepository = $followerRepository;
    }

    public function __invoke(ProjectDistrict $projectDistrict, Arg $args): Connection
    {
        $paginator = new Paginator(function ($offset, $limit) use ($projectDistrict, $args) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $orderBy = [$field => $direction];
            $criteria = [
                'projectDistrict' => $projectDistrict,
            ];

            try {
                $followers = $this->userRepository
                    ->getByCriteriaOrdered($criteria, $orderBy, $limit, $offset)
                    ->getIterator()
                    ->getArrayCopy();
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find following project district by user failed');
            }

            return $followers;
        });

        $totalCount = $this->followerRepository->countFollowersOfProjectDistrict($projectDistrict);

        return $paginator->auto($args, $totalCount);
    }
}
