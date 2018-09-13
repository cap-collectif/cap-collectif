<?php

namespace Capco\AppBundle\Model;

use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Doctrine\DBAL\Exception\InvalidArgumentException;

class UserActivity implements FollowerNotifiedOfInterface
{
    protected $username;
    protected $lastname;
    protected $firstname;
    protected $email;
    protected $id;
    protected $userProposals = [];
    protected $userProjects = [];
    protected $notifiedOf;
    protected $urlManagingFollowings;
    protected $userOpinions = [];

    public function getUsername(): string
    {
        return $this->username;
    }

    public function setUsername(string $username): self
    {
        $this->username = $username;

        return $this;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function setId($id): self
    {
        $this->id = $id;

        return $this;
    }

    public function getUserProposals(): array
    {
        return $this->userProposals;
    }

    public function setUserProposals(array $userProposals): self
    {
        $this->userProposals = $userProposals;

        return $this;
    }

    public function addUserProposal(string $proposalId, string $notifiedOf): self
    {
        $this->userProposals[$proposalId] = $notifiedOf;

        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(?string $lastname): self
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(?string $firstname): self
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function getUserProjects(): array
    {
        return $this->userProjects;
    }

    public function removeUserProject(string $projectId): self
    {
        unset($this->userProjects[$projectId]);

        return $this;
    }

    public function getUserProject(string $projectId): ?array
    {
        if (isset($this->userProjects[$projectId])) {
            return $this->userProjects[$projectId];
        }

        return null;
    }

    public function setUserProjects(array $userProjects): self
    {
        $this->userProjects = $userProjects;

        return $this;
    }

    public function addUserProject(array $userProject, string $projectId): self
    {
        $this->userProjects[$projectId] = $userProject;

        return $this;
    }

    public function hasUserProject(): bool
    {
        return \count($this->userProjects) > 0;
    }

    public function hasProposal(): bool
    {
        return \count($this->userProposals) > 0;
    }

    public function setNotifiedOf(string $notifiedOf): self
    {
        if (!\in_array($notifiedOf, self::NOTIFICATIONS, true)) {
            throw new InvalidArgumentException(
                sprintf(
                    '%s is not valide value for notified of follower %s -> %s',
                    $notifiedOf,
                    $this->getId(),
                    $this->getUsername()
                )
            );
        }
        $this->notifiedOf = $notifiedOf;

        return $this;
    }

    public function getNotifiedOf(): string
    {
        return $this->notifiedOf;
    }

    public function setUrlManagingFollowings(string $urlManagingFollowings): self
    {
        $this->urlManagingFollowings = $urlManagingFollowings;

        return $this;
    }

    public function getUrlManagingFollowings(): string
    {
        return $this->urlManagingFollowings;
    }

    public function getUserOpinions(): array
    {
        return $this->userOpinions;
    }

    public function setUserOpinions(array $userOpinions): self
    {
        $this->userOpinions = $userOpinions;

        return $this;
    }

    public function addUserOpinion(string $opinionId, string $notifiedOf): self
    {
        $this->userOpinions[$opinionId] = $notifiedOf;

        return $this;
    }

    public function hasOpinion(): bool
    {
        return \count($this->userOpinions) > 0;
    }
}
