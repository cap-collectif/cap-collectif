<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectType;
use Symfony\Component\Form\AbstractType;
use Capco\AppBundle\Entity\ProjectAuthor;
use Capco\AppBundle\Form\Type\PurifiedTextType;
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
                'purify_html_profile' => 'default',
            ])
            ->add('authors', EntityType::class, [
                'class' => ProjectAuthor::class,
                'multiple' => true,
                'choice_label' => 'id',
            ])
            ->add('projectType', EntityType::class, [
                'required' => true,
                'class' => ProjectType::class,
            ])
            ->add('opinionTerm', NumberType::class, [
                'required' => true,
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
