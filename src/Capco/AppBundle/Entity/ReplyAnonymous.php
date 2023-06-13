<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Enum\ReplyStatus;
use Capco\AppBundle\Traits\HasResponsesTrait;
use Capco\AppBundle\Traits\TokenTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="reply_anonymous", indexes={
 *     @ORM\Index(name="idx_questionnaire_published", columns={"id", "questionnaire_id", "published", "publishedAt"}),
 * })
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ReplyAnonymousRepository")
 * @CapcoAssert\HasResponsesToRequiredQuestions(message="reply.missing_required_responses", formField="questionnaire")
 */
class ReplyAnonymous extends AbstractReply
{
    use HasResponsesTrait;
    use TokenTrait;

    /**
     * @Assert\Email()
     * @ORM\Column(name="participant_email", type="string", nullable=true)
     */
    private ?string $participantEmail;

    /**
     * @ORM\Column(name="email_confirmed", type="boolean", nullable=false, options={"default": false})
     */
    private bool $emailConfirmed = false;

    /**
     * @ORM\OneToMany(
     *  targetEntity="Capco\AppBundle\Entity\Responses\AbstractResponse",
     *  mappedBy="replyAnonymous",
     *  cascade={"persist", "remove"},
     *  orphanRemoval=true
     * )
     */
    private $responses;

    public function __construct()
    {
        parent::__construct();
        $this->responses = new ArrayCollection();
    }

    public function setResponseOn(AbstractResponse $response): void
    {
        $response->setReplyAnonymous($this);
    }

    /**
     * @return string
     */
    public function getParticipantEmail(): ?string
    {
        return $this->participantEmail;
    }

    public function setParticipantEmail(?string $participantEmail = null): self
    {
        $this->participantEmail = $participantEmail;

        return $this;
    }

    public function isDraft(): bool
    {
        return false;
    }

    public function getType(): string
    {
        return 'replyAnonymous';
    }

    public function getStatus(): string
    {
        return ReplyStatus::PUBLISHED;
    }

    public function isEmailConfirmed(): bool
    {
        return $this->emailConfirmed;
    }

    public function setEmailConfirmed(bool $emailConfirmed): self
    {
        $this->emailConfirmed = $emailConfirmed;

        return $this;
    }

    public function confirmEmail(): self
    {
        $this->emailConfirmed = true;

        return $this;
    }
}
