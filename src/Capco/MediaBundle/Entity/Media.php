<?php

namespace Capco\MediaBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Sonata\MediaBundle\Entity\BaseMedia;

class Media extends BaseMedia
{
    use UuidTrait;

    public function __construct()
    {
        $this->galleryHasMedias = new ArrayCollection();
    }

    public function addGalleryHasMedia(GalleryHasMedia $galleryHasMedia)
    {
        $this->galleryHasMedias[] = $galleryHasMedia;

        return $this;
    }

    public function removeGalleryHasMedia(GalleryHasMedia $galleryHasMedia)
    {
        $this->galleryHasMedias->removeElement($galleryHasMedia);
    }
}
