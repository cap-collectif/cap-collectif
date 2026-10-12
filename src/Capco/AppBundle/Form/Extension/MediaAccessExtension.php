<?php

namespace Capco\AppBundle\Form\Extension;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Service\MediaAccessResolver;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\Exception\TransformationFailedException;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Security\Core\Security;

class MediaAccessExtension extends AbstractTypeExtension
{
    public function __construct(private readonly MediaAccessResolver $access, private readonly Security $security)
    {
    }

    public static function getExtendedTypes(): iterable
    {
        return [EntityType::class];
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        if (Media::class !== $options['class']) {
            return;
        }

        // Check resolved media before the collection merge listeners mutate managed associations.
        $builder->addEventListener(
            FormEvents::SUBMIT,
            function (FormEvent $event): void {
                $value = $event->getData();
                foreach (is_iterable($value) ? $value : [$value] as $media) {
                    if ($media instanceof Media && !$this->access->canView($media, $this->security->getUser())) {
                        throw new TransformationFailedException('This media is not accessible.');
                    }
                }
            },
            10
        );
    }
}
