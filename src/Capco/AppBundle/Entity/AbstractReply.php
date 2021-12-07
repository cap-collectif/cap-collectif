<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\VoteContribution;
use Capco\AppBundle\Traits\AuthorInformationTrait;
use Capco\AppBundle\Traits\PublishableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\MappedSuperclass
 */
abstract class AbstractReply implements Contribution, VoteContribution
{
    use AuthorInformationTrait;
    use PublishableTrait;
    use TimestampableTrait;
    use UuidTrait;

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
    }

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

    public function isViewerProjectOwner(User $viewer): bool
    {
        return $viewer->isProjectAdmin() && $this->getQuestionnaire()->getStep()->getProject()->getOwner() === $viewer;
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

    public static function getElasticsearchSerializationGroups(): array
    {
        return [
            'ElasticsearchReplyNestedAuthor',
            'ElasticsearchReply',
            'ElasticsearchReplyNestedStep',
            'ElasticsearchReplyNestedProject',
        ];
    }

}
