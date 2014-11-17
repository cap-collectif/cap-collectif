<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * SiteParameter
 *
 * @ORM\Table(name="site_parameter")
 * @ORM\Entity
 */
class SiteParameter
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="keyname", type="string", length=255)
     */
    private $keyname;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255)
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="value", type="text")
     */
    private $value;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set keyname
     *
     * @param string $keyname
     * @return SiteParameter
     */
    public function setKeyname($keyname)
    {
        $this->keyname = $keyname;

        return $this;
    }

    /**
     * Get keyname
     *
     * @return string
     */
    public function getKeyname()
    {
        return $this->keyname;
    }

    /**
     * Set title
     *
     * @param string $title
     * @return SiteParameter
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set value
     *
     * @param string $value
     * @return SiteParameter
     */
    public function setValue($value)
    {
        $this->value = $value;

        return $this;
    }

    /**
     * Get value
     *
     * @return string
     */
    public function getValue()
    {
        return $this->value;
    }

    /**
     * Get updatedAt
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }
}
