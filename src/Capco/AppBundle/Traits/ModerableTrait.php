<?php

namespace Capco\AppBundle\Traits;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;

trait ModerableTrait
{
    /**
     * @ORM\Column(name="moderation_token", unique=true, type="string", nullable=false)
     */
    private $moderationToken = '';

    public function getModerationToken(): string
    {
        return $this->moderationToken;
    }

    public function setModerationToken(string $token): self
    {
        $this->moderationToken = $token;

        return $this;
    }

    public function userDidReport(?User $user = null): bool
    {
        foreach ($this->reports as $report) {
            if ($report->getReporter() === $user) {
                return true;
            }
        }

        return false;
    }

    public function isUserAuthor(?User $user = null): bool
    {
        return $user === $this->author;
    }
}
