<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 * @ORM\Table(
 *     name="hub_metadata",
 *     uniqueConstraints={
 *         @ORM\UniqueConstraint(name="hub_metadata_step_unique", columns={"step_id"})
 *     }
 * )
 */
class HubMetadata
{
    use UuidTrait;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Steps\AbstractStep", inversedBy="hubMetadata")
     * @ORM\JoinColumn(name="step_id", referencedColumnName="id", nullable=false, onDelete="CASCADE")
     */
    private ?AbstractStep $step = null;

    /**
     * @ORM\Column(name="enabled", type="boolean", options={"default": false})
     */
    private bool $enabled = false;

    /**
     * @ORM\Column(name="aiot_code", type="string", length=255, nullable=true)
     */
    private ?string $aiotCode = null;

    /**
     * @ORM\Column(name="folder_number", type="string", length=255, nullable=true)
     */
    private ?string $folderNumber = null;

    /**
     * @ORM\Column(name="contact_email", type="string", length=255, nullable=true)
     */
    private ?string $contactEmail = null;

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): self
    {
        $this->enabled = $enabled;

        return $this;
    }

    public function getStep(): ?AbstractStep
    {
        return $this->step;
    }

    public function setStep(AbstractStep $step): self
    {
        $this->step = $step;

        return $this;
    }

    public function getAiotCode(): ?string
    {
        return $this->aiotCode;
    }

    public function setAiotCode(?string $aiotCode): self
    {
        $this->aiotCode = $aiotCode;

        return $this;
    }

    public function getFolderNumber(): ?string
    {
        return $this->folderNumber;
    }

    public function setFolderNumber(?string $folderNumber): self
    {
        $this->folderNumber = $folderNumber;

        return $this;
    }

    public function getContactEmail(): ?string
    {
        return $this->contactEmail;
    }

    public function setContactEmail(?string $contactEmail): self
    {
        $this->contactEmail = $contactEmail;

        return $this;
    }

    public function isComplete(): bool
    {
        return null !== $this->aiotCode
            && '' !== trim($this->aiotCode)
            && null !== $this->folderNumber
            && '' !== trim($this->folderNumber)
            && null !== $this->contactEmail
            && '' !== trim($this->contactEmail);
    }
}
