<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\TranslationInterface;
use Capco\AppBundle\Traits\MetaDescriptionTrait;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TranslationTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\EventTranslationRepository")
 * @ORM\Table(
 *  name="event_translation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="translation_unique",
 *      columns={"translatable_id", "locale"}
 *    )
 * })
 */
class EventTranslation implements TranslationInterface, \Stringable
{
    use MetaDescriptionTrait;
    use SluggableTitleTrait;
    use TextableTrait;
    use TranslationTrait;
    use UuidTrait;

    /**
     * @Gedmo\Slug(fields={"title"}, updatable=false, unique=true)
     * @ORM\Column(length=255, nullable=false, unique=true)
     */
    protected $slug;

    /**
     * @ORM\Column(name="link", type="string", length=255, nullable=true)
     * @Assert\Url()
     */
    private $link;

    public function __toString(): string
    {
        return $this->getId() ? $this->getTitle() : 'New event';
    }

    public static function getTranslatableEntityClass(): string
    {
        return Event::class;
    }

    public function setLink(?string $link = null): self
    {
        $this->link = $link;

        return $this;
    }

    public function getLink(): ?string
    {
        return $this->link;
    }
}
