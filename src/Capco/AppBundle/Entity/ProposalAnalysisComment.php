<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\ProposalAnalysisCommentRepository")
 */
class ProposalAnalysisComment extends Comment
{
    /**
     * @ORM\OneToOne(targetEntity="Capco\AppBundle\Entity\ProposalAnalysis")
     * @ORM\JoinColumn(name="proposal_analysis", referencedColumnName="id", onDelete="CASCADE")
     */
    private ProposalAnalysis $proposalAnalysis;

    public function __construct()
    {
        parent::__construct();
    }

    public function isCommentable(): bool
    {
        return true;
    }

    public function getRelatedObject(): ProposalAnalysis
    {
        return $this->proposalAnalysis;
    }

    public function setRelatedObject($object)
    {
        return null;
    }

    public function acceptNewComments(): bool
    {
        return true;
    }

    public function getProposalAnalysis(): ProposalAnalysis
    {
        return $this->proposalAnalysis;
    }

    public function setProposalAnalysis(ProposalAnalysis $proposalAnalysis): void
    {
        $this->proposalAnalysis = $proposalAnalysis;
    }

    public function getKind(): string
    {
        return 'proposalAnalysisComment';
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return array_merge(parent::getElasticsearchSerializationGroups(), ['ElasticsearchComment']);
    }
}
