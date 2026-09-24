<?php

namespace Capco\AppBundle\GraphQL\Resolver\Video;

use Capco\AppBundle\Repository\VideoRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class VideoListResolver implements QueryInterface
{
    public function __construct(
        private readonly VideoRepository $videoRepository
    ) {
    }

    public function __invoke(Argument $args): Connection
    {
        $search = $args['search'] ?? null;

        $paginator = new Paginator(
            fn (?int $offset = null, ?int $limit = null) => $this->videoRepository
                ->getPaginated($search, $offset, $limit)
                ->getIterator()
                ->getArrayCopy()
        );

        $connection = $paginator->auto($args, $this->videoRepository->countAll($search));
        if (!$connection instanceof Connection) {
            throw new \RuntimeException('Unexpected Promise result while resolving videos.');
        }

        return $connection;
    }
}
