<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\FormBuilderInterface;

class OpinionLinkForm extends OpinionForm
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder
            ->add('OpinionType', null, ['required' => true])
        ;
    }

    /**
     * @return string
     */
    public function getName() : string
    {
        return 'opinion_link';
    }
}
