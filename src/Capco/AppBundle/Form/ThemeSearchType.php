<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;

use Capco\AppBundle\Entity\Theme;

class ThemeSearchType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('term', 'search', array(
                'required' => false
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
