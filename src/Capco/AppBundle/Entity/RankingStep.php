<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;

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
     * @ORM\Column(name="opinions_display_nb", type="integer")
     */
    private $opinionsDisplayNb = 10;

    /**
     * @var int
     *
     * @ORM\Column(name="versions_display_nb", type="integer")
     */
    private $versionsDisplayNb = 10;

    /**
     * @return int
     */
    public function getOpinionsDisplayNb()
    {
        return $this->opinionsDisplayNb;
    }

    /**
     * @param int $opinionsDisplayNb
     */
    public function setOpinionsDisplayNb($opinionsDisplayNb)
    {
        $this->opinionsDisplayNb = $opinionsDisplayNb;
    }

    /**
     * @return int
     */
    public function getVersionsDisplayNb()
    {
        return $this->versionsDisplayNb;
    }

    /**
     * @param int $versionsDisplayNb
     */
    public function setVersionsDisplayNb($versionsDisplayNb)
    {
        $this->versionsDisplayNb = $versionsDisplayNb;
    }

    // **************************** Custom methods *******************************

    public function getType()
    {
        return 'ranking';
    }

    public function isRankingStep()
    {
        return true;
    }
}
