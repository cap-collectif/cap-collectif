<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait VoteSmsTrait
{
    /**
     * @ORM\Column(name="is_proposal_sms_vote_enabled", type="boolean", nullable=true)
     */
    private ?bool $isProposalSmsVoteEnabled = null;

    public function isProposalSmsVoteEnabled(): ?bool
    {
        return $this->isProposalSmsVoteEnabled;
    }

    public function setIsProposalSmsVoteEnabled(bool $isProposalSmsVoteEnabled): self
    {
        $this->isProposalSmsVoteEnabled = $isProposalSmsVoteEnabled;

        return $this;
    }
}
