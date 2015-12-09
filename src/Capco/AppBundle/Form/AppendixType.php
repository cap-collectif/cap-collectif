<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class AppendixType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('body', 'ckeditor', [
                'label'       => false,
                'required'    => false,
                'config_name' => 'user_editor',
            ])
            ->add('appendixType', null, [
                'required' => true,
                'attr' => [
                    'class' => 'hidden',
                ],
                'label_attr' => [
                    'class' => 'hidden'
                ],
            ])
        ;
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults([
            'data_class'         => 'Capco\AppBundle\Entity\OpinionAppendix',
            'csrf_protection'    => true,
            'csrf_field_name'    => '_token',
            'translation_domain' => 'CapcoAppBundle',
        ]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_appendix';
    }
}
