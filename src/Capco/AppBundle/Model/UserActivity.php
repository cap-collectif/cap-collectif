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

    public function getUsername()
    {
        return $this->username;
    }

    public function setUsername($username)
    {
        $this->username = $username;

        return $this;
    }

    public function getEmail()
    {
        return $this->email;
    }

    public function setEmail($email)
    {
        $this->email = $email;

        return $this;
    }

    public function getId()
    {
        return $this->id;
    }

    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

    public function getUserProposals(): array
    {
        return $this->userProposals;
    }

    public function setUserProposals(array $userProposals)
    {
        $this->userProposals = $userProposals;

        return $this;
    }

    public function addUserProposal($userProposal)
    {
        $this->userProposals[] = $userProposal;

        return $this;
    }

    public function getLastname()
    {
        return $this->lastname;
    }

    public function setLastname($lastname)
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getFirstname()
    {
        return $this->firstname;
    }

    public function setFirstname($firstname)
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function getUserProjects(): array
    {
        return $this->userProjects;
    }

    public function removeUserProject($projectId)
    {
        unset($this->userProjects[$projectId]);

        return $this;
    }

    public function getUserProject($project)
    {
        return $this->userProjects[$project];
    }

    public function setUserProjects(array $userProjects)
    {
        $this->userProjects = $userProjects;

        return $this;
    }

    public function addUserProject($userProject, $projectId)
    {
        $this->userProjects[$projectId] = $userProject;

        return $this;
    }

    public function hasUserProject()
    {
        return count($this->userProjects) > 0;
    }

    public function hasProposal()
    {
        return count($this->userProposals) > 0;
    }

    public function setNotifiedOf(string $notifiedOf): self
    {
        if (!in_array($notifiedOf, self::NOTIFICATIONS, true)) {
            throw new InvalidArgumentException(sprintf('%s is not valide value for notified of follower %s -> %s', $notifiedOf, $this->getId(), $this->getUsername()));
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
}
