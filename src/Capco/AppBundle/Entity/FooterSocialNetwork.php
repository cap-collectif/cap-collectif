<?php

namespace Capco\AppBundle\Entity;

use Capco\AppBundle\Traits\IdTrait;
use Capco\AppBundle\Traits\PositionableTrait;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * FooterSocialNetwork.
 *
 * @ORM\Table(name="footer_social_network")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\FooterSocialNetworkRepository")
 */
class FooterSocialNetwork
{
    use PositionableTrait;
    use IdTrait;

    public static $socialIcons = [
        'Site externe' => 'link-1',
        'Facebook' => 'facebook',
        'Twitter' => 'twitter',
        'Google+' => 'gplus',
        'RSS' => 'rss',
        'Pinterest' => 'pinterest',
        'Github' => 'github',
        'Linkedin' => 'linkedin',
        'Picasa' => 'picasa',
        'Vimeo' => 'vimeo',
        'Instagram' => 'instagram',
        'Flickr' => 'flickr',
        'Tumblr' => 'tumblr',
        'youtube' => 'youtube',
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
     * @ORM\Column(name="link", type="string", length=255)
     */
    private $link;

    /**
     * @var string
     *
     * @ORM\Column(name="style", type="string", length=20)
     */
    private $style;

    /**
     * @var bool
     *
     * @ORM\Column(name="is_enabled", type="boolean")
     */
    private $isEnabled = true;

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
     * @Gedmo\Timestampable(on="change", field={"title", "link", "style", "position"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->updatedAt = new \Datetime();
    }

    public function __toString()
    {
        return $this->getId() ? $this->getTitle() : 'New footer social network';
    }

    /**
     * Set title.
     *
     * @param string $title
     *
     * @return FooterSocialNetwork
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
     * @return FooterSocialNetwork
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
     * Set style.
     *
     * @param string $style
     *
     * @return FooterSocialNetwork
     */
    public function setStyle($style)
    {
        $this->style = $style;

        return $this;
    }

    /**
     * Get style.
     *
     * @return string
     */
    public function getStyle()
    {
        return $this->style;
    }

    /**
     * Set isEnabled.
     *
     * @param bool $isEnabled
     *
     * @return FooterSocialNetwork
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
     * Get createdAt.
     *
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * Get updatedAt.
     *
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
     * @return FooterSocialNetwork
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
     * @return FooterSocialNetwork
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }
}
