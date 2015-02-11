<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

use Capco\AppBundle\Entity\Opinion;

class OpinionsSortType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('opinionsSort', 'choice', array(
                'required' => false,
                'choices' => Opinion::$sortCriterias,
                'translation_domain' => 'CapcoAppBundle',
                'label' => 'opinion.sort.label',
                'empty_value' => false,
                'attr' => array('onchange' => 'this.form.submit()')
            ))
        ;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_app_opinions_sort';
    }
}
