<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Traits\AuthorInformationTrait;
use Capco\AppBundle\Traits\HasResponsesTrait;
use Capco\AppBundle\Traits\PublishableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TokenTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="reply_anonymous", indexes={
 *     @ORM\Index(name="idx_questionnaire_published", columns={"id", "questionnaire_id", "published", "publishedAt"}),
 * })
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ReplyAnonymousRepository")
 * @CapcoAssert\HasResponsesToRequiredQuestions(message="reply.missing_required_responses", formField="questionnaire")
 */
class ReplyAnonymous extends AbstractReply
{
    use AuthorInformationTrait;
    use HasResponsesTrait;
    use PublishableTrait;
    use TimestampableTrait;
    use TokenTrait;
    use UuidTrait;

    /**
     * @Assert\NotNull()
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Questionnaire", inversedBy="replies")
     * @ORM\JoinColumn(name="questionnaire_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $questionnaire;

    /**
     * @ORM\OneToMany(
     *  targetEntity="Capco\AppBundle\Entity\Responses\AbstractResponse",
     *  mappedBy="replyAnonymous",
     *  cascade={"persist", "remove"},
     *  orphanRemoval=true
     * )
     */
    private $responses;

    /**
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private \DateTimeInterface $updatedAt;

    /**
     * @ORM\Column(name="participant_email", type="string", nullable=true)
     */
    private ?string $participantEmail;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
        $this->responses = new ArrayCollection();
    }

    public function __toString(): string
    {
        return $this->id;
    }

    public function getKind(): string
    {
        return 'reply';
    }

    public function getRelated()
    {
        return null;
    }

    public function getQuestionnaire(): ?Questionnaire
    {
        return $this->questionnaire;
    }

    public function getStep(): ?QuestionnaireStep
    {
        return $this->getQuestionnaire() ? $this->getQuestionnaire()->getStep() : null;
    }

    public function setQuestionnaire(Questionnaire $questionnaire): self
    {
        $this->questionnaire = $questionnaire;

        return $this;
    }

    public function getProject(): ?Project
    {
        return $this->getStep() ? $this->getStep()->getProject() : null;
    }

    public function getResponsesQuestions(): Collection
    {
        $questionnaire = $this->getQuestionnaire();

        return $questionnaire ? $questionnaire->getRealQuestions() : new ArrayCollection();
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
}
