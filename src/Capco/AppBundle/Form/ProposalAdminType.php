<?php

namespace Capco\AppBundle\Form;

use Symfony\Component\Form\FormBuilderInterface;

class ProposalAdminType extends ProposalType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('author', null, [
              'required' => false,
              'choice_label' => 'id',
            ])
        ;

        parent::buildForm($builder, $options);
    }
}
