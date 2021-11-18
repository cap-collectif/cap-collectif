<?php

namespace Capco\AppBundle\Entity\Security;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="user_identification_code")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Security\UserIdentificationCodeRepository")
 */
class UserIdentificationCode
{
    /**
     * @ORM\Id
     * @ORM\Column(name="identification_code", type="string", unique=true, nullable=false)
     */
    private string $identificationCode;

    /**
     * @ORM\ManyToOne(targetEntity="UserIdentificationCodeList")
     * @ORM\JoinColumn(name="list_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private ?UserIdentificationCodeList $list;

    public function getIdentificationCode(): string
    {
        return $this->identificationCode;
    }

    public function setIdentificationCode(string $identificationCode): self
    {
        $this->identificationCode = $identificationCode;

        return $this;
    }

    public function getList(): ?UserIdentificationCodeList
    {
        return $this->list;
    }

    public function setList(?UserIdentificationCodeList $list): self
    {
        $this->list = $list;

        return $this;
    }
}
