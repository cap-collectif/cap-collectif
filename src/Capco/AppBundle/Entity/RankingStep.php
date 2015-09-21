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
     * @ORM\Column(name="max_opinions", type="integer", nullable=true)
     */
    private $maxOpinions = null;

    /**
     * @var int
     *
     * @ORM\Column(name="max_versions", type="integer", nullable=true)
     */
    private $maxVersions = null;

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
    public function getMaxOpinions()
    {
        return $this->maxOpinions;
    }

    /**
     * @param int $maxOpinions
     */
    public function setMaxOpinions($maxOpinions)
    {
        $this->maxOpinions = $maxOpinions;
    }

    /**
     * @return int
     */
    public function getMaxVersions()
    {
        return $this->maxVersions;
    }

    /**
     * @param int $maxVersions
     */
    public function setMaxVersions($maxVersions)
    {
        $this->maxVersions = $maxVersions;
    }

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
