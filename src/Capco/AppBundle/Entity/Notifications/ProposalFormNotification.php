<?php

namespace Capco\AppBundle\Entity\Notifications;

use Capco\AppBundle\Entity\ProposalForm;
use Doctrine\ORM\Mapping as ORM;

/**
 * Class ProposalFormNotification
 *
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalFormNotificationRepository")
 */
class ProposalFormNotification extends AbstractNotification
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
     * @var ProposalForm
     *
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", fetch="LAZY", cascade={"persist", "remove"}, inversedBy="notifications")
     * @ORM\JoinColumn(name="proposal_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $proposalForm;

    public function isOnCreate(): bool
    {
        return $this->onCreate;
    }

    public function setOnCreate(bool $onCreate) : self
    {
        $this->onCreate = $onCreate;

        return $this;
    }

    public function isOnUpdate(): bool
    {
        return $this->onUpdate;
    }

    public function setOnUpdate(bool $onUpdate) : self
    {
        $this->onUpdate = $onUpdate;

        return $this;
    }

    public function isOnDelete(): bool
    {
        return $this->onDelete;
    }

    public function setOnDelete(bool $onDelete) : self
    {
        $this->onDelete = $onDelete;

        return $this;
    }

    public function getProposalForm()
    {
        return $this->proposalForm;
    }

    public function setProposalForm(ProposalForm $proposalForm) : self
    {
        $this->proposalForm = $proposalForm;
        $proposalForm->setNotifications($this);

        return $this;
    }

    public function getType() : string
    {
        return 'proposalForm';
    }
}
