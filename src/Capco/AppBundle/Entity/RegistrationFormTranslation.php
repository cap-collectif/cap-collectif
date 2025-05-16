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
 *   name="registration_form_translation",
 *   uniqueConstraints= {
 *     @ORM\UniqueConstraint(
 *       name="translation_unique",
 *       columns={"translatable_id", "locale"}
 *     )
 *   }
 * )
 */
class RegistrationFormTranslation implements EntityInterface, TranslationInterface
{
    use TranslationTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="top_text", type="text")
     */
    private $topText = '';

    /**
     * @ORM\Column(name="bottom_text", type="text")
     */
    private $bottomText;

    public function getTopText(): string
    {
        return $this->topText;
    }

    public function setTopText(string $topText): self
    {
        $this->topText = $topText;

        return $this;
    }

    public function getBottomText(): ?string
    {
        return $this->bottomText;
    }

    public function setBottomText(string $bottomText): self
    {
        $this->bottomText = $bottomText;

        return $this;
    }

    public static function getTranslatableEntityClass(): string
    {
        return RegistrationForm::class;
    }
}
