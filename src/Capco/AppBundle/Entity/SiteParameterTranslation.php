<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\TranslationInterface;
use Capco\AppBundle\Traits\TranslationTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(
 *  name="site_parameter_translation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="translation_unique",
 *      columns={"translatable_id", "locale"}
 *    )
 * })
 */
class SiteParameterTranslation implements EntityInterface, TranslationInterface
{
    use TranslationTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="value", type="text")
     */
    private $value;

    public function setValue($value): self
    {
        $this->value = $value;

        return $this;
    }

    public function getValue()
    {
        return $this->value;
    }

    public static function getTranslatableEntityClass(): string
    {
        return SiteParameter::class;
    }
}
