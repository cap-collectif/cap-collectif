<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class ApiSourceType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', 'text', ['required' => true])
            ->add('body', 'textarea', ['required' => true])
            ->add('Category', null, ['required' => true])
            ->add('link', 'url', [
                'required'         => true,
                'default_protocol' => 'http',
            ])
        ;
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'csrf_protection'   => false,
            'data_class'        => 'Capco\AppBundle\Entity\Source',
            'validation_groups' => ['Default', 'link'],
        ]);
    }

    public function getName()
    {
        return '';
    }
}
