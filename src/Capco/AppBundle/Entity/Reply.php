<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Command\Service\ExportInterface\ExportableContributionInterface;
use Capco\AppBundle\Entity\Interfaces\ContributionInterface;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Interfaces\DraftableInterface;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Enum\ReplyStatus;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Model\VoteContribution;
use Capco\AppBundle\Traits\AuthorableTrait;
use Capco\AppBundle\Traits\AuthorInformationTrait;
use Capco\AppBundle\Traits\CompletionStatusTrait;
use Capco\AppBundle\Traits\DraftableTrait;
use Capco\AppBundle\Traits\HasResponsesTrait;
use Capco\AppBundle\Traits\PrivatableTrait;
use Capco\AppBundle\Traits\PublishableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Table(name="reply", indexes={
 *     @ORM\Index(name="idx_author", columns={"id", "author_id"}),
 *     @ORM\Index(name="idx_questionnaire_published", columns={"id", "questionnaire_id", "published", "is_draft", "publishedAt"}),
 *     @ORM\Index(name="idx_author_draft", columns={"id", "questionnaire_id", "author_id", "private", "is_draft"})
 * })
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ReplyRepository")
 * @CapcoAssert\HasResponsesToRequiredQuestions(message="reply.missing_required_responses", formField="questionnaire")
 */
class Reply implements EntityInterface, Publishable, DraftableInterface, Contribution, VoteContribution, ContributionInterface, ExportableContributionInterface
{
    use AuthorableTrait;
    use AuthorInformationTrait;
    use CompletionStatusTrait;
    use DraftableTrait;
    use HasResponsesTrait;
    use HasResponsesTrait;
    use PrivatableTrait;
    use PublishableTrait;
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="replies")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected ?User $author = null;

    /**
     * @var Collection<int, AbstractResponse>
     * @ORM\OneToMany(
     *  targetEntity="Capco\AppBundle\Entity\Responses\AbstractResponse",
     *  mappedBy="reply",
     *  cascade={"persist", "remove"},
     *  orphanRemoval=true
     * )
     */
    private Collection $responses;

    /**
     * @Assert\NotNull()
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Questionnaire", inversedBy="replies")
     * @ORM\JoinColumn(name="questionnaire_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private Questionnaire $questionnaire;

    /**
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private \DateTimeInterface $updatedAt;

    /**
     * @ORM\ManyToOne(targetEntity=Participant::class, inversedBy="replies", cascade={"persist"})
     * @ORM\JoinColumn(onDelete="CASCADE")
     */
    private ?Participant $participant = null;

    public function __construct()
    {
        $this->responses = new ArrayCollection();
        $this->updatedAt = new \DateTime();
    }

    public function viewerCanSee(User $viewer): bool
    {
        return $viewer === $this->getAuthor();
    }

    public function getType(): string
    {
        return $this->isAnonymous() ? 'replyAnonymous' : 'reply';
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

    public function setContributor(ContributorInterface $contributor): self
    {
        if ($contributor instanceof User) {
            $this->setParticipant(null);
            $this->setAuthor($contributor);

            return $this;
        }
        if ($contributor instanceof Participant) {
            $this->setParticipant($contributor);
            $this->setAuthor(null);

            return $this;
        }

        return $this;
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

    /**
     * @return Collection<int, AbstractQuestion>
     */
    public function getResponsesQuestions(): Collection
    {
        $questionnaire = $this->getQuestionnaire();

        return $questionnaire ? $questionnaire->getRealQuestions() : new ArrayCollection();
    }

    public function isViewerProjectOwner(User $viewer): bool
    {
        return $viewer->isProjectAdmin()
            && $this->getQuestionnaire()
                ->getStep()
                ->getProject()
                ->getOwner() === $viewer;
    }

    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchPriority(): int
    {
        return 4;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'reply';
    }

    /**
     * @return string[]
     */
    public static function getElasticsearchSerializationGroups(): array
    {
        return [
            'ElasticsearchReplyNestedAuthor',
            'ElasticsearchReply',
            'ElasticsearchReplyNestedStep',
            'ElasticsearchReplyNestedProject',
        ];
    }

    public function getUpdatedAt(): \DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getParticipantEmail(): ?string
    {
        if (!$this->participant) {
            return null;
        }

        return $this->participant->getEmail();
    }

    public function isAnonymous(): bool
    {
        return null === $this->author && null !== $this->participant;
    }

    public function getContributor(): ContributorInterface
    {
        return $this->author ?? $this->participant;
    }
}
