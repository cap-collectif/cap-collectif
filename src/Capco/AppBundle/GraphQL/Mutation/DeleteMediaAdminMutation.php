<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Service\MediaManager;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeleteMediaAdminMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        protected MediaRepository $mediaRepository,
        protected MediaManager $mediaManager
    ) {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $ids = $input->offsetGet('ids');

        return $this->mediaManager->removeFromIdsWithFiles($ids);
    }
}
