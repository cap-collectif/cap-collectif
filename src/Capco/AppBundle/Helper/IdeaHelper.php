<?php

namespace Capco\AppBundle\Helper;

use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\IdeaVote;
use Capco\UserBundle\Entity\User;

class IdeaHelper
{
    public function hasUserVoted(Idea $idea, User $user = null)
    {
        if ($user !== null) {
            foreach ($idea->getVotes() as $vote) {
                if ($vote->getUser() === $user) {
                    return true;
                }
            }
        }

        return false;
    }

    public function findUserVoteOrCreate(Idea $idea, User $user = null)
    {
        if ($user === null) {
            return new IdeaVote($idea);
        }

        foreach ($idea->getVotes() as $vote) {
            if ($vote->getUser() === $user) {
                return $vote;
            }
        }

        return new IdeaVote($idea);
    }

    public function hasUserReported(Idea $idea, User $user = null)
    {
        if ($user !== null) {
            foreach ($idea->getReports() as $report) {
                if ($report->getReporter() === $user) {
                    return true;
                }
            }
        }

        return false;
    }
}
