<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Capco\UserBundle\Entity\UserType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class UserTypeType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('translations', TranslationCollectionType::class, [
                'fields' => ['name', 'slug', 'locale'],
                'fields_options' => [
                    'name' => ['required' => true],
                    'slug' => ['required' => true],
                ],
            ])
            ->add('media', RelayNodeType::class, ['class' => Media::class])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => UserType::class,
            'csrf_protection' => false,
        ]);
    }
}
