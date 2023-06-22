<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Repository\OfficialResponseRepository;
use Capco\AppBundle\Traits\BodyUsingJoditWysiwygTrait;
use Capco\AppBundle\Traits\NullableTextableTrait;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="official_response")
 * @ORM\Entity(repositoryClass=OfficialResponseRepository::class)
 */
class OfficialResponse
{
    use BodyUsingJoditWysiwygTrait;
    use NullableTextableTrait;
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="is_published", type="boolean", options={"default": false})
     */
    private bool $isPublished = false;

    /**
     * @ORM\Column(name="published_at", type="datetime", nullable=true)
     */
    private ?\DateTime $publishedAt = null;

    /**
     * @Gedmo\Timestampable(on="change", field={"title", "body"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private \DateTime $updatedAt;

    /**
     * @ORM\OneToOne(targetEntity=Proposal::class, inversedBy="officialResponse")
     * @ORM\JoinColumn(nullable=false, onDelete="CASCADE")
     */
    private Proposal $proposal;

    /**
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\OfficialResponseAuthor", cascade={"persist", "remove"}, mappedBy="officialResponse", orphanRemoval=true)
     * @ORM\JoinTable(name="official_response_author",
     *      joinColumns={@ORM\JoinColumn(name="official_response_id", referencedColumnName="id", onDelete="CASCADE")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE")}
     *      )
     */
    private Collection $authors;

    /**
     * @ORM\OneToOne(targetEntity=ProposalDecision::class, mappedBy="officialResponse", cascade={"persist", "remove"})
     */
    private ProposalDecision $proposalDecision;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
        $this->authors = new ArrayCollection();
    }

    public function __toString()
    {
        return $this->getId() ?? 'New Official response';
    }

    public function getProposal(): ?Proposal
    {
        return $this->proposal;
    }

    public function setProposal(Proposal $proposal): self
    {
        $this->proposal = $proposal;

        return $this;
    }

    public function addAuthor(OfficialResponseAuthor $officialResponseAuthor): self
    {
        if (
            !$this->authors->contains($officialResponseAuthor) &&
            !$this->containAuthor($officialResponseAuthor->getAuthor())
        ) {
            $this->authors->add($officialResponseAuthor);
        }

        return $this;
    }

    public function containAuthor(?Author $author): bool
    {
        if (!$author) {
            return false;
        }
        /** @var OfficialResponseAuthor $officialResponseAuthor */
        foreach ($this->authors as $officialResponseAuthor) {
            if ($officialResponseAuthor->getAuthor() === $author) {
                return true;
            }
        }

        return false;
    }

    public function getOfficialResponseAuthor(Author $author): ?OfficialResponseAuthor
    {
        /** @var OfficialResponseAuthor $officialResponseAuthor */
        foreach ($this->authors as $officialResponseAuthor) {
            if ($officialResponseAuthor->getAuthor() === $author) {
                return $officialResponseAuthor;
            }
        }

        return null;
    }

    public function removeAuthor(OfficialResponseAuthor $author): self
    {
        if ($this->authors->contains($author)) {
            $this->authors->removeElement($author);
        }

        return $this;
    }

    public function setAuthors(?ArrayCollection $authors): self
    {
        $this->authors = $authors ?? new ArrayCollection([]);

        return $this;
    }

    public function getAuthors(): Collection
    {
        return $this->authors;
    }

    public function getAuthorsObject(): Collection
    {
        return $this->authors->map(function (OfficialResponseAuthor $author) {
            return $author->getAuthor();
        });
    }

    public function setIsPublished(bool $isPublished): self
    {
        if (!$this->isPublished && $isPublished) {
            $this->setPublishedAt(new \DateTime());
        } elseif ($this->isPublished && !$isPublished) {
            $this->setPublishedAt(null);
        }

        $this->isPublished = $isPublished;

        return $this;
    }

    public function isPublished(): bool
    {
        return $this->isPublished;
    }

    public function setPublishedAt(?\DateTime $publishedAt): self
    {
        $this->publishedAt = $publishedAt;

        return $this;
    }

    public function getPublishedAt(): ?\DateTime
    {
        return $this->publishedAt;
    }

    public function publishNow(): self
    {
        $this->isPublished = true;
        $this->publishedAt = new \DateTime();

        return $this;
    }

    public function setUpdatedAt(\DateTime $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    public function getProposalDecision(): ?ProposalDecision
    {
        return $this->proposalDecision;
    }

    public function setProposalDecision(ProposalDecision $proposalDecision): self
    {
        $this->proposalDecision = $proposalDecision;

        // set the owning side of the relation if necessary
        if ($proposalDecision->getOfficialResponse() !== $this) {
            $proposalDecision->setOfficialResponse($this);
        }

        return $this;
    }
}
