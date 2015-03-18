<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\IdeaVote;
use Capco\UserBundle\Entity\User;

class IdeaHelper
{
    public function findUserVoteOrCreate(Idea $idea, User $user = null)
    {
        if ($user == null) {
            return new IdeaVote($idea);
        }

        foreach ($idea->getVotes() as $vote) {
            if ($vote->getUser() == $user) {
                return $vote;
            }
        }

        return new IdeaVote($idea);
    }
}
