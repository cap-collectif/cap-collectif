<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\IdTrait;
use Capco\MediaBundle\Entity\Media;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * SiteImage.
 *
 * @ORM\Table(name="site_image")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SiteImageRepository")
 */
class SiteImage
{
    use IdTrait;

    /**
     * @var string
     *
     * @ORM\Column(name="keyname", type="string", length=255)
     */
    private $keyname;

    /**
     * @var bool
     * @ORM\Column(name="is_social_network_thumbnail", type="boolean", nullable=false)
     */
    private $isSocialNetworkThumbnail = false;

    /**
     * @var
     *
     * @ORM\ManyToOne(targetEntity="Capco\MediaBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="Media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $media;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"media"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * @var int
     * @ORM\Column(name="position", type="integer")
     */
    private $position = 0;

    /**
     * @var string
     *
     * @ORM\Column(name="category", type="text")
     */
    private $category = 'settings.global';

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->updatedAt = new \DateTime();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getKeyname() : 'New image';
    }

    /**
     * Set keyname.
     *
     * @param string $keyname
     *
     * @return SiteImage
     */
    public function setKeyname($keyname)
    {
        $this->keyname = $keyname;

        return $this;
    }

    /**
     * Get keyname.
     *
     * @return string
     */
    public function getKeyname()
    {
        return $this->keyname;
    }

    /**
     * Get media.
     *
     * @return mixed
     */
    public function getMedia(): ?Media
    {
        return $this->media;
    }

    /**
     * Set media.
     *
     * @param mixed $media
     */
    public function setMedia(Media $media)
    {
        $this->media = $media;
    }

    /**
     * Get updatedAt.
     *
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * Set updatedAt.
     *
     * @param \DateTime $updatedAt
     *
     * @return SiteImage
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * Get isEnabled.
     *
     * @return bool
     */
    public function getIsEnabled()
    {
        return $this->isEnabled;
    }

    /**
     * Set isEnabled.
     *
     *
     * @param bool isEnabled
     * @param mixed $isEnabled
     *
     * @return SiteImage
     */
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    /**
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @return mixed
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * @param mixed $position
     */
    public function setPosition($position)
    {
        $this->position = $position;
    }

    /**
     * @return string
     */
    public function getCategory()
    {
        return $this->category;
    }

    /**
     * @param string $category
     */
    public function setCategory($category)
    {
        $this->category = $category;
    }

    public function isSocialNetworkThumbnail(): bool
    {
        return $this->isSocialNetworkThumbnail;
    }

    public function setIsSocialNetworkThumbnail(bool $isSocialNetworkThumbnail)
    {
        $this->isSocialNetworkThumbnail = $isSocialNetworkThumbnail;

        return $this;
    }
}
