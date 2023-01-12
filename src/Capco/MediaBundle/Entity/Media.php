<?php

namespace Capco\MediaBundle\Entity;

use Capco\AppBundle\Traits\UuidTrait;
use Capco\MediaBundle\Provider\AllowedExtensions;
use Doctrine\Common\Collections\ArrayCollection;
use Sonata\MediaBundle\Entity\BaseMedia;

class Media extends BaseMedia
{
    use UuidTrait;
    protected $providerStatus = 1;

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

    public function isImage(): bool
    {
        return \in_array($this->contentType, AllowedExtensions::ALLOWED_MIMETYPES_IMAGE);
    }
}
