<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Entity\Project;
use Symfony\Component\Form\AbstractType;
use Capco\AppBundle\Entity\ProjectAuthor;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProjectAuthorsFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('authors', EntityType::class, [
            'class' => ProjectAuthor::class,
            'multiple' => true,
            'choice_label' => 'id',
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
