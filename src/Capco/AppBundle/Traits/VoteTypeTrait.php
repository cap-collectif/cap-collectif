<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;

trait VoteTypeTrait
{
    public static $VOTE_TYPE_DISABLED = 0;
    public static $VOTE_TYPE_SIMPLE = 1;
    public static $VOTE_TYPE_BUDGET = 2;

    static function voteTypeLabels() {
        return [
            self::$VOTE_TYPE_DISABLED => 'step.vote_type.disabled',
            self::$VOTE_TYPE_SIMPLE => 'step.vote_type.simple',
            self::$VOTE_TYPE_BUDGET => 'step.vote_type.budget',
        ];
    }

    /**
     * @Assert\Choice(choices={0,1,2})
     * @ORM\Column(name="vote_type", type="integer")
     */
    private $voteType = 0;

    /**
     * @return mixed
     */
    public function getVoteType()
    {
        return $this->voteType;
    }

    /**
     * @param mixed $voteType
     *
     * @return $this
     */
    public function setVoteType($voteType)
    {
        $this->voteType = $voteType;

        return $this;
    }

    public function isVotable()
    {
        return $this->voteType !== self::$VOTE_TYPE_DISABLED;
    }

    public function isBudgetVotable()
    {
        return $this->voteType === self::$VOTE_TYPE_BUDGET;
    }
}
