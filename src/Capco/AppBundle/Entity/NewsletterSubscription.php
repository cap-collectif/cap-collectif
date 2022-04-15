<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\IdTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * NewsletterSubscription.
 *
 * @ORM\Table(name="newsletter_subscription")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\NewsletterSubscriptionRepository")
 */
class NewsletterSubscription
{
    use IdTrait;

    /**
     * @ORM\Column(name="email", type="string", length=255, unique=true, nullable=false)
     * @Assert\NotBlank()
     * @Assert\NotNull()
     * @Assert\Email()
     */
    private string $email;

    /**
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private \DateTime $createdAt;

    /**
     * @ORM\Column(name="is_enabled", type="boolean", options={"default": true})
     */
    private bool $isEnabled = true;

    public function __toString(): string
    {
        return $this->getId() ? $this->getEmail() : 'New newsletter';
    }

    public function setEmail($email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setIsEnabled(bool $isEnabled): self
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    public function getIsEnabled(): bool
    {
        return $this->isEnabled;
    }

    public function setCreatedAt(\DateTime $createdAt): self
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
