<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Repository\AnalysisConfigurationProcessRepository;
use Capco\AppBundle\Traits\TimestampableTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * This entity represents an execution of an AnalysisConfiguration.
 *
 * @ORM\Entity(repositoryClass=AnalysisConfigurationProcessRepository::class)
 * @ORM\Table(name="analysis_configuration_process")
 */
class AnalysisConfigurationProcess implements EntityInterface
{
    use TimestampableTrait;
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity=AnalysisConfiguration::class, inversedBy="processes")
     * @ORM\JoinColumn(nullable=false)
     */
    private AnalysisConfiguration $analysisConfiguration;

    /**
     * @ORM\ManyToMany(targetEntity=ProposalDecision::class)
     */
    private Collection $decisions;

    public function __construct()
    {
        $this->decisions = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAnalysisConfiguration(): AnalysisConfiguration
    {
        return $this->analysisConfiguration;
    }

    public function setAnalysisConfiguration(AnalysisConfiguration $analysisConfiguration): self
    {
        $this->analysisConfiguration = $analysisConfiguration;

        return $this;
    }

    public function getDecisions(): Collection
    {
        return $this->decisions;
    }

    public function addDecision(ProposalDecision $decision): self
    {
        if (!$this->decisions->contains($decision)) {
            $this->decisions[] = $decision;
        }

        return $this;
    }
}
