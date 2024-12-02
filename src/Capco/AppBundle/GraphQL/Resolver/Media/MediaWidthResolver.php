<?php

namespace Capco\AppBundle\GraphQL\Resolver\Media;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Helper\MediaSizeRetriever;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class MediaWidthResolver implements QueryInterface
{
    public function __construct(private readonly EntityManagerInterface $em, private readonly MediaSizeRetriever $mediaSizeRetriever)
    {
    }

    public function __invoke(Media $media): ?int
    {
        if ($media->getWidth()) {
            return $media->getWidth();
        }

        list('width' => $width) = $this->mediaSizeRetriever->getSize($media);

        if (!$width) {
            return null;
        }

        $media->setWidth($width);
        $this->em->flush();

        return $width;
    }
}
