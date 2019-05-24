<?php

namespace Capco\UserBundle\Form\Type;

use Capco\AppBundle\Entity\Project;
use Symfony\Component\Form\AbstractType;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ProjectFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('title', PurifiedTextType::class, [
            'required' => true,
            'purify_html' => true,
            'strip_tags' => true,
            'purify_html_profile' => 'default',
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(['data_class' => Project::class]);
    }
}
