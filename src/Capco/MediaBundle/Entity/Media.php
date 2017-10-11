<?php

namespace Capco\MediaBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Sonata\MediaBundle\Entity\BaseMedia as BaseMedia;

class Media extends BaseMedia
{
    /**
     * @var int
     */
    protected $id;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->galleryHasMedias = new ArrayCollection();
    }

    /**
     * Get id.
     *
     * @return int $id
     */
    public function getId()
    {
        return $this->id;
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
