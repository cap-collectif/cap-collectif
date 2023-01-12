<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\MediaBundle\Provider\MediaProvider;
use Capco\MediaBundle\Repository\MediaRepository;
use Liip\ImagineBundle\Binary\BinaryInterface;
use Liip\ImagineBundle\Imagine\Cache\CacheManager;
use Liip\ImagineBundle\Imagine\Data\DataManager;
use Liip\ImagineBundle\Imagine\Filter\FilterManager;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use InvalidArgumentException;

class CropMediaMutation implements MutationInterface
{
    private MediaRepository $mediaRepository;
    private MediaProvider $mediaProvider;
    private CacheManager $cacheManager;
    private FilterManager $filterManager;
    private DataManager $dataManager;

    public function __construct(
        MediaRepository $mediaRepository,
        MediaProvider $mediaProvider,
        CacheManager $cacheManager,
        FilterManager $filterManager,
        DataManager $dataManager
    ) {
        $this->mediaRepository = $mediaRepository;
        $this->mediaProvider = $mediaProvider;
        $this->cacheManager = $cacheManager;
        $this->filterManager = $filterManager;
        $this->dataManager = $dataManager;
    }

    public function __invoke(Argument $args): array
    {
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
