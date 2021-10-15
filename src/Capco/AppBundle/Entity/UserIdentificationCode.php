<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="user_identification_code")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\UserIdentificationCodeRepository")
 */
class UserIdentificationCode
{
    /**
     * @ORM\Id
     * @ORM\Column(name="identification_code", type="string", unique=true, nullable=false)
     */
    private string $identificationCode;

    public function getIdentificationCode(): string
    {
        return $this->identificationCode;
    }

    public function setIdentificationCode(string $identificationCode): self
    {
        $this->identificationCode = $identificationCode;

        return $this;
    }
}
