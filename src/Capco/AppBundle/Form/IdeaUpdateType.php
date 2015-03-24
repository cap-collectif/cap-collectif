<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\FormBuilderInterface;

class IdeaUpdateType extends IdeaType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'capco_appbundle_ideaupdatetype';
    }
}
