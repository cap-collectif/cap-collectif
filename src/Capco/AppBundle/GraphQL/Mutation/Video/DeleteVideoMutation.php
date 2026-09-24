<?php

namespace Capco\AppBundle\GraphQL\Mutation\Video;

use Capco\AppBundle\Entity\Video;
use Capco\AppBundle\Enum\VideoErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\VideoRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeleteVideoMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly VideoRepository $videoRepository
    ) {
    }

    /**
     * @return array{deletedVideoId?: string|null, errorCode?: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $id = $input->offsetGet('id');
        $video = $this->videoRepository->find($id);
        if (!$video instanceof Video) {
            return ['deletedVideoId' => null, 'errorCode' => VideoErrorCode::NOT_FOUND];
        }

        $this->em->remove($video);
        $this->em->flush();

        return ['deletedVideoId' => $id, 'errorCode' => null];
    }
}
