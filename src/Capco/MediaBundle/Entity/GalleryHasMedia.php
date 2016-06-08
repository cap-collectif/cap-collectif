<?php

namespace Capco\MediaBundle\Entity;

use Sonata\MediaBundle\Entity\BaseGalleryHasMedia as BaseGalleryHasMedia;

class GalleryHasMedia extends BaseGalleryHasMedia
{
    /**
     * @var int
     */
    protected $id;

    /**
     * Get id.
     *
     * @return int $id
     */
    public function getId()
    {
        return $this->id;
    }
}
