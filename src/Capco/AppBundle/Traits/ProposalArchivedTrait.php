<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Enum\ProposalArchivedUnitTime;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait ProposalArchivedTrait
{
    /**
     * @ORM\Column(name="proposal_archived_time", type="integer", nullable=false, options={"default" : 0})
     */
    private int $proposalArchivedTime = 0;

    /**
     * @ORM\Column(name="proposal_archived_unit_time", type="string", nullable=false, options={"default" : "MONTHS"})
     * @Assert\Choice(choices={"DAYS", "MONTHS"})
     */
    private string $proposalArchivedUnitTime = ProposalArchivedUnitTime::MONTHS;

    public function getProposalArchivedTime(): int
    {
        return $this->proposalArchivedTime;
    }

    public function setProposalArchivedTime(int $proposalArchivedTime): AbstractStep
    {
        $this->proposalArchivedTime = $proposalArchivedTime;

        return $this;
    }

    public function getProposalArchivedUnitTime(): string
    {
        return $this->proposalArchivedUnitTime;
    }

    public function setProposalArchivedUnitTime(string $proposalArchivedUnitTime): AbstractStep
    {
        $this->proposalArchivedUnitTime = $proposalArchivedUnitTime;

        return $this;
    }
}
