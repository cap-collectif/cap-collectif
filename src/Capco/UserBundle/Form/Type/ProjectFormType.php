<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectType;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProjectFormType extends AbstractType
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
            ->add('projectType', EntityType::class, [
                'required' => false,
                'class' => ProjectType::class,
            ])
            ->add('locale', EntityType::class, [
                'required' => false,
                'class' => Locale::class,
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
