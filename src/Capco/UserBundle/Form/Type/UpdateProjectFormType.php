<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectAuthor;
use Capco\AppBundle\Entity\ProjectType;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Capco\AppBundle\Validator\Constraints\CheckExternalLink;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;

class UpdateProjectFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', PurifiedTextType::class, [
                'required' => true,
                'purify_html' => true,
                'strip_tags' => true,
                'purify_html_profile' => 'admin',
            ])
            ->add('authors', EntityType::class, [
                'class' => ProjectAuthor::class,
                'multiple' => true,
                'choice_label' => 'id',
            ])
            ->add('projectType', EntityType::class, [
                'required' => false,
                'class' => ProjectType::class,
            ])
            ->add('isExternal')
            ->add('externalLink', UrlType::class, [
                'constraints' => [new CheckExternalLink(), new NotBlank()],
            ])
            ->add('externalParticipantsCount', NumberType::class, [])
            ->add('externalContributionsCount', NumberType::class, [])
            ->add('externalVotesCount', NumberType::class, [])
            ->add('publishedAt', DateTimeType::class, [
                'required' => true,
                'widget' => 'single_text',
            ])
            ->add('themes', EntityType::class, [
                'class' => Theme::class,
                'multiple' => true,
                'choice_label' => 'id',
            ])
            ->add('cover', EntityType::class, [
                'required' => false,
                'class' => Media::class,
            ])
            ->add('video', TextType::class, [
                'required' => false,
            ])
            ->add('locale', EntityType::class, [
                'required' => false,
                'class' => Locale::class,
            ])
            ->add('address', PurifiedTextType::class, [
                'required' => false,
                'strip_tags' => true,
                'purify_html' => true,
                'purify_html_profile' => 'admin',
            ])
        ;
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['data_class' => Project::class, 'csrf_protection' => false]);
    }
}
