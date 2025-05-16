<?php

namespace Capco\AppBundle\Entity\Debate;

use Capco\AppBundle\Entity\AbstractUserToken;
use Capco\AppBundle\Repository\Debate\DebateVoteTokenRepository;
use Capco\Capco\Facade\EntityInterface;
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
class DebateVoteToken extends AbstractUserToken implements EntityInterface
{
    public function __construct(User $user, /**
     * @ORM\ManyToOne(targetEntity=Debate::class)
     * @ORM\JoinColumn(nullable=false, onDelete="CASCADE")
     */
    private Debate $debate, ?string $token)
    {
        parent::__construct($user, $token);
    }

    public function getDebate(): Debate
    {
        return $this->debate;
    }
}
