<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\IdTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * MenuItem.
 *
 * @ORM\Table(name="menu_item")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\MenuItemRepository")
 */
class MenuItem
{
    use IdTrait;

    const TYPE_HEADER = 1;
    const TYPE_FOOTER = 2;

    public static $menuLabels = [
         self::TYPE_HEADER => 'menu.type.header',
         self::TYPE_FOOTER => 'menu.type.footer',
    ];

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255)
     */
    private $title;

    /**
     * @var string
     *
     * @ORM\Column(name="link", type="string", length=255, nullable=true)
     */
    private $link;

    /**
     * @var Page
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Page", inversedBy="MenuItems", cascade={"persist"})
     */
    private $Page;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_deletable", type="boolean")
     */
    private $isDeletable = true;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_fully_modifiable", type="boolean")
     */
    private $isFullyModifiable = true;

    /**
     * @var int
     * @Gedmo\SortablePosition
     * @ORM\Column(name="position", type="integer")
     */
    private $position;

    /**
     * @var MenuItem
     *
     * @Gedmo\SortableGroup
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\MenuItem")
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id", onDelete="SET NULL")
     */
    private $parent;

    /**
     * @var \DateTime
     *
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     *
     * @Gedmo\Timestampable(on="change", field={"title", "link", "Page", "position", "parent", "menu"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @var int
     * @ORM\Column(name="menu", type="integer")
     */
    private $menu;

    /**
     * @var
     * @ORM\Column(name="associated_features", type="simple_array", nullable=true)
     */
    private $associatedFeatures;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->updatedAt = new \Datetime();
        $this->associatedFeatures = null;
    }

    public function __toString()
    {
        return $this->getId() ? $this->getTitle() : 'New menu item';
    }

    /**
     * Set title.
     *
     * @param string $title
     *
     * @return MenuItem
     */
    public function setTitle($title)
    {
        $this->title = $title;

        return $this;
    }

    /**
     * Get title.
     *
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set link.
     *
     * @param string $link
     *
     * @return MenuItem
     */
    public function setLink($link)
    {
        $this->link = $link;

        return $this;
    }

    /**
     * Get link.
     *
     * @return string
     */
    public function getLink()
    {
        return $this->link;
    }

    /**
     * Set isEnabled.
     *
     * @param bool $isEnabled
     *
     * @return MenuItem
     */
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    /**
     * Get isEnabled.
     *
     * @return bool
     */
    public function getIsEnabled()
    {
        return $this->isEnabled;
    }

    /**
     * Set isDeletable.
     *
     * @param bool $isDeletable
     *
     * @return MenuItem
     */
    public function setIsDeletable($isDeletable)
    {
        $this->isDeletable = $isDeletable;

        return $this;
    }

    /**
     * Get isDeletable.
     *
     * @return bool
     */
    public function getIsDeletable()
    {
        return $this->isDeletable;
    }

    /**
     * Set isFullyModifiable.
     *
     * @param bool $isFullyModifiable
     *
     * @return MenuItem
     */
    public function setIsFullyModifiable($isFullyModifiable)
    {
        $this->isFullyModifiable = $isFullyModifiable;

        return $this;
    }

    /**
     * Get isFullyModifiable.
     *
     * @return bool
     */
    public function getIsFullyModifiable()
    {
        return $this->isFullyModifiable;
    }

    /**
     * Set position.
     *
     * @param int $position
     *
     * @return MenuItem
     */
    public function setPosition($position)
    {
        $this->position = $position;

        return $this;
    }

    /**
     * Get position.
     *
     * @return int
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * @return mixed
     */
    public function getMenu()
    {
        return $this->menu;
    }

    /**
     * @param $menu
     */
    public function setMenu($menu)
    {
        $this->menu = $menu;
    }

    /**
     * @return MenuItem
     */
    public function getParent()
    {
        return $this->parent;
    }

    /**
     * @param MenuItem $parent
     */
    public function setParent($parent)
    {
        $this->parent = $parent;
    }

    /**
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * Set createdAt.
     *
     * @param \DateTime $createdAt
     *
     * @return MenuItem
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    /**
     * Set updatedAt.
     *
     * @param \DateTime $updatedAt
     *
     * @return MenuItem
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * @return Page
     */
    public function getPage()
    {
        return $this->Page;
    }

    /**
     * @param Page $page
     */
    public function setPage($page)
    {
        $this->Page = $page;
        if (null !== $this->getPage()) {
            $this->Page->addMenuItem($this);
        }
    }

    /**
     * @ORM\PreRemove
     */
    public function deleteMenuItem()
    {
        if (null !== $this->Page) {
            $this->Page->removeMenuItem($this);
        }
    }

    /**
     * @return mixed
     */
    public function getAssociatedFeatures()
    {
        return $this->associatedFeatures;
    }

    /**
     * @param mixed $associatedFeatures
     */
    public function setAssociatedFeatures($associatedFeatures)
    {
        $this->associatedFeatures = $associatedFeatures;
    }
}
