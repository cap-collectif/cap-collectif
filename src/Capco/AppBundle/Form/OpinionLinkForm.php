<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\FormBuilderInterface;

class OpinionLinkForm extends OpinionForm
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        parent::buildForm($builder, $options);
        $builder
            ->add('OpinionType', null, ['required' => true])
        ;
    }
}
