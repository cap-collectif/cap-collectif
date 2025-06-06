<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Provider\MediaProvider;

class MediaSizeRetriever
{
    public function __construct(private readonly MediaProvider $mediaProvider)
    {
    }

    /**
     * @return null|array{'height': int, 'width': int}|null[]
     */
    public function getSize(Media $media): ?array
    {
        $format = 'reference';
        $path = $this->mediaProvider->generatePublicUrl($media, $format);
        $size = getimagesize("media{$path}");

        if (empty($size)) {
            return ['width' => null, 'height' => null];
        }

        $width = $size[0];
        $height = $size[1];

        return ['width' => $width, 'height' => $height];
    }
}
