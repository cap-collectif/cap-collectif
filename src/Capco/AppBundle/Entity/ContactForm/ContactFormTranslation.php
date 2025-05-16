<?php

namespace Capco\AppBundle\Entity\ContactForm;

use Capco\AppBundle\Model\TranslationInterface;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TranslationTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ContactFormTranslationRepository")
 * @ORM\Entity()
 * @ORM\Table(
 *  name="contact_form_translation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="translation_unique",
 *      columns={"translatable_id", "locale"}
 *    )
 * })
 */
class ContactFormTranslation implements EntityInterface, TranslationInterface
{
    use SluggableTitleTrait;
    use TextableTrait;
    use TranslationTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="body", type="text", nullable=true)
     */
    private $body;

    /**
     * @ORM\Column(name="confidentiality", type="text", nullable=true)
     */
    private $confidentiality;

    public function getConfidentiality(): ?string
    {
        return $this->confidentiality;
    }

    public function setConfidentiality(?string $confidentiality): self
    {
        $this->confidentiality = $confidentiality;

        return $this;
    }

    public static function getTranslatableEntityClass(): string
    {
        return ContactForm::class;
    }
}
