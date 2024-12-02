<?php

namespace Capco\AppBundle\GraphQL\Resolver\Media;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Helper\MediaSizeRetriever;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class MediaHeightResolver implements QueryInterface
{
    public function __construct(private readonly EntityManagerInterface $em, private readonly MediaSizeRetriever $mediaSizeRetriever)
    {
    }

    public function __invoke(Media $media): ?int
    {
        if ($media->getHeight()) {
            return $media->getHeight();
        }

        ['height' => $height] = $this->mediaSizeRetriever->getSize($media);

        if (!$height) {
            return null;
        }

        $media->setHeight($height);
        $this->em->flush();

        return $height;
    }
}
