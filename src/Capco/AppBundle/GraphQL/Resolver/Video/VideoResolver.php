<?php

namespace Capco\AppBundle\GraphQL\Resolver\Video;

use Capco\AppBundle\Entity\Video;
use Capco\AppBundle\Repository\VideoRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class VideoResolver implements QueryInterface
{
    public function __construct(
        private readonly VideoRepository $videoRepository
    ) {
    }

    public function __invoke(Argument $args): ?Video
    {
        $video = $this->videoRepository->find($args->offsetGet('id'));

        return $video instanceof Video ? $video : null;
    }
}
