<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Elasticsearch\IndexableInterface;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Traits\DescriptionUsingJoditWysiwygTrait;
use Capco\AppBundle\Traits\PositionableTrait;
use Capco\AppBundle\Traits\TitleTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="question_choice")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\QuestionChoiceRepository")
 */
class QuestionChoice implements IndexableInterface, \Stringable
{
    use DescriptionUsingJoditWysiwygTrait;
    use PositionableTrait;
    use TitleTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="description", type="text", nullable=true)
     */
    private $description;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Media", cascade={"persist"})
     * @ORM\JoinColumn(name="image_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private $image;

    /**
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion", inversedBy="choices")
     * @ORM\JoinColumn(name="question_id", referencedColumnName="id", nullable=false)
     */
    private $question;

    /**
     * @CapcoAssert\CheckColor
     * @ORM\Column(name="color", type="string", length=7, nullable=true)
     */
    private $color;

    /**
     * @ORM\Column(name="temporary_id", type="string", nullable=true, length=255)
     * @ORM\GeneratedValue(strategy="UUID")
     */
    private ?string $temporaryId = null;

    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
        }
    }

    public function __toString(): string
    {
        return (string) ($this->title ?? 'New QuestionChoice');
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(?string $color = null): self
    {
        $this->color = $color;

        return $this;
    }

    public function getQuestion(): AbstractQuestion
    {
        return $this->question;
    }

    /**
     * @param AbstractQuestion $question
     *
     * @return $this
     */
    public function setQuestion(?AbstractQuestion $question): self
    {
        $this->question = $question;

        return $this;
    }

    /**
     * @return string
     */
    public function getDescription(): ?string
    {
        return $this->description;
    }

    /**
     * @param string $description
     *
     * @return $this
     */
    public function setDescription($description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getImage(): ?Media
    {
        return $this->image;
    }

    public function setImage(?Media $image = null): self
    {
        $this->image = $image;

        return $this;
    }

    public function getTemporaryId(): ?string
    {
        return $this->temporaryId;
    }

    public function setTemporaryId(?string $temporaryId): self
    {
        $this->temporaryId = $temporaryId;

        return $this;
    }

    /**
     * {@inheritdoc}
     */
    public function isIndexable(): bool
    {
        return true;
    }

    /**
     * {@inheritdoc}
     */
    public static function getElasticsearchTypeName(): string
    {
        return 'questionChoice';
    }

    /**
     * {@inheritdoc}
     */
    public static function getElasticsearchSerializationGroups(): array
    {
        return ['ElasticsearchQuestionChoice', 'ElasticsearchQuestionChoiceNestedQuestion'];
    }

    public static function getElasticsearchPriority(): int
    {
        return 17;
    }
}
