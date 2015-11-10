<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\AppBundle\Entity\AbstractVote;
use Doctrine\Common\Collections\Collection;

interface VotableInterface
{
    public function getVotes();
    public function setVotes(Collection $votes);
    public function addVote(AbstractVote $vote);
    public function removeVote(AbstractVote $vote);
    public function resetVotes();
}
