<?php

namespace Capco\AppBundle\Entity\NotificationsConfiguration;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 */
class ProposalFormNotificationConfiguration extends AbstractNotificationConfiguration implements EntityInterface
{
    /**
     * @ORM\Column(name="on_create", type="boolean", options={"default": false})
     */
    private bool $onCreate = false;

    /**
     * @ORM\Column(name="on_update", type="boolean", options={"default": false})
     */
    private bool $onUpdate = false;

    /**
     * @ORM\Column(name="on_delete", type="boolean", options={"default": false})
     */
    private bool $onDelete = false;

    /**
     * @ORM\Column(name="on_comment_create", type="boolean", options={"default": false})
     */
    private bool $onCommentCreate = false;

    /**
     * @ORM\Column(name="on_comment_update", type="boolean", options={"default": false})
     */
    private bool $onCommentUpdate = false;

    /**
     * @ORM\Column(name="on_comment_delete", type="boolean", options={"default": false})
     */
    private bool $onCommentDelete = false;

    /**
     * @ORM\Column(name="on_proposal_news_create", type="boolean", options={"default": false})
     */
    private bool $onProposalNewsCreate = false;

    /**
     * @ORM\Column(name="on_proposal_news_update", type="boolean", options={"default": false})
     */
    private bool $onProposalNewsUpdate = false;

    /**
     * @ORM\Column(name="on_proposal_news_delete", type="boolean", options={"default": false})
     */
    private bool $onProposalNewsDelete = false;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalForm", mappedBy="notificationsConfiguration")
     */
    private ProposalForm $proposalForm;

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

    public function isOnCommentCreate(): bool
    {
        return $this->onCommentCreate;
    }

    public function setOnCommentCreate(bool $onCommentCreate): self
    {
        $this->onCommentCreate = $onCommentCreate;

        return $this;
    }

    public function isOnCommentUpdate(): bool
    {
        return $this->onCommentUpdate;
    }

    public function setOnCommentUpdate(bool $onCommentUpdate): self
    {
        $this->onCommentUpdate = $onCommentUpdate;

        return $this;
    }

    public function isOnCommentDelete(): bool
    {
        return $this->onCommentDelete;
    }

    public function setOnCommentDelete(bool $onCommentDelete): self
    {
        $this->onCommentDelete = $onCommentDelete;

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

    public function isOnProposalNewsCreate(): bool
    {
        return $this->onProposalNewsCreate;
    }

    public function setOnProposalNewsCreate(bool $onProposalNewsCreate): self
    {
        $this->onProposalNewsCreate = $onProposalNewsCreate;

        return $this;
    }

    public function isOnProposalNewsUpdate(): bool
    {
        return $this->onProposalNewsUpdate;
    }

    public function setOnProposalNewsUpdate(bool $onProposalNewsUpdate): self
    {
        $this->onProposalNewsUpdate = $onProposalNewsUpdate;

        return $this;
    }

    public function isOnProposalNewsDelete(): bool
    {
        return $this->onProposalNewsDelete;
    }

    public function setOnProposalNewsDelete(bool $onProposalNewsDelete): self
    {
        $this->onProposalNewsDelete = $onProposalNewsDelete;

        return $this;
    }

    public function getType(): string
    {
        return 'proposalForm';
    }
}
