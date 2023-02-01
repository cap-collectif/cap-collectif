<?php

namespace Capco\AppBundle\Entity\ContactForm;

use Capco\AppBundle\Model\Translatable;
use Capco\AppBundle\Traits\BodyUsingJoditWysiwygTrait;
use Capco\AppBundle\Traits\TranslatableTrait;
use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\UuidTrait;

/**
 * @ORM\Table(name="contact_form")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ContactFormRepository")
 */
class ContactForm implements Translatable
{
    use BodyUsingJoditWysiwygTrait;
    use TranslatableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="email", type="string", length=255, nullable=false)
     */
    private $email;

    // todo deprecated should be soon removed
    /**
     * @ORM\Column(name="interlocutor", type="string", length=255, nullable=true)
     */
    private $interlocutor;

    /**
     * @ORM\Column(name="confidentiality_using_jodit_wysiwyg", type="boolean", nullable=false, options={"default": false})
     */
    private bool $confidentialityUsingJoditWysiwyg = false;

    public function isConfidentialityUsingJoditWysiwyg(): bool
    {
        return $this->confidentialityUsingJoditWysiwyg;
    }

    public function setConfidentialityUsingJoditWysiwyg(
        bool $confidentialityUsingJoditWysiwyg
    ): self {
        $this->confidentialityUsingJoditWysiwyg = $confidentialityUsingJoditWysiwyg;

        return $this;
    }

    public function getTitle(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getTitle();
    }

    public function setTitle(string $title): self
    {
        $this->translate(null, false)->setTitle($title);

        return $this;
    }

    public function getSlug(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getSlug();
    }

    public function setSlug(string $slug): self
    {
        $this->translate(null, false)->setSlug($slug);

        return $this;
    }

    public function getConfidentiality(
        ?string $locale = null,
        ?bool $fallbackToDefault = false
    ): ?string {
        return $this->translate($locale, $fallbackToDefault)->getConfidentiality();
    }

    public function setConfidentiality(?string $confidentiality): self
    {
        $this->translate(null, false)->setConfidentiality($confidentiality);

        return $this;
    }

    public function getBody(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getBody();
    }

    public function getBodyText(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getBodyText();
    }

    public function getBodyExcerpt(
        int $nb = 100,
        ?string $locale = null,
        ?bool $fallbackToDefault = false
    ): string {
        return $this->translate($locale, $fallbackToDefault)->getBodyExcerpt($nb);
    }

    public function getBodyTextExcerpt(
        int $nb = 100,
        ?string $locale = null,
        ?bool $fallbackToDefault = false
    ): string {
        return $this->translate($locale, $fallbackToDefault)->getBodyTextExcerpt($nb);
    }

    public function setBody(?string $body = null): self
    {
        $this->translate(null, false)->setBody($body);

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getInterlocutor(): ?string
    {
        return $this->interlocutor;
    }

    public function setInterlocutor(?string $interlocutor): self
    {
        $this->interlocutor = $interlocutor;

        return $this;
    }

    public static function getTranslationEntityClass(): string
    {
        return ContactFormTranslation::class;
    }
}
