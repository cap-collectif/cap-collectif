<?php

namespace Capco\AppBundle\Helper;

use Capco\MediaBundle\Entity\Media;
use Capco\MediaBundle\Provider\MediaProvider;

class MediaSizeRetriever
{
    private MediaProvider $mediaProvider;

    public function __construct(MediaProvider $mediaProvider)
    {
        $this->mediaProvider = $mediaProvider;
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
