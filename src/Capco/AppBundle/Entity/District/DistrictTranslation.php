<?php

namespace Capco\AppBundle\Entity\District;

use Capco\AppBundle\Model\Translation;
use Capco\AppBundle\Traits\Text\DescriptionTrait;
use Capco\AppBundle\Traits\TranslationTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\DistrictTranslationRepository")
 * @ORM\Entity()
 * @ORM\Table(
 *  name="district_translation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="translation_unique",
 *      columns={"translatable_id", "locale"}
 *    )
 * })
 */
class DistrictTranslation implements Translation
{
    use DescriptionTrait;
    use TranslationTrait;
    use UuidTrait;

    /**
     * @Gedmo\Slug(fields={"name"}, updatable=false, unique=true)
     * @ORM\Column(length=255)
     */
    protected ?string $slug = null;

    /**
     * @ORM\Column(name="name", type="string", length=255)
     */
    private ?string $name = null;

    /**
     * @ORM\Column(name="title_on_map", type="string", length=255, nullable=true)
     */
    private ?string $titleOnMap = null;

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getTitleOnMap(): ?string
    {
        return $this->titleOnMap;
    }

    public function setTitleOnMap(?string $titleOnMap): self
    {
        $this->titleOnMap = $titleOnMap;

        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): self
    {
        $this->slug = $slug;

        return $this;
    }

    public static function getTranslatableEntityClass(): string
    {
        return AbstractDistrict::class;
    }
}
