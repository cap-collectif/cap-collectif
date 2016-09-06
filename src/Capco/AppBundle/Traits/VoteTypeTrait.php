<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait VoteTypeTrait
{
    public static $VOTE_TYPE_DISABLED = 0;
    public static $VOTE_TYPE_SIMPLE = 1;
    public static $VOTE_TYPE_BUDGET = 2;

    static function getVoteTypeLabels() {
        return [
            self::$VOTE_TYPE_DISABLED => 'step.vote_type.disabled',
            self::$VOTE_TYPE_SIMPLE => 'step.vote_type.simple',
            self::$VOTE_TYPE_BUDGET => 'step.vote_type.budget',
        ];
    }

    /**
     * @ORM\Column(name="votes_count", type="integer")
     */
    private $votesCount = 0;

    /**
     * @Assert\Choice(choices={0,1,2})
     * @ORM\Column(name="vote_type", type="integer")
     */
    private $voteType = 0;

    public function getVoteType(): int
    {
        return $this->voteType;
    }

    public function setVoteType(int $voteType): self
    {
        $this->voteType = $voteType;

        return $this;
    }

    public function isVotable(): bool
    {
        return $this->voteType !== self::$VOTE_TYPE_DISABLED;
    }

    public function isBudgetVotable(): bool
    {
        return $this->voteType === self::$VOTE_TYPE_BUDGET;
    }

    public function getVotesCount(): int
    {
        return $this->votesCount ?? 0;
    }

    public function setVotesCount(int $votesCount): self
    {
        $this->votesCount = $votesCount;

        return $this;
    }

    public function incrementVotesCount(): self
    {
        ++$this->votesCount;

        return $this;
    }

    public function decrementVotesCount(): self
    {
        --$this->votesCount;

        return $this;
    }
}
