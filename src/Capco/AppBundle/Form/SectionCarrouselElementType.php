<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Section\Section;
use Capco\AppBundle\Entity\Section\SectionCarrouselElement;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * @extends AbstractType<SectionCarrouselElement>
 */
class SectionCarrouselElementType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('id')
            ->add('type')
            ->add('title')
            ->add('description')
            ->add('buttonLabel')
            ->add('isDisplayed')
            ->add('position')
            ->add('redirectLink')
            ->add('image', RelayNodeType::class, ['class' => Media::class])
            ->add('section', RelayNodeType::class, ['class' => Section::class])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => SectionCarrouselElement::class,
        ]);
    }
}
