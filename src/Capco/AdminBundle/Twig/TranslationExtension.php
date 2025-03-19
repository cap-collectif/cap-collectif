<?php

namespace Capco\AdminBundle\Twig;

use Capco\AppBundle\Model\TranslatableInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

/**
 * @deprecated
 *
 * Use this extension to check if admin entity is translatable and enable sonata locale switcher in old admin pages.
 * You can remove it once sonata admin is no more used.
 */
class TranslationExtension extends AbstractExtension
{
    public function getFunctions()
    {
        return [new TwigFunction('is_translatable', $this->isTranslatable(...))];
    }

    public function isTranslatable($object): bool
    {
        return (\is_object($object)
            ? $object instanceof TranslatableInterface
            : \in_array(TranslatableInterface::class, class_implements($object)))
            && (!method_exists($object, 'isTranslatable') || (new $object())->isTranslatable());
    }
}
