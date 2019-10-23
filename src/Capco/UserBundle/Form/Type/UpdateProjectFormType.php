<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectType;
use Capco\AppBundle\Entity\Theme;
use Capco\MediaBundle\Entity\Media;
use Symfony\Component\Form\AbstractType;
use Capco\AppBundle\Entity\ProjectAuthor;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\NumberType;

class UpdateProjectFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', PurifiedTextType::class, [
                'required' => true,
                'purify_html' => true,
                'strip_tags' => true,
                'purify_html_profile' => 'default'
            ])
            ->add('authors', EntityType::class, [
                'class' => ProjectAuthor::class,
                'multiple' => true,
                'choice_label' => 'id'
            ])
            ->add('projectType', EntityType::class, [
                'required' => false,
                'class' => ProjectType::class
            ])
            ->add('opinionTerm', NumberType::class, [
                'required' => true
            ])
            ->add('isExternal')
            ->add('externalLink', TextType::class, [])
            ->add('externalParticipantsCount', NumberType::class, [])
            ->add('externalContributionsCount', NumberType::class, [])
            ->add('externalVotesCount', NumberType::class, [])
            ->add('publishedAt', DateTimeType::class, [
                'required' => true,
                'widget' => 'single_text',
                'format' => 'Y-MM-dd HH:mm:ss'
            ])
            ->add('themes', EntityType::class, [
                'class' => Theme::class,
                'multiple' => true,
                'choice_label' => 'id'
            ])
            ->add('Cover', EntityType::class, [
                'required' => false,
                'class' => Media::class
            ])
            ->add('video', TextType::class, [
                'required' => false
            ]);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['data_class' => Project::class, 'csrf_protection' => false]);
    }
}
