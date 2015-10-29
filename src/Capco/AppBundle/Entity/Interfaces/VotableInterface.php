<?php

namespace Capco\AppBundle\Entity\Interfaces;

use Capco\AppBundle\Entity\AbstractVote;
use Doctrine\Common\Collections\ArrayCollection;

interface VotableInterface
{

  public function getVotes();
  public function setVotes(ArrayCollection $votes);
  public function addVote(AbstractVote $vote);
  public function removeVote(AbstractVote $vote);
}
