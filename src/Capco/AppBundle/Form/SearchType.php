<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class SearchType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('term', 'text', array(
                'required' => true,
                'label' => 'search.form.label.term',
                'translation_domain' => 'CapcoAppBundle',
            ))
            ->add('type', 'choice', array(
                'required' => false,
                'label' => 'search.form.label.type',
                'translation_domain' => 'CapcoAppBundle',
                'empty_value' => 'search.form.types.none',
                'choices' => [
                    'idea' => 'search.form.types.ideas',
                    'post' => 'search.form.types.posts',
                ]
            ))
        ;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_search';
    }
}
