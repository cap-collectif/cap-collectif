<?php

namespace Capco\AppBundle\Entity\Security;

use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Traits\OwnerableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="user_identification_code_list")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Security\UserIdentificationCodeListRepository")
 */
class UserIdentificationCodeList implements EntityInterface, Ownerable
{
    use OwnerableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $name;

    /**
     * @ORM\OneToMany(targetEntity=UserIdentificationCode::class, mappedBy="list", cascade={"persist"})
     */
    private Collection $codes;

    public function __construct()
    {
        $this->codes = new ArrayCollection();
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getCodes(): Collection
    {
        return $this->codes;
    }

    public function getCodesCount(): int
    {
        return $this->getCodes()->count();
    }
}
