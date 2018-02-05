<?php

namespace Capco\MediaBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Sonata\MediaBundle\Entity\BaseMedia as BaseMedia;

class Media extends BaseMedia
{
    use UuidTrait;

    public function __construct()
    {
        $this->galleryHasMedias = new ArrayCollection();
    }

    /**
     * Add galleryHasMedia.
     *
     * @param GalleryHasMedia $galleryHasMedia
     *
     * @return Media
     */
    public function addGalleryHasMedia(GalleryHasMedia $galleryHasMedia)
    {
        $this->galleryHasMedias[] = $galleryHasMedia;

        return $this;
    }

    /**
     * Remove galleryHasMedia.
     *
     * @param GalleryHasMedia $galleryHasMedia
     */
    public function removeGalleryHasMedia(GalleryHasMedia $galleryHasMedia)
    {
        $this->galleryHasMedias->removeElement($galleryHasMedia);
    }
}
