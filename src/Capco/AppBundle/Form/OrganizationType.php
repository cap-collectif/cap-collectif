<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\MediaBundle\Entity\Media;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class OrganizationType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('translations', TranslationCollectionType::class, [
                'fields' => ['title', 'body', 'locale'],
                'fields_options' => [
                    'body' => [
                        'purify_html' => true,
                        'purify_html_profile' => 'admin',
                    ]
                ],
            ])
            ->add('logo', EntityType::class, [
                'class' => Media::class,
            ])
            ->add('banner', EntityType::class, [
                'class' => Media::class,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Organization::class,
            'csrf_protection' => false,
        ]);
    }
}
