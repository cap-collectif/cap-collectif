<?php

namespace Capco\UserBundle\Entity;

use Capco\AppBundle\Model\SonataTranslatableInterface;
use Capco\AppBundle\Model\Translatable;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Traits\SonataTranslatableTrait;
use Capco\AppBundle\Traits\TranslatableTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\HasLifecycleCallbacks()
 */
class UserType implements Translatable, SonataTranslatableInterface
{
    use UuidTrait;
    use TranslatableTrait;
    use SonataTranslatableTrait;

    const FILTER_ALL = 'all';

    /**
     * @var \DateTime
     */
    private $createdAt;

    /**
     * @var \DateTime
     *
     * @todo create a listener on children
     */
    private $updatedAt;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
    }

    public function __toString(): string
    {
        return $this->getName() ?? 'New user type';
    }

    public function getName(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getName();
    }

    public function setName(string $name): self
    {
        $this->translate(null, false)->setName($name);

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

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $value): self
    {
        $this->createdAt = $value;

        return $this;
    }

    public function getUpdatedAt(): \DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public static function getTranslationEntityClass(): string
    {
        return UserTypeTranslation::class;
    }
}
