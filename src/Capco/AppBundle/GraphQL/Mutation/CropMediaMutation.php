<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\MediaBundle\Entity\Media;
use Liip\ImagineBundle\Binary\BinaryInterface;
use Liip\ImagineBundle\Imagine\Cache\CacheManager;
use Liip\ImagineBundle\Imagine\Data\DataManager;
use Liip\ImagineBundle\Imagine\Filter\FilterManager;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Sonata\MediaBundle\Entity\MediaManager;
use Sonata\MediaBundle\Provider\Pool;
use InvalidArgumentException;

class CropMediaMutation implements MutationInterface
{
    private $mediaPool;
    private $mediaManager;
    private $cacheManager;
    private $filterManager;
    private $dataManager;

    public function __construct(
        FilterManager $filterManager,
        DataManager $dataManager,
        MediaManager $mediaManager,
        Pool $mediaPool,
        CacheManager $cacheManager
    ) {
        $this->mediaPool = $mediaPool;
        $this->mediaManager = $mediaManager;
        $this->cacheManager = $cacheManager;
        $this->filterManager = $filterManager;
        $this->dataManager = $dataManager;
    }

    public function __invoke(Argument $args): array
    {
        [$mediaId, $filters] = [$args->offsetGet('mediaId'), $args->offsetGet('filters')];

        /** @var Media $media */
        $media = $this->mediaManager->find($mediaId);
        if (!$media) {
            throw new InvalidArgumentException('This media does not exist.');
        }

        $provider = $this->mediaPool->getProvider($media->getProviderName());
        $file = $provider->getReferenceFile($media);
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
