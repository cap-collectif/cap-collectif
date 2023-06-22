<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait SecretBallotTrait
{
    /**
     * @ORM\Column(name="secret_ballot", type="boolean", options={"default": false}, nullable=false)
     */
    private bool $secretBallot = false;

    /**
     * @ORM\Column(name="published_vote_date", type="datetime", nullable=true)
     */
    private ?\DateTimeInterface $publishedVoteDate = null;

    public function isSecretBallot(): bool
    {
        return $this->secretBallot;
    }

    public function setSecretBallot(bool $secretBallot): self
    {
        $this->secretBallot = $secretBallot;

        return $this;
    }

    public function getPublishedVoteDate(): ?\DateTimeInterface
    {
        return $this->publishedVoteDate;
    }

    public function setPublishedVoteDate(?\DateTimeInterface $publishedVoteDate): self
    {
        $this->publishedVoteDate = $publishedVoteDate;

        return $this;
    }

    public function canDisplayBallot(): bool
    {
        if (!$this->secretBallot) {
            return true;
        }
        $currentDate = new \DateTime();

        return $this->publishedVoteDate && $this->publishedVoteDate < $currentDate;
    }
}
