<?php

namespace Capco\AppBundle\Entity;

use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="user_requirement")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\UserRequirementRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class UserRequirement implements EntityInterface
{
    /**
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    protected $user;

    /**
     * @ORM\Id
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Requirement")
     * @ORM\JoinColumn(name="requirement_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    protected $requirement;

    /**
     * @ORM\Column(name="value", type="boolean", nullable=false)
     */
    protected $value;

    public function __construct(User $user, Requirement $requirement, bool $value = true)
    {
        $this->user = $user;
        $this->requirement = $requirement;
        $this->value = $value;
    }

    public function getValue(): bool
    {
        return $this->value;
    }

    public function setValue(bool $value): self
    {
        $this->value = $value;

        return $this;
    }

    public function getRequirement(): Requirement
    {
        return $this->requirement;
    }

    public function getUser(): User
    {
        return $this->user;
    }
}
