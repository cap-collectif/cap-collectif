<?php

namespace Capco\AppBundle\Entity\Debate;

use Capco\AppBundle\Command\Service\ExportInterface\ExportableDebateContributionInterface;
use Capco\AppBundle\Entity\Interfaces\AnonymousParticipationInterface;
use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Interfaces\DebateArgumentInterface;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\DebateStep;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentRepository;
use Capco\AppBundle\Traits\AuthorInformationTrait;
use Capco\AppBundle\Traits\ContributionOriginTrait;
use Capco\AppBundle\Traits\DebatableTrait;
use Capco\AppBundle\Traits\ForAgainstTrait;
use Capco\AppBundle\Traits\ModerableTrait;
use Capco\AppBundle\Traits\PublishableTrait;
use Capco\AppBundle\Traits\ReportableTrait;
use Capco\AppBundle\Traits\TextableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\TokenTrait;
use Capco\AppBundle\Traits\TrashableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Traits\VotableOkTrait;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass=DebateAnonymousArgumentRepository::class)
 * @ORM\Table(name="debate_anonymous_argument")
 */
class DebateAnonymousArgument implements EntityInterface, DebateArgumentInterface, AnonymousParticipationInterface, ExportableDebateContributionInterface
{
    use AuthorInformationTrait;
    use ContributionOriginTrait;
    use DebatableTrait;
    use ForAgainstTrait;
    use ModerableTrait;
    use PublishableTrait;
    use ReportableTrait;
    use TextableTrait;
    use TimestampableTrait;
    use TokenTrait;
    use TrashableTrait;
    use UuidTrait;
    use VotableOkTrait;

    /**
     * @ORM\Column(name="consent_internal_communication", type="boolean", nullable=false, options={"default" = false})
     */
    protected bool $consentInternalCommunication = false;

    /**
     * @Gedmo\Timestampable(on="change", field={"body"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    private ?\DateTime $updatedAt = null;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\Reporting", mappedBy="debateAnonymousArgument", cascade={"persist", "remove"})
     */
    private Collection $reports;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Debate\Debate", inversedBy="anonymousArguments")
     * @ORM\JoinColumn(name="debate_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private Debate $debate;

    /**
     * @ORM\Column(name="username", type="string", length=255, nullable=true)
     */
    private ?string $username = null;

    /**
     * @ORM\Column(name="email", type="string", length=255, nullable=false)
     * @Assert\Email()
     */
    private string $email;

    public function __construct(Debate $debate)
    {
        $this->debate = $debate;
        $this->votes = new ArrayCollection();
        $this->reports = new ArrayCollection();
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(?string $username): self
    {
        $this->username = $username;

        return $this;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getStep(): ?DebateStep
    {
        if ($this->getDebate()) {
            return $this->getDebate()->getStep();
        }

        return null;
    }

    public function getKind(): string
    {
        return 'debateArgument';
    }

    public function getRelated(): Debate
    {
        return $this->debate;
    }

    public function getProject(): ?Project
    {
        if ($this->getStep()) {
            return $this->getStep()->getProject();
        }

        return null;
    }

    public function isUserAuthor(?User $user = null): bool
    {
        return false;
    }

    public function getAuthor(): ?Author
    {
        return null;
    }

    public function setAuthor(?Author $user): self
    {
        return $this;
    }

    public function isConsentInternalCommunication(): bool
    {
        return $this->consentInternalCommunication;
    }

    public function setConsentInternalCommunication(bool $consentInternalCommunication): self
    {
        $this->consentInternalCommunication = $consentInternalCommunication;

        return $this;
    }

    /** ES */
    public function isIndexable(): bool
    {
        return true;
    }

    public static function getElasticsearchTypeName(): string
    {
        return 'debateAnonymousArgument';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return ['ElasticsearchDebateArgument', 'ElasticsearchDebateArgumentNestedProject'];
    }

    public static function getElasticsearchPriority(): int
    {
        return 9;
    }
}
