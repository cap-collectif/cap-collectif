<?php

namespace Capco\AppBundle\Entity\Debate;

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
class DebateVoteToken
{
    private const TOKEN_LENGTH = 64;

    /**
     * @ORM\Column(type="string", length=255)
     * @ORM\Id
     */
    private string $token;

    /**
     * @ORM\ManyToOne(targetEntity=User::class)
     * @ORM\JoinColumn(nullable=false)
     */
    private User $user;

    /**
     * @ORM\ManyToOne(targetEntity=Debate::class)
     * @ORM\JoinColumn(nullable=false)
     */
    private Debate $debate;

    public function __construct(User $user, Debate $debate)
    {
        $this->user = $user;
        $this->debate = $debate;
        $this->token = bin2hex(random_bytes(self::TOKEN_LENGTH));
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function getDebate(): Debate
    {
        return $this->debate;
    }

    public function getToken(): string
    {
        return $this->token;
    }
}
