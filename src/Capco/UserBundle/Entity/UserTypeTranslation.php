<?php

namespace Capco\UserBundle\Entity;

use Capco\AppBundle\Model\TranslationInterface;
use Capco\AppBundle\Traits\TranslationTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\UserBundle\Repository\UserTypeTranslationRepository")
 * @ORM\Table(
 *  name="user_type_translation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="translation_unique",
 *      columns={"translatable_id", "locale"}
 *    )
 * })
 */
class UserTypeTranslation implements EntityInterface, TranslationInterface
{
    use TranslationTrait;
    use UuidTrait;

    private $name;
    private $slug;

    public static function getTranslatableEntityClass(): string
    {
        return UserType::class;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

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
}
