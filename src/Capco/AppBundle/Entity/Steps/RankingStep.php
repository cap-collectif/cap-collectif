<?php

namespace Capco\AppBundle\Entity\Steps;

use Doctrine\ORM\Mapping as ORM;

/**
 * Class RankingStep.
 *
 * @ORM\Entity()
 */
class RankingStep extends AbstractStep
{
    /**
     * @var int
     *
     * @ORM\Column(name="nb_opinions_to_display", type="integer")
     */
    private $nbOpinionsToDisplay = 10;

    /**
     * @var int
     *
     * @ORM\Column(name="nb_versions_to_display", type="integer")
     */
    private $nbVersionsToDisplay = 10;

    /**
     * @return int
     */
    public function getNbOpinionsToDisplay()
    {
        return $this->nbOpinionsToDisplay;
    }

    /**
     * @param int $nbOpinionsToDisplay
     */
    public function setNbOpinionsToDisplay($nbOpinionsToDisplay)
    {
        $this->nbOpinionsToDisplay = $nbOpinionsToDisplay;
    }

    /**
     * @return int
     */
    public function getNbVersionsToDisplay()
    {
        return $this->nbVersionsToDisplay;
    }

    /**
     * @param int $nbVersionsToDisplay
     */
    public function setNbVersionsToDisplay($nbVersionsToDisplay)
    {
        $this->nbVersionsToDisplay = $nbVersionsToDisplay;
    }

    // **************************** Custom methods *******************************

    public function getType()
    {
        return 'ranking';
    }

    public function isRankingStep(): bool
    {
        return true;
    }
}
