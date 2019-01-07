<?php

namespace Capco\AppBundle\Traits;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

trait VoteTypeTrait
{
    public static $VOTE_TYPE_DISABLED = 0;
    public static $VOTE_TYPE_SIMPLE = 1;
    public static $VOTE_TYPE_BUDGET = 2;

    /**
     * @ORM\Column(name="votes_help_text", type="string", nullable=true)
     */
    private $votesHelpText;

    /**
     * @ORM\Column(name="votes_count", type="integer")
     */
    private $votesCount = 0;

    /**
     * @Assert\Choice(choices={0,1,2})
     * @ORM\Column(name="vote_type", type="integer")
     */
    private $voteType = 0;

    /**
     * @ORM\Column(name="budget", type="float", nullable=true)
     */
    private $budget;

    /**
     * @ORM\Column(name="votes_limit", type="integer", nullable=true)
     * @Assert\Length(min=1)
     */
    private $votesLimit;

    /**
     * @ORM\Column(name="votes_ranking", type="boolean", nullable=false, options={"default": false})
     */
    private $votesRanking = false;

    public static function getVoteTypeLabels()
    {
        return [
            'step.vote_type.disabled' => self::$VOTE_TYPE_DISABLED,
            'step.vote_type.simple' => self::$VOTE_TYPE_SIMPLE,
            'step.vote_type.budget' => self::$VOTE_TYPE_BUDGET,
        ];
    }

    public function isVotesRanking(): bool
    {
        return $this->votesRanking;
    }

    public function setVotesRanking(bool $value)
    {
        $this->votesRanking = $value;

        return $this;
    }

    public function getBudget()
    {
        return $this->budget;
    }

    public function setBudget(float $budget = null): self
    {
        $this->budget = $budget;

        return $this;
    }

    public function isNumberOfVotesLimitted(): bool
    {
        return null !== $this->votesLimit;
    }

    public function getVotesLimit()
    {
        return $this->votesLimit;
    }

    public function setVotesLimit(int $limit = null): self
    {
        $this->votesLimit = $limit;

        return $this;
    }

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
        return self::$VOTE_TYPE_DISABLED !== $this->voteType;
    }

    public function isBudgetVotable(): bool
    {
        return self::$VOTE_TYPE_BUDGET === $this->voteType;
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

    public function getVotesHelpText()
    {
        return $this->votesHelpText;
    }

    public function setVotesHelpText(string $votesHelpText = null): self
    {
        $this->votesHelpText = $votesHelpText;

        return $this;
    }
}
