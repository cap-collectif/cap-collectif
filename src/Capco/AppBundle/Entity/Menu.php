<?php

namespace Capco\AppBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * Menu
 *
 * @ORM\Table(name="menu")
 * @ORM\Entity
 */
class Menu
{

    const TYPE_HEADER = 1;
    const TYPE_FOOTER = 2;

    public static $types = array(
        self::TYPE_HEADER => 'menu.type.header',
        self::TYPE_FOOTER => 'menu.type.footer',
    );

    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var integer
     *
     * @ORM\Column(name="type", type="integer")
     */
    private $type;

    /**
     * @var \Doctrine\Common\Collections\ArrayCollection
     *
     * @ORM\OneToMany(targetEntity="Capco\AppBundle\Entity\MenuItem", mappedBy="Menu", cascade={"persist", "remove"})
     *
     */
    private $MenuItems;

    function __construct()
    {
        $this->type = self::TYPE_HEADER;
        $this->MenuItems = new ArrayCollection();
    }

    public function __toString()
    {
        return self::$types[$this->getType()];
    }

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
     * Set type
     *
     * @param string $type
     * @return Menu
     */
    public function setType($type)
    {
        $this->type = $type;

        return $this;
    }

    /**
     * Get type
     *
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @return MenuItem
     */
    public function getMenuItems()
    {
        return $this->MenuItems;
    }

    /**
     * @param Capco\AppBundle\Entity\MenuItem $MenuItem
     * @return Menu
     */
    public function addMenuItem(MenuItem $MenuItem)
    {
        $this->MenuItems[] = $MenuItem;

        return $this;
    }

    /**
     * @param Capco\AppBundle\Entity\MenuItem $MenuItem
     *
     */
    public function removeOpinionType(MenuItem $MenuItem)
    {
        $this->MenuItems->removeElement($MenuItem);
    }
}
