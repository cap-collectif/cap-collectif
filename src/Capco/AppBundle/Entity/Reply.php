<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\DraftableInterface;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Enum\ReplyStatus;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Traits\AuthorableTrait;
use Capco\AppBundle\Traits\DraftableTrait;
use Capco\AppBundle\Traits\HasResponsesTrait;
use Capco\AppBundle\Traits\PrivatableTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="reply", indexes={
 *     @ORM\Index(name="idx_author", columns={"id", "author_id"}),
 *     @ORM\Index(name="idx_questionnaire_published", columns={"id", "questionnaire_id", "published", "is_draft", "publishedAt"}),
 *     @ORM\Index(name="idx_author_draft", columns={"id", "questionnaire_id", "author_id", "private", "is_draft"})
 * })
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ReplyRepository")
 * @CapcoAssert\HasResponsesToRequiredQuestions(message="reply.missing_required_responses", formField="questionnaire")
 * @CapcoAssert\HasAuthor()
 */
class Reply extends AbstractReply implements EntityInterface, Publishable, DraftableInterface
{
    use AuthorableTrait;
    use DraftableTrait;
    use HasResponsesTrait;
    use PrivatableTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="replies")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected ?User $author = null;

    /**
     * @ORM\OneToMany(
     *  targetEntity="Capco\AppBundle\Entity\Responses\AbstractResponse",
     *  mappedBy="reply",
     *  cascade={"persist", "remove"},
     *  orphanRemoval=true
     * )
     */
    private $responses;

    /**
     * @ORM\ManyToOne(targetEntity=Participant::class, inversedBy="replies")
     * @ORM\JoinColumn(onDelete="CASCADE")
     */
    private ?Participant $participant = null;

    public function __construct()
    {
        parent::__construct();
        $this->responses = new ArrayCollection();
    }

    public function viewerCanSee(User $viewer): bool
    {
        return $viewer === $this->getAuthor();
    }

    public function getType(): string
    {
        return 'reply';
    }

    public function setResponseOn(AbstractResponse $response)
    {
        $response->setReply($this);
    }

    public function getStatus(): ?string
    {
        if ($this->isDraft()) {
            return ReplyStatus::DRAFT;
        }
        if ($this->isPublished()) {
            return ReplyStatus::PUBLISHED;
        }

        /** @var User $author */
        $author = $this->getAuthor();
        if (!$author) {
            return null;
        }
        if ($author->isEmailConfirmed()) {
            return ReplyStatus::NOT_PUBLISHED;
        }
        $step = $this->getStep();
        if (!$step || $step->isOpen()) {
            return ReplyStatus::PENDING;
        }

        return ReplyStatus::NOT_PUBLISHED;
    }

    public function getParticipant(): ?Participant
    {
        return $this->participant;
    }

    public function setParticipant(?Participant $participant): self
    {
        $this->participant = $participant;

        return $this;
    }
}
