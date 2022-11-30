<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Interfaces\Author;
use Capco\AppBundle\Entity\Interfaces\Authorable;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Traits\AuthorableTrait;
use Doctrine\ORM\Mapping as ORM;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Validator\Constraints as CapcoAssert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

/**
 * @ORM\Table(name="official_response_author")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\OfficialResponseAuthorRepository")
 * @CapcoAssert\HasAuthor()
 * @UniqueEntity(
 *     fields={"author", "officialResponse"},
 *     errorPath="author",
 *     message="This author is already in use on that officialResponse."
 * )
 * @UniqueEntity(
 *     fields={"organization", "officialResponse"},
 *     errorPath="organization",
 *     message="This organization is already in use on that officialResponse."
 * )
 */
class OfficialResponseAuthor implements Authorable
{
    use AuthorableTrait;
    use UuidTrait;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", onDelete="CASCADE", nullable=true)
     */
    private ?User $author = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\OfficialResponse", inversedBy="authors", cascade="persist")
     * @ORM\JoinColumn(name="official_response_id", referencedColumnName="id", onDelete="CASCADE", nullable=false)
     */
    private OfficialResponse $officialResponse;

    public function setOfficialResponse(OfficialResponse $officialResponse): self
    {
        $this->officialResponse = $officialResponse;
        $officialResponse->addAuthor($this);

        return $this;
    }

    public function getOfficialResponse(): OfficialResponse
    {
        return $this->officialResponse;
    }

    public function getUsername(): ?string
    {
        return $this->getAuthor() ?? $this->getAuthor()->getUsername();
    }

    public function getOrganization(): ?Organization
    {
        return $this->organization;
    }

    public function setOrganization(?Organization $organization): self
    {
        $this->organization = $organization;

        return $this;
    }

    public static function create(OfficialResponse $officialResponse, Author $author): OfficialResponseAuthor
    {
        return (new self())->setOfficialResponse($officialResponse)->setAuthor($author);
    }
}
