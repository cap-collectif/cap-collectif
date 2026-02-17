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
        if (null === $object) {
            return false;
        }

        if (\is_object($object)) {
            if (!$object instanceof TranslatableInterface) {
                return false;
            }

            return !method_exists($object, 'isTranslatable') || $object->isTranslatable();
        }

        if (\is_string($object)) {
            if (!\in_array(TranslatableInterface::class, class_implements($object))) {
                return false;
            }

            if (method_exists($object, 'isTranslatable')) {
                try {
                    return (new $object())->isTranslatable();
                } catch (\Throwable) {
                    return true;
                }
            }

            return true;
        }

        return false;
    }
}
