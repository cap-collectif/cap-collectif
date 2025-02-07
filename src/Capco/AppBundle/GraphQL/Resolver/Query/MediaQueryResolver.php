<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\MediaRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class MediaQueryResolver implements QueryInterface
{
    public function __construct(private readonly MediaRepository $mediaRepository, private readonly LoggerInterface $logger)
    {
    }

    public function __invoke(Arg $args): ConnectionInterface
    {
        $showProfilePictures = $args->offsetGet('showProfilePictures');
        $term = $args->offsetGet('term');

        $totalCount = $this->mediaRepository->countAllWithoutCategory($term, $showProfilePictures);
        $paginator = new Paginator(function (int $offset, int $limit) use ($term, $showProfilePictures) {
            try {
                return $this->mediaRepository
                    ->getWithoutCategoryPaginated($offset, $limit, $term, $showProfilePictures)
                    ->getIterator()
                    ->getArrayCopy()
                ;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('No media found.');
            }
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
