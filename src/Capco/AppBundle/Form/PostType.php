<?php

namespace Capco\AppBundle\Form;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Form\Type\RelayNodeType;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Sonata\AdminBundle\Form\Type\CollectionType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class PostType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('translations', TranslationCollectionType::class, [
                'fields' => ['title', 'abstract', 'body', 'metaDescription', 'locale'],
                'fields_options' => [
                    'body' => [
                        'required' => true,
                        'purify_html' => true,
                        'purify_html_profile' => 'default',
                    ],
                    'title' => [
                        'required' => true,
                    ],
                    'abstract' => [
                        'required' => false,
                    ],
                    'metaDescription' => [
                        'required' => false,
                    ],
                ],
            ])
            ->add('displayedOnBlog', CheckboxType::class, [
                'required' => true,
            ])
            ->add('isPublished', CheckboxType::class, [
                'required' => true,
            ])
            ->add('publishedAt', DateTimeType::class, [
                'required' => true,
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss',
            ])
            ->add('commentable', CheckboxType::class, [
                'required' => true,
            ])
            ->add('customCode', TextareaType::class, [
                'required' => false,
            ])
            ->add('media', RelayNodeType::class, [
                'class' => Media::class,
            ])
            ->add('projects', CollectionType::class, [
                'entry_type' => RelayNodeType::class,
                'entry_options' => ['class' => Project::class],
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
            ])
            ->add('proposals', CollectionType::class, [
                'entry_type' => RelayNodeType::class,
                'entry_options' => ['class' => Proposal::class],
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
            ])
            ->add('Authors', CollectionType::class, [
                'entry_type' => RelayNodeType::class,
                'entry_options' => ['class' => User::class],
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
            ])
            ->add('themes', CollectionType::class, [
                'entry_type' => RelayNodeType::class,
                'entry_options' => ['class' => Theme::class],
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => Post::class,
            'csrf_protection' => false,
        ]);
    }
}
