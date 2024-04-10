<?php

namespace Capco\AppBundle\GraphQL\Resolver\Media;

use Capco\AppBundle\Helper\MediaSizeRetriever;
use Capco\MediaBundle\Entity\Media;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class MediaHeightResolver implements QueryInterface
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
        if ($media->getHeight()) {
            return $media->getHeight();
        }

        list('height' => $height) = $this->mediaSizeRetriever->getSize($media);

        if (!$height) {
            return null;
        }

        $media->setHeight($height);
        $this->em->flush();

        return $height;
    }
}
