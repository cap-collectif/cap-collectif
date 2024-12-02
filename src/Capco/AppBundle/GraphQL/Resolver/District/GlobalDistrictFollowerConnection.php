<?php

namespace Capco\AppBundle\GraphQL\Resolver\District;

use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class GlobalDistrictFollowerConnection implements QueryInterface
{
    public function __construct(private readonly UserRepository $userRepository, private readonly LoggerInterface $logger, private readonly FollowerRepository $followerRepository)
    {
    }

    public function __invoke(GlobalDistrict $globalDistrict, Arg $args): Connection
    {
        $paginator = new Paginator(function ($offset, $limit) use ($globalDistrict, $args) {
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $orderBy = [$field => $direction];
            $criteria = [
                'globalDistrict' => $globalDistrict,
            ];

            try {
                $followers = $this->userRepository
                    ->getByCriteriaOrdered($criteria, $orderBy, $limit, $offset)
                    ->getIterator()
                    ->getArrayCopy()
                ;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find following project district by user failed');
            }

            return $followers;
        });

        $totalCount = $this->followerRepository->countFollowersOfGlobalDistrict($globalDistrict);

        return $paginator->auto($args, $totalCount);
    }
}
