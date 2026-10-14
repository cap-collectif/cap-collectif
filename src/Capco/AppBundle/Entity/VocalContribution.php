<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Repository\VocalContributionRepository;
use Capco\AppBundle\Traits\CompletionStatusTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="vocal_contribution", indexes={
 *     @ORM\Index(name="idx_vocal_status_created", columns={"completion_status", "created_at"}),
 *     @ORM\Index(name="idx_vocal_user", columns={"user_id"}),
 *     @ORM\Index(name="idx_vocal_participant", columns={"participant_id"})
 * }, uniqueConstraints={
 *     @ORM\UniqueConstraint(name="uniq_vocal_media", columns={"media_id"})
 * })
 * @ORM\Entity(repositoryClass=VocalContributionRepository::class)
 */
class VocalContribution implements EntityInterface
{
    use CompletionStatusTrait;
    use UuidTrait;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private ?\DateTimeInterface $createdAt = null;

    /**
     * @ORM\OneToOne(targetEntity=Media::class)
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=false, onDelete="RESTRICT")
     */
    private Media $media;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?User $user = null;

    /**
     * @ORM\ManyToOne(targetEntity=Participant::class)
     * @ORM\JoinColumn(name="participant_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?Participant $participant = null;

    public function __construct()
    {
        $this->setMissingRequirementsStatus();
    }

    public function getCreatedAt(): ?\DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getMedia(): Media
    {
        return $this->media;
    }

    public function setMedia(Media $media): self
    {
        $this->media = $media;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;
        if (null !== $user) {
            $this->participant = null;
        }

        return $this;
    }

    public function getParticipant(): ?Participant
    {
        return $this->participant;
    }

    public function setParticipant(?Participant $participant): self
    {
        $this->participant = $participant;
        if (null !== $participant) {
            $this->user = null;
        }

        return $this;
    }

    public function setContributor(ContributorInterface $contributor): self
    {
        if ($contributor instanceof User) {
            return $this->setUser($contributor);
        }
        if ($contributor instanceof Participant) {
            return $this->setParticipant($contributor);
        }

        return $this;
    }
}
