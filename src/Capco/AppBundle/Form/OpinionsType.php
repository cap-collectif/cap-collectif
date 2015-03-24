<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class OpinionsType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('title', 'text', array(
                'label' => 'opinion.form.title',
                'required' => true,
            ))
            ->add('body', 'ckeditor', array(
                'label' => 'opinion.form.body',
                'required' => true,
                'config_name' => 'user_editor',
            ))
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Capco\AppBundle\Entity\Opinion',
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
            'translation_domain' => 'CapcoAppBundle',
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_opinion';
    }
}
