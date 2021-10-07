<?php

namespace Capco\AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Capco\AppBundle\Traits\UuidTrait;
use Gedmo\Mapping\Annotation as Gedmo;
use Capco\AppBundle\Model\Translatable;
use Capco\AppBundle\Traits\TranslatableTrait;
use Capco\AppBundle\Traits\SonataTranslatableTrait;
use Capco\AppBundle\Model\SonataTranslatableInterface;
use Capco\AdminBundle\Validator\Constraints as CapcoAdminAssert;

/**
 * @ORM\Table(name="site_parameter")
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\SiteParameterRepository")
 * @CapcoAdminAssert\LessThanIfMetaDescription(max="160", message="argument.metadescription.max_length")
 */
class SiteParameter implements SonataTranslatableInterface, Translatable
{
    use SonataTranslatableTrait;
    use TranslatableTrait;
    use UuidTrait;
    public const NOT_TRANSLATABLE = [
        'homepage.jumbotron.margin',
        'projects.pagination',
        'themes.pagination',
        'contributors.pagination',
        'blog.pagination.size',
        'homepage.jumbotron.darken',
        'proposal.pagination',
        'homepage.jumbotron.share_button',
        'members.pagination.size',
        'admin.mail.notifications.send_name',
        'admin.mail.notifications.send_address',
        'admin.mail.notifications.receive_address',
        'snalytical-tracking-scripts-on-all-pages',
        'ad-scripts-on-all-pages',
        'admin.analytics.hotjarid',
        'contact.customcode',
        'members.customcode',
        'projects.customcode',
        'themes.customcode',
        'blog.customcode',
        'event.customcode',
        'registration.customcode',
        'homepage.customcode',
        'global.timezone',
        'global.site.embed_js',
        'events.map.country',
        'redirectionio.project.id',
    ];

    const TYPE_SIMPLE_TEXT = 0;
    const TYPE_RICH_TEXT = 1;
    const TYPE_INTEGER = 2;
    const TYPE_JS = 3;
    const TYPE_EMAIL = 4;
    const TYPE_INTERN_URL = 5;
    const TYPE_URL = 6;
    const TYPE_TEL_NB = 7;
    const TYPE_BOOLEAN = 8;
    const TYPE_SELECT = 9;

    public static $types = [
        'simple_text' => self::TYPE_SIMPLE_TEXT,
        'rich_text' => self::TYPE_RICH_TEXT,
        'integer' => self::TYPE_INTEGER,
        'javascript' => self::TYPE_JS,
        'email' => self::TYPE_EMAIL,
        'intern_url' => self::TYPE_INTERN_URL,
        'url' => self::TYPE_URL,
        'tel' => self::TYPE_TEL_NB,
        'boolean' => self::TYPE_BOOLEAN,
        'select' => self::TYPE_SELECT,
    ];

    /**
     * For non-translatable parameters, we set the value here.
     *
     * @ORM\Column(name="value", type="text", nullable=true)
     */
    private $value;

    /**
     * @ORM\Column(name="help_text", type="text", nullable=true)
     */
    private $helpText = '';

    /**
     * @ORM\Column(name="keyname", type="string", length=255)
     */
    private $keyname;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @Gedmo\Timestampable(on="change", field={"value"})
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @ORM\Column(name="is_enabled", type="boolean", options={"default": true})
     */
    private $isEnabled = true;

    /**
     * @ORM\Column(name="is_social_network_description", type="boolean", nullable=false, options={"default": false})
     */
    private $isSocialNetworkDescription = false;

    /**
     * @ORM\Column(name="position", type="integer")
     */
    private $position = 0;

    /**
     * @ORM\Column(name="type", type="integer")
     */
    private $type;

    /**
     * @ORM\Column(name="category", type="text")
     */
    private $category = 'settings.global';

    public function __construct()
    {
        $this->updatedAt = new \DateTime();
        $this->type = self::TYPE_SIMPLE_TEXT;
    }

    public function __toString()
    {
        return $this->getId() ? $this->getKeyname() : 'New parameter';
    }

    public static function getTranslationEntityClass(): string
    {
        return SiteParameterTranslation::class;
    }

    /**
     * Some site parameters are integers (eg: pagination value)
     * So we must choose if we translate or not.
     */
    public function isTranslatable(): bool
    {
        return !\in_array($this->keyname, self::NOT_TRANSLATABLE, true);
    }

    public function setValue($value, ?string $locale = null): self
    {
        if (!$this->isTranslatable()) {
            $this->value = $value;

            return $this;
        }

        $this->translate($locale, false)->setValue($value);

        return $this;
    }

    public function getValue(?string $locale = null)
    {
        if (!$this->isTranslatable()) {
            return $this->value;
        }

        return $this->translate($locale, false)->getValue();
    }

    public function getHelpText(): ?string
    {
        return $this->helpText;
    }

    public function setHelpText(?string $helpText = null): self
    {
        $this->helpText = $helpText;

        return $this;
    }

    public function setKeyname(string $keyname): self
    {
        $this->keyname = $keyname;

        return $this;
    }

    public function getKeyname(): string
    {
        return $this->keyname;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTime $updatedAt): self
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function setIsEnabled(bool $isEnabled): self
    {
        $this->isEnabled = $isEnabled;

        return $this;
    }

    public function getIsEnabled(): bool
    {
        return $this->isEnabled;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function getPosition(): int
    {
        return $this->position;
    }

    public function setPosition(int $position): self
    {
        $this->position = $position;

        return $this;
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getCategory(): string
    {
        return $this->category;
    }

    public function setCategory(string $category): self
    {
        $this->category = $category;

        return $this;
    }

    public function isSocialNetworkDescription(): bool
    {
        return $this->isSocialNetworkDescription;
    }

    public function setIsSocialNetworkDescription(bool $isSocialNetworkDescription): self
    {
        $this->isSocialNetworkDescription = $isSocialNetworkDescription;

        return $this;
    }
}
