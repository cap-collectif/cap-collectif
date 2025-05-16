<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="category_image")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\CategoryImageRepository")
 */
class CategoryImage implements EntityInterface
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @Gedmo\Timestampable(on="change", field={"name"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    protected $updatedAt;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Media", fetch="LAZY", cascade={"persist"})
     * @ORM\JoinColumn(name="image_id", referencedColumnName="id")
     * @Assert\Valid()
     */
    private $image;

    /**
     * @ORM\Column(name="is_default", type="boolean", nullable=false, options={"default" = false})
     */
    private $isDefault = false;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
        $this->createdAt = new \DateTime();
    }

    public function getImage(): Media
    {
        return $this->image;
    }

    public function setImage(Media $image): self
    {
        $this->image = $image;

        return $this;
    }

    public function getIsDefault(): bool
    {
        return $this->isDefault;
    }

    public function setIsDefault(bool $isDefault): self
    {
        $this->isDefault = $isDefault;

        return $this;
    }
}
