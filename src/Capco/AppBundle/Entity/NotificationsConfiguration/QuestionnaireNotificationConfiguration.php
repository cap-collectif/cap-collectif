<?php

namespace Capco\AppBundle\Entity\NotificationsConfiguration;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity()
 */
class QuestionnaireNotificationConfiguration extends AbstractNotificationConfiguration
{
    /**
     * @ORM\Column(name="on_questionnaire_reply_create", type="boolean", options={"default": false})
     */
    private bool $onQuestionnaireReplyCreate = false;

    /**
     * @ORM\Column(name="on_questionnaire_reply_update", type="boolean", options={"default": false})
     */
    private bool $onQuestionnaireReplyUpdate = false;

    /**
     * @ORM\Column(name="on_questionnaire_reply_delete", type="boolean", options={"default": false})
     */
    private bool $onQuestionnaireReplyDelete = false;

    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\Questionnaire", mappedBy="notificationsConfiguration")
     */
    private $questionnaire;

    /**
     * @return mixed
     */
    public function getQuestionnaire()
    {
        return $this->questionnaire;
    }

    /**
     * @param mixed $questionnaire
     *
     * @return QuestionnaireNotificationConfiguration
     */
    public function setQuestionnaire($questionnaire)
    {
        $this->questionnaire = $questionnaire;

        return $this;
    }

    public function isOnQuestionnaireReplyCreate(): bool
    {
        return $this->onQuestionnaireReplyCreate;
    }

    public function setOnQuestionnaireReplyCreate(bool $onQuestionnaireReplyCreate): self
    {
        $this->onQuestionnaireReplyCreate = $onQuestionnaireReplyCreate;

        return $this;
    }

    public function isOnQuestionnaireReplyUpdate(): bool
    {
        return $this->onQuestionnaireReplyUpdate;
    }

    public function setOnQuestionnaireReplyUpdate(bool $onQuestionnaireReplyUpdate): self
    {
        $this->onQuestionnaireReplyUpdate = $onQuestionnaireReplyUpdate;

        return $this;
    }

    public function isOnQuestionnaireReplyDelete(): bool
    {
        return $this->onQuestionnaireReplyDelete;
    }

    public function setOnQuestionnaireReplyDelete(bool $onQuestionnaireReplyDelete): self
    {
        $this->onQuestionnaireReplyDelete = $onQuestionnaireReplyDelete;

        return $this;
    }

    public function getType()
    {
        return 'questionnaire';
    }
}
