<?php

namespace Capco\AppBundle\Entity\District;

use Capco\AppBundle\Traits\Text\DescriptionTrait;
use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Model\Translation;
use Capco\AppBundle\Traits\TranslationTrait;

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
     * @ORM\Column(name="name", type="string", length=255)
     */
    private $name;

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

    public static function getTranslatableEntityClass(): string
    {
        return AbstractDistrict::class;
    }
}
