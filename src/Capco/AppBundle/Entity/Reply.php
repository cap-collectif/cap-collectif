<?php
namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Model\VoteContribution;
use Capco\AppBundle\Traits\PublishableTrait;
use Capco\AppBundle\Traits\HasResponsesTrait;
use Capco\AppBundle\Traits\PrivatableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Enum\ReplyPublicationStatus;
use Capco\AppBundle\Traits\DraftableTrait;

/**
 * @ORM\Table(name="reply")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ReplyRepository")
 * @CapcoAssert\HasResponsesToRequiredQuestions(message="reply.missing_required_responses", formField="questionnaire")
 */
class Reply implements Publishable, Contribution, VoteContribution
{
    use UuidTrait;
    use TimestampableTrait;
    use PrivatableTrait;
    use HasResponsesTrait;
    use PublishableTrait;
    use DraftableTrait;

    /**
     * @Assert\NotNull()
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User", inversedBy="replies")
     * @ORM\JoinColumn(name="author_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private $author;

    /**
     * @Assert\NotNull()
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Questionnaire", inversedBy="replies")
     * @ORM\JoinColumn(name="questionnaire_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $questionnaire;

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
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    public function __construct()
    {
        $this->updatedAt = new \Datetime();
        $this->responses = new ArrayCollection();
    }

    public function __toString()
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

    public function getAuthor()
    {
        return $this->author;
    }

    public function setAuthor(User $author): self
    {
        $this->author = $author;

        return $this;
    }

    public function getQuestionnaire(): ?Questionnaire
    {
        return $this->questionnaire;
    }

    public function getStep(): ?QuestionnaireStep
    {
        return $this->questionnaire ? $this->questionnaire->getStep() : null;
    }

    public function setQuestionnaire(Questionnaire $questionnaire): self
    {
        $this->questionnaire = $questionnaire;

        return $this;
    }

    public function getResponsesQuestions(): Collection
    {
        $questionnaire = $this->getQuestionnaire();

        return $questionnaire ? $questionnaire->getRealQuestions() : new ArrayCollection();
    }

    public function setResponseOn(AbstractResponse $response)
    {
        $response->setReply($this);
    }

    /**
     * Tells if this object MUST be sent to Elasticsearch.
     * If FALSE, we force the removal from ES.
     */
    public function isIndexable(): bool
    {
        return false;
    }

    /**
     * The Elasticsearch Type name. Must exists in `src/Capco/AppBundle/Elasticsearch/mapping.yml`.
     */
    public static function getElasticsearchTypeName(): string
    {
        return 'reply';
    }

    /**
     * The JMS Serializer serialization groups.
     */
    public static function getElasticsearchSerializationGroups(): array
    {
        return ['Elasticsearch'];
    }
}
