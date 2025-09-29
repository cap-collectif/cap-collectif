<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\MediaRepository;
use InvalidArgumentException;
use Liip\ImagineBundle\Binary\BinaryInterface;
use Liip\ImagineBundle\Imagine\Cache\CacheManager;
use Liip\ImagineBundle\Imagine\Data\DataManager;
use Liip\ImagineBundle\Imagine\Filter\FilterManager;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CropMediaMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly MediaRepository $mediaRepository,
        private readonly MediaProvider $mediaProvider,
        private readonly CacheManager $cacheManager,
        private readonly FilterManager $filterManager,
        private readonly DataManager $dataManager
    ) {
    }

    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);
        $filters = $args->offsetGet('filters');
        $media = $this->mediaRepository->find($args->offsetGet('mediaId'));
        if (!$media) {
            throw new InvalidArgumentException('This media does not exist.');
        }

        $file = $this->mediaProvider->getOrGenerateReferenceFile($media);
        $filter = 'cropped_media';
        $runtimeFilters = [
            'crop' => [
                'size' => [$filters['size']['width'], $filters['size']['height']],
                'start' => [$filters['start']['x'], $filters['start']['y']],
            ],
        ];

        $filteredBinary = $this->createFilteredBinary($file->getName(), $filter, $runtimeFilters);
        $this->cacheManager->store($filteredBinary, $file->getName(), $filter);

        return compact('media');
    }

    private function createFilteredBinary(
        $path,
        $filter,
        array $runtimeFilters = []
    ): BinaryInterface {
        $binary = $this->dataManager->find($filter, $path);

        return $this->filterManager->applyFilter($binary, $filter, [
            'filters' => $runtimeFilters,
        ]);
    }
}
