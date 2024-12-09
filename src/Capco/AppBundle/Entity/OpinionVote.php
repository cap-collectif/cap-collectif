<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Command\Service\ExportInterface\ExportableContributionInterface;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OpinionVoteRepository")
 * @ORM\HasLifecycleCallbacks()
 */
class OpinionVote extends AbstractVote implements ExportableContributionInterface
{
    final public const VOTE_OK = 1;
    final public const VOTE_NOK = -1;
    final public const VOTE_MITIGE = 0;

    public static $voteTypes = [
        'ok' => self::VOTE_OK,
        'mitige' => self::VOTE_MITIGE,
        'nok' => self::VOTE_NOK,
    ];

    public static $voteTypesLabels = [
        self::VOTE_OK => 'global.ok',
        self::VOTE_MITIGE => 'global.mitige',
        self::VOTE_NOK => 'global.nok',
    ];

    public static $voteTypesStyles = [
        self::VOTE_OK => [
            'color' => 'success',
            'icon' => 'hand-like-2-1',
            'icon_checked' => 'hand-like-2',
        ],
        self::VOTE_NOK => [
            'color' => 'danger',
            'icon' => 'hand-unlike-2-1',
            'icon_checked' => 'hand-unlike-2',
        ],
        self::VOTE_MITIGE => [
            'color' => 'warning',
            'icon' => 'hand-like-2-1 icon-rotate',
            'icon_checked' => 'hand-like-2 icon-rotate',
        ],
    ];

    /**
     * @Gedmo\Timestampable(on="update", field={"value"})
     * @ORM\Column(name="updated_at", type="datetime", nullable=true)
     */
    protected $updatedAt;

    /**
     * @ORM\Column(name="value", type="integer")
     */
    private $value;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Opinion", inversedBy="votes", cascade={"persist"})
     * @ORM\JoinColumn(name="opinion_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $opinion;

    public function getRelated()
    {
        return $this->opinion;
    }

    public function getStep(): ?AbstractStep
    {
        return $this->getOpinion()->getStep();
    }

    public function getValue(): int
    {
        return $this->value;
    }

    public function setValue(int $value): self
    {
        $this->value = $value;

        return $this;
    }

    public function getOpinion(): Opinion
    {
        return $this->opinion;
    }

    public function setOpinion(Opinion $opinion): self
    {
        $this->opinion = $opinion;
        $this->opinion->addVote($this);

        return $this;
    }

    public function getProject(): ?Project
    {
        return $this->getOpinion()->getProject();
    }

    public function getConsultation(): ?Consultation
    {
        return $this->getRelated() ? $this->getRelated()->getConsultation() : null;
    }

    // ******************* Lifecycle ******************************

    /**
     * @ORM\PreRemove
     */
    public function deleteVote()
    {
        if (null !== $this->opinion) {
            $this->opinion->removeVote($this);
        }
    }

    public static function getElasticsearchSerializationGroups(): array
    {
        return array_merge(parent::getElasticsearchSerializationGroups(), [
            'ElasticsearchVoteNestedOpinion',
            'ElasticsearchVoteNestedConsultation',
        ]);
    }
}
