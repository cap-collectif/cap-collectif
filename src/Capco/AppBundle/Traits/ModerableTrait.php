<?php

namespace Capco\AppBundle\Traits;

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
}
