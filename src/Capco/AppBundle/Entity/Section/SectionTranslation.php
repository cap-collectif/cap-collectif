<?php

namespace Capco\AppBundle\Entity\Section;

use Capco\AppBundle\Model\TranslationInterface;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TranslationTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SectionTranslationRepository")
 * @ORM\Table(
 *  name="section_translation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="translation_unique",
 *      columns={"translatable_id", "locale"}
 *    )
 * })
 */
class SectionTranslation implements TranslationInterface
{
    use TextableTrait;
    use TranslationTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="title", type="string", length=100, nullable=true)
     */
    private $title = '';

    /**
     * @ORM\Column(name="teaser", type="text", nullable=true)
     */
    private $teaser;

    /**
     * @ORM\Column(name="body", type="text", nullable=true)
     */
    private $body;

    public static function getTranslatableEntityClass(): string
    {
        return Section::class;
    }

    public function getTeaser(): ?string
    {
        return $this->teaser;
    }

    public function setTeaser(?string $teaser = null): self
    {
        $this->teaser = $teaser;

        return $this;
    }

    public function getBody(): ?string
    {
        return $this->body;
    }

    public function setBody(?string $body = null): self
    {
        $this->body = $body;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title = null): self
    {
        $this->title = $title;

        return $this;
    }
}
