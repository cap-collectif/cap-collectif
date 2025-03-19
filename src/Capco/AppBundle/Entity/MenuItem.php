<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Model\TranslatableInterface;
use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\TranslatableTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * MenuItem.
 *
 * @ORM\Table(name="menu_item")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\MenuItemRepository")
 */
class MenuItem implements TranslatableInterface, \Stringable
{
    use IdTrait;
    use TranslatableTrait;

    final public const TYPE_HEADER = 1;
    final public const TYPE_FOOTER = 2;

    public static $menuLabels = [
        self::TYPE_HEADER => 'menu.type.header',
        self::TYPE_FOOTER => 'global.footer',
    ];

    /**
     * @var Page
     *
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Page", inversedBy="MenuItems", cascade={"persist"})
     */
    private ?Page $Page = null;

    /**
     * @ORM\Column(name="is_enabled", type="boolean", options={"default": true})
     */
    private bool $isEnabled = true;

    /**
     * @ORM\Column(name="is_deletable", type="boolean", options={"default": true})
     */
    private bool $isDeletable = true;

    /**
     * @ORM\Column(name="is_fully_modifiable", type="boolean", options={"default": true})
     */
    private bool $isFullyModifiable = true;

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
        $this->updatedAt = new \DateTime();
        $this->associatedFeatures = null;
    }

    public function __toString(): string
    {
        return $this->getTitle() ?: 'New menu item';
    }

    public function setTitle(string $title): self
    {
        $this->translate(null, false)->setTitle($title);

        return $this;
    }

    public function getTitle(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getTitle();
    }

    public function setLink(?string $link = null): self
    {
        $this->translate(null, false)->setLink($link);

        return $this;
    }

    public function getLink(?string $locale = null, ?bool $fallbackToDefault = true): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getLink();
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

    public function getPage(): ?Page
    {
        return $this->Page;
    }

    public function setPage(?Page $page = null)
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

    public function setAssociatedFeatures(mixed $associatedFeatures)
    {
        $this->associatedFeatures = $associatedFeatures;
    }

    public static function getTranslationEntityClass(): string
    {
        return MenuItemTranslation::class;
    }
}
