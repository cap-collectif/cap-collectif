<?php

namespace Capco\AppBundle\GraphQL\Resolver\Media;

use Capco\AppBundle\Helper\MediaSizeRetriever;
use Capco\MediaBundle\Entity\Media;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class MediaWidthResolver implements QueryInterface
{
    private EntityManagerInterface $em;
    private MediaSizeRetriever $mediaSizeRetriever;

    public function __construct(EntityManagerInterface $em, MediaSizeRetriever $mediaSizeRetriever)
    {
        $this->em = $em;
        $this->mediaSizeRetriever = $mediaSizeRetriever;
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
