<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\PublicApiTokenRepository")
 * @ORM\Table(name="public_api_token")
 */
class PublicApiToken
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="value", type="string", nullable=false)
     */
    protected $value;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    protected $user;

    public function __construct(User $user, string $value)
    {
        $this->user = $user;
        $this->value = $value;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function getUser(): User
    {
        return $this->user;
    }
}
