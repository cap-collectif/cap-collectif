<?php

namespace Capco\AppBundle\Entity\District;

use Capco\AppBundle\Traits\FollowableTrait;
use Capco\AppBundle\Traits\Media\CoverTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TranslatableTrait;
use Capco\MediaBundle\Entity\Media;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProjectDistrictRepository")
 */
class ProjectDistrict extends AbstractDistrict
{
    use CoverTrait;
    use FollowableTrait;
    use TextableTrait;
    use TranslatableTrait;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Follower", mappedBy="projectDistrict", cascade={"persist"}, orphanRemoval=true)
     */
    private $followers;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\District\ProjectDistrictPositioner", mappedBy="district", cascade={"persist", "remove"})
     */
    private $projectDistrictPositioners;

    /**
     * @ORM\OneToOne(targetEntity="Capco\MediaBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?Media $media;

    public function __construct()
    {
        $this->followers = new ArrayCollection();
        parent::__construct();
    }

    public function __toString(): string
    {
        return $this->getId() ? $this->getName() : 'New district';
    }

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
        }
    }

    public function getProjectDistrictPositioners(): iterable
    {
        return $this->projectDistrictPositioners;
    }

    public function setProjectDistrictPositioners(iterable $projectDistrictPositioners): self
    {
        $this->projectDistrictPositioners = $projectDistrictPositioners;

        return $this;
    }

    public function getDescription(?string $locale = null, ?bool $fallbackToDefault = true): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getDescription();
    }

    public function setDescription(?string $description = null): self
    {
        $this->translate(null, false)->setDescription($description);

        return $this;
    }

    public static function getTranslationEntityClass(): string
    {
        return DistrictTranslation::class;
    }
}
