<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

use Capco\AppBundle\Entity\Argument;

class ArgumentsSortType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('argumentSort', 'choice', array(
                'required' => false,
                'choices' => Argument::$sortCriterias,
                'translation_domain' => 'CapcoAppBundle',
                'label' => 'argument.sort.label',
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
        return 'capco_app_argument_sort';
    }
}
