<?php

namespace Capco\AppBundle\Entity\Organization;

use Capco\AppBundle\Model\TranslationInterface;
use Capco\AppBundle\Traits\SluggableTitleTrait;
use Capco\AppBundle\Traits\TranslationTrait;
use Capco\AppBundle\Traits\UuidTrait;
use Capco\AppBundle\Utils\Text;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Capco\AppBundle\Repository\Organization\OrganizationTranslationRepository")
 * @ORM\Table(
 *  name="organization_translation",
 *  uniqueConstraints={
 *    @ORM\UniqueConstraint(
 *      name="translation_unique",
 *      columns={"translatable_id", "locale"}
 *    )
 * })
 */
class OrganizationTranslation implements TranslationInterface
{
    use SluggableTitleTrait;
    use TranslationTrait;
    use UuidTrait;

    /**
     * @ORM\Column(name="body", type="text", nullable=true)
     */
    private ?string $body = null;

    public static function getTranslatableEntityClass(): string
    {
        return Organization::class;
    }

    public function getBody(): ?string
    {
        return $this->body;
    }

    public function getBodyText(): ?string
    {
        $result = Text::cleanNewline($this->body);

        return Text::htmlToString($result);
    }

    public function setBody(?string $body = null): self
    {
        $this->body = $body;

        return $this;
    }

    public function getBodyExcerpt(int $nb = 100): string
    {
        $excerpt = substr((string) $this->body, 0, $nb);
        $excerpt .= '…';

        return $excerpt;
    }

    public function getBodyTextExcerpt(int $nb = 100): string
    {
        $text = Text::htmlToString($this->getBody());

        if (\strlen($text) > $nb) {
            $text = substr($text, 0, $nb);
            $text .= '[…]';
        }

        return Text::htmlToString($text);
    }
}
