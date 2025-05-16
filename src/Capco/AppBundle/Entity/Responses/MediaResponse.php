<?php

namespace Capco\AppBundle\Entity\Responses;

use Capco\AppBundle\Entity\Media;
use Capco\Capco\Facade\EntityInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\MediaResponseRepository")
 */
class MediaResponse extends AbstractResponse implements EntityInterface
{
    /**
     * @ORM\ManyToMany(
     *  targetEntity="Capco\AppBundle\Entity\Media",
     *  orphanRemoval=false
     * )
     * @ORM\JoinTable(
     *   name="responses_medias",
     *   joinColumns={@ORM\JoinColumn(name="response_id", referencedColumnName="id", onDelete="CASCADE")},
     *   inverseJoinColumns={@ORM\JoinColumn(name="media_id", referencedColumnName="id", unique=false, onDelete="CASCADE")}
     * )
     */
    protected $medias;

    public function __construct()
    {
        $this->medias = new ArrayCollection();
    }

    public function getMedias(): iterable
    {
        return $this->medias;
    }

    public function addMedia(Media $media): self
    {
        if (!$this->medias->contains($media)) {
            $this->medias->add($media);
        }

        return $this;
    }

    public function setMedias(iterable $medias): self
    {
        $this->medias = $medias;

        return $this;
    }

    public function getType(): string
    {
        return 'media';
    }
}
