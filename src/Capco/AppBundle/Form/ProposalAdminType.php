<?php

namespace Capco\AppBundle\Form;

use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\FormBuilderInterface;

class ProposalAdminType extends ProposalType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('author', EntityType::class, [
              'class' => 'CapcoUserBundle:User',
              'required' => false,
              'property' => 'id',
            ])
        ;

        parent::buildForm($builder, $options);
    }
}
