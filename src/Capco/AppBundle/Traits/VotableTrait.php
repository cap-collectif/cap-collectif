<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait VotableTrait
{
    /**
     * @return int
     */
    public function getVoteCountAll()
    {
        return $this->voteCountNok + $this->voteCountOk + $this->voteCountMitige;
    }

    /**
     * @var int
     *
     * @ORM\Column(name="vote_count_nok", type="integer")
     */
    protected $voteCountNok = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="vote_count_ok", type="integer")
     */
    protected $voteCountOk = 0;

    /**
     * @var int
     *
     * @ORM\Column(name="vote_count_mitige", type="integer")
     */
    protected $voteCountMitige = 0;
    /**
     * @return int
     */
    public function getVoteCountNok()
    {
        return $this->voteCountNok;
    }

    /**
     * @param $voteCountNok
     *
     * @return $this
     */
    public function setVoteCountNok($voteCountNok)
    {
        $this->voteCountNok = $voteCountNok;
    }

    /**
     * @return int
     */
    public function getVoteCountOk()
    {
        return $this->voteCountOk;
    }

    /**
     * @param int $voteCountOk
     */
    public function setVoteCountOk($voteCountOk)
    {
        $this->voteCountOk = $voteCountOk;
    }

    /**
     * @return int
     */
    public function getVoteCountMitige()
    {
        return $this->voteCountMitige;
    }

    /**
     * @param int $voteCountMitige
     */
    public function setVoteCountMitige($voteCountMitige)
    {
        $this->voteCountMitige = $voteCountMitige;
    }
}
