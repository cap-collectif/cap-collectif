<?php

namespace Capco\AppBundle\Entity;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

abstract class AbstractUserToken
{
    protected const TOKEN_LENGTH = 64;

    /**
     * @ORM\Column(type="string", length=255)
     * @ORM\Id
     */
    protected string $token;

    /**
     * @ORM\Column(type="datetime", name="consumption_date", nullable=true)
     */
    protected ?\DateTime $consumptionDate = null;

    public function __construct(
    /**
     * @ORM\ManyToOne(targetEntity=User::class)
     * @ORM\JoinColumn(nullable=false)
     */
    protected User $user,
        ?string $token = null
    ) {
        $this->token = $token ?? self::generateToken();
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function isValid(): bool
    {
        return null === $this->getConsumptionDate();
    }

    public function getConsumptionDate(): ?\DateTime
    {
        return $this->consumptionDate;
    }

    public function setConsumptionDate(?\DateTime $consumptionDate): self
    {
        $this->consumptionDate = $consumptionDate;

        return $this;
    }

    public static function generateToken(): string
    {
        return bin2hex(random_bytes(self::TOKEN_LENGTH));
    }
}
