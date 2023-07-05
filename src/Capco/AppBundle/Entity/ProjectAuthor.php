<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Interfaces\Authorable;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * Project author.
 * This class purpose is to store additional datas on the project author
 * Ex: When a user or organization has been added as author.
 *
 * @ORM\Table(name="project_author")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProjectAuthorRepository")
 * @CapcoAssert\HasAuthor()
 */
class ProjectAuthor implements Authorable, Author
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Organization\Organization")
     * @ORM\JoinColumn(name="organization_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    protected ?Organization $organization = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private ?User $user = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Project", inversedBy="authors", cascade="persist")
     * @ORM\JoinColumn(name="project_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private Project $project;

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function setProject(Project $project): self
    {
        $this->project = $project;

        $project->addAuthor($this);

        return $this;
    }

    public function setAuthor(?Author $author): self
    {
        if ($author instanceof User) {
            $this->user = $author;
        }
        if ($author instanceof Organization) {
            $this->organization = $author;
        }

        return $this;
    }

    public function getAuthor(): ?Author
    {
        return $this->user ?: $this->organization;
    }

    public function getProject(): Project
    {
        return $this->project;
    }

    public function getOrganization(): ?Organization
    {
        return $this->organization;
    }

    public function setOrganization(?Organization $organization): self
    {
        $this->organization = $organization;

        return $this;
    }

    public function getSlug(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->getAuthor() ?? $this->getAuthor()->getSlug();
    }

    public function getUsername(): ?string
    {
        return $this->getAuthor() ?? $this->getAuthor()->getUsername();
    }

    public function getMedia(): ?Media
    {
        return $this->getAuthor()->getMedia();
    }
}
