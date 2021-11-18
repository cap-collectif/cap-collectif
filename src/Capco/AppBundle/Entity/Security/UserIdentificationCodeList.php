<?php

namespace Capco\AppBundle\Entity\Security;

use Capco\AppBundle\Traits\OwnerTrait;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\UuidTrait;

/**
 * @ORM\Table(name="user_identification_code_list")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Security\UserIdentificationCodeListRepository")
 */
class UserIdentificationCodeList
{
    use OwnerTrait;
    use UuidTrait;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private string $name;

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }
}
