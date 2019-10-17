<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Enum\ReportingStatus as ApprobationRefusedStatus;
use Capco\AppBundle\Model\CreatableInterface;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="approbation")
 */
class Approbation implements CreatableInterface
{
    use UuidTrait;
    use TimestampableTrait;
    use ApprobationRefusedStatus;

    /**
     * @ORM\Column(name="status", type="string", nullable=false, columnDefinition="ENUM('approved', 'refused', 'awaiting')")
     */
    private $status;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="approver_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     * @Assert\NotNull()
     */
    private $approver;

    /**
     * @ORM\Column(name="reason", type="integer", nullable=true, columnDefinition="ENUM('0','1','2','3','4')")
     */
    private $reason;

    /**
     * @ORM\Column(name="details", type="text", nullable=true)
     */
    private $details;

    /**
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private $updatedAt;

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getApprover(): User
    {
        return $this->approver;
    }

    public function setApprover(User $approver): self
    {
        $this->approver = $approver;

        return $this;
    }

    public function getReason()
    {
        return $this->reason;
    }

    public function setReason(?int $reason = null): self
    {
        $this->reason = $reason;

        return $this;
    }

    public function getDetails(): ?string
    {
        return $this->details;
    }

    public function setDetails(?string $details = null): self
    {
        $this->details = $details;

        return $this;
    }
}
