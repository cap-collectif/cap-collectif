<?php

namespace Capco\AppBundle\Entity\Debate;

use Capco\AppBundle\Entity\AbstractUserToken;
use Capco\AppBundle\Repository\Debate\DebateVoteTokenRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\UniqueConstraint;

/**
 * @ORM\Table(
 *     name="debate_vote_token",
 *     uniqueConstraints={
 *        @UniqueConstraint(
 *            name="debate_vote_token_unique",
 *            columns={"debate_id", "user_id"}
 *        )
 *     }
 * )
 * @ORM\Entity(repositoryClass=DebateVoteTokenRepository::class)
 */
class DebateVoteToken extends AbstractUserToken
{
    /**
     * @ORM\ManyToOne(targetEntity=Debate::class)
     * @ORM\JoinColumn(nullable=false)
     */
    private Debate $debate;

    public function __construct(User $user, Debate $debate, ?string $token)
    {
        parent::__construct($user, $token);
        $this->debate = $debate;
    }

    public function getDebate(): Debate
    {
        return $this->debate;
    }
}
