<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Repository\ActionTokenRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\ORM\Mapping\UniqueConstraint;

/**
 * @ORM\Table(
 *     name="action_token",
 *     uniqueConstraints={
 *        @UniqueConstraint(
 *            name="action_token_unique",
 *            columns={"action", "user_id"}
 *        )
 *     }
 * )
 * @ORM\Entity(repositoryClass=ActionTokenRepository::class)
 */
class ActionToken extends AbstractUserToken
{
    const UNSUBSCRIBE = 'unsubscribe';
    const AVAILABLE_ACTIONS = [self::UNSUBSCRIBE];

    /**
     * @ORM\Column(name="action", type="string", nullable=false)
     */
    private string $action;

    public function __construct(User $user, string $action, ?string $token = null)
    {
        parent::__construct($user, $token);
        $this->setAction($action);
    }

    public function setAction(string $action): self
    {
        self::checkAction($action);
        $this->action = $action;

        return $this;
    }

    public function getAction(): string
    {
        return $this->action;
    }

    private static function checkAction(string $action): void
    {
        if (!in_array($action, self::AVAILABLE_ACTIONS)) {
            throw new \Exception(__CLASS__ . " : $action is not a valid action");
        }
    }
}
