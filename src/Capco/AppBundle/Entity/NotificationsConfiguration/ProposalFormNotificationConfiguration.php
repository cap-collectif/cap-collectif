<?php

namespace Capco\AppBundle\Entity\NotificationsConfiguration;

use Capco\AppBundle\Entity\ProposalForm;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 */
class ProposalFormNotificationConfiguration extends AbstractNotificationConfiguration
{
    /**
     * @ORM\Column(name="on_create", type="boolean")
     */
    private $onCreate = false;

    /**
     * @ORM\Column(name="on_update", type="boolean")
     */
    private $onUpdate = false;

    /**
     * @ORM\Column(name="on_delete", type="boolean")
     */
    private $onDelete = false;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", mappedBy="notificationsConfiguration")
     */
    private $proposalForm;

    public function isOnCreate(): bool
    {
        return $this->onCreate;
    }

    public function setOnCreate(bool $onCreate): self
    {
        $this->onCreate = $onCreate;

        return $this;
    }

    public function isOnUpdate(): bool
    {
        return $this->onUpdate;
    }

    public function setOnUpdate(bool $onUpdate): self
    {
        $this->onUpdate = $onUpdate;

        return $this;
    }

    public function isOnDelete(): bool
    {
        return $this->onDelete;
    }

    public function setOnDelete(bool $onDelete): self
    {
        $this->onDelete = $onDelete;

        return $this;
    }

    public function getProposalForm(): ProposalForm
    {
        return $this->proposalForm;
    }

    public function setProposalForm(ProposalForm $proposalForm): self
    {
        $this->proposalForm = $proposalForm;

        return $this;
    }

    public function getType(): string
    {
        return 'proposalForm';
    }
}
